/**
 * WebSocket ↔ TCP tunnel for VLESS / Trojan (Cloudflare sockets)
 * Goal: reliable foreign-site access (TCP). UDP is not supported on Workers.
 */
import { parseVless } from "./vless.js";
import { parseTrojan, sha224Hex } from "./trojan.js";
import { listUsers } from "../users/user-service.js";
import { findUserByUuid, canAccessProxy, createQuotaAccumulator } from "../users/access.js";
import { touchDevice } from "../users/devices.js";
import { getNetworkSettings } from "../network/settings.js";
import { connectOutbound } from "../network/chain.js";

const stats = { ok: 0, fail: 0, auth: 0, active: 0 };
const uuidAct = Object.create(null);
const MAX_WS = 64;

export function getProxyStats() {
  return { ...stats, active: stats.active };
}

function concat(chunks) {
  let n = 0;
  for (const c of chunks) n += c.length;
  const o = new Uint8Array(n);
  let p = 0;
  for (const c of chunks) {
    o.set(c, p);
    p += c.length;
  }
  return o;
}

function toBytes(data) {
  if (!data) return new Uint8Array(0);
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return new Uint8Array(0);
}

function closeWs(ws, code, reason) {
  try {
    if (ws.readyState === 1 || ws.readyState === 0) ws.close(code || 1000, reason || "");
  } catch (_) {}
}

function safeSend(ws, data) {
  try {
    if (ws.readyState === 1) ws.send(data);
  } catch (_) {}
}

async function matchTrojan(env, hash) {
  const users = await listUsers(env, {});
  for (const u of users) {
    if (!u.active || !u.uuid) continue;
    if (sha224Hex(u.uuid) === hash) return u.uuid;
  }
  return null;
}

function wrapSocket(sock) {
  if (!sock) throw new Error("no socket");
  if (sock.readable && sock.writable) {
    return {
      readable: sock.readable,
      writable: sock.writable,
      close: () => {
        try {
          if (typeof sock.close === "function") sock.close();
        } catch (_) {}
      },
    };
  }
  throw new Error("bad socket shape");
}

export async function handleProxySession(ws, env) {
  if (stats.active >= MAX_WS) {
    closeWs(ws, 1013, "busy");
    return;
  }
  stats.active++;

  let remote = null;
  let writer = null;
  let parsed = false;
  let closed = false;
  let sid = null;
  let user = null;
  let quotaAcc = null;
  const early = [];

  function stop() {
    if (closed) return;
    closed = true;
    if (quotaAcc) {
      try {
        quotaAcc.end();
      } catch (_) {}
      quotaAcc = null;
    }
    if (stats.active > 0) stats.active--;
    if (sid && uuidAct[sid]) {
      uuidAct[sid]--;
      if (uuidAct[sid] <= 0) delete uuidAct[sid];
    }
    try {
      if (writer) writer.releaseLock();
    } catch (_) {}
    writer = null;
    try {
      if (remote && remote.close) remote.close();
    } catch (_) {}
    remote = null;
    closeWs(ws);
  }

  async function pumpRemoteToWs(readable) {
    const reader = readable.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (closed || ws.readyState !== 1) break;
        const bytes = toBytes(value);
        if (bytes.length) safeSend(ws, bytes);
      }
    } catch (_) {
    } finally {
      try {
        reader.releaseLock();
      } catch (_) {}
      stop();
    }
  }

  async function writeRemote(chunk) {
    if (!writer || closed) return;
    const bytes = toBytes(chunk);
    if (!bytes.length) return;
    if (quotaAcc) quotaAcc.add(bytes.length);
    try {
      await writer.write(bytes);
    } catch (_) {
      stop();
    }
  }

  ws.addEventListener("message", async (ev) => {
    if (closed) return;
    try {
      let data = toBytes(ev.data);
      if (!data.length && typeof ev.data === "string") return;

      if (!parsed) {
        early.push(data);
        const blob = concat(early);
        let p = parseVless(blob);
        let proto = "vless";

        if (!p && blob.length >= 58) {
          const tr = parseTrojan(blob);
          if (tr) {
            const matched = await matchTrojan(env, tr.hash);
            if (matched) {
              p = {
                protocol: "trojan",
                version: 0,
                uuid: matched,
                command: 1,
                port: tr.port,
                address: tr.address,
                payload: tr.payload,
              };
              proto = "trojan";
            }
          }
        }

        if (!p) {
          if (blob.length > 4096) {
            stats.fail++;
            stop();
          }
          return;
        }
        parsed = true;

        const net = await getNetworkSettings(env);
        if (proto === "vless" && net.enableVless === false) {
          closeWs(ws, 1008, "vless-off");
          return;
        }
        if (proto === "trojan" && net.enableTrojan === false) {
          closeWs(ws, 1008, "trojan-off");
          return;
        }

        if (p.command === 2) {
          stats.fail++;
          closeWs(ws, 1008, "udp-unsupported");
          return;
        }
        if (p.command !== 1 || !p.address || !p.port) {
          stats.fail++;
          closeWs(ws, 1008, "bad-cmd");
          return;
        }

        user = await findUserByUuid(env, p.uuid);
        const access = canAccessProxy(user);
        if (!access.ok) {
          stats.auth++;
          closeWs(ws, 1008, access.reason || "auth");
          return;
        }
        quotaAcc = createQuotaAccumulator(env, user.id, 262144);

        try {
          const lim = Math.min(16, Math.max(1, net.maxPerUser || 2));
          const fp = (p.uuid || "").slice(0, 8) + "-" + String((Date.now() / 3600000) | 0);
          const dev = await touchDevice(env, user.id, fp, lim + 4);
          if (!dev.ok) {
            stats.auth++;
            closeWs(ws, 1008, "device_limit");
            return;
          }
        } catch (_) {}

        const key = String(p.uuid).toLowerCase();
        const max = Math.min(16, Math.max(1, net.maxPerUser || 2));
        if ((uuidAct[key] || 0) >= max) {
          closeWs(ws, 1013, "limit");
          return;
        }
        uuidAct[key] = (uuidAct[key] || 0) + 1;
        sid = key;

        try {
          const sock = await connectOutbound(env, p.address, p.port);
          remote = wrapSocket(sock);
          writer = remote.writable.getWriter();
          try {
            await writer.ready;
          } catch (_) {}
          stats.ok++;
        } catch (_) {
          stats.fail++;
          closeWs(ws, 1011, "connect");
          stop();
          return;
        }

        if (proto === "vless") {
          safeSend(ws, new Uint8Array([p.version || 0, 0]));
        }

        if (p.payload && p.payload.length) {
          await writeRemote(p.payload);
        }

        pumpRemoteToWs(remote.readable);
        return;
      }

      await writeRemote(data);
    } catch (_) {
      stop();
    }
  });

  ws.addEventListener("close", () => stop());
  ws.addEventListener("error", () => stop());
}
