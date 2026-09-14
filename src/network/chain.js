/**
 * Outbound chain: optional SOCKS5 or HTTP CONNECT hop before destination
 */
import { getNetworkSettings } from "./settings.js";

function encodeSocks5Auth(user, pass) {
  const u = new TextEncoder().encode(user || "");
  const p = new TextEncoder().encode(pass || "");
  const buf = new Uint8Array(3 + u.length + p.length);
  buf[0] = 1;
  buf[1] = u.length;
  buf.set(u, 2);
  buf[2 + u.length] = p.length;
  buf.set(p, 3 + u.length);
  return buf;
}

function socks5ConnectReq(host, port) {
  const h = new TextEncoder().encode(host);
  const buf = new Uint8Array(7 + h.length);
  buf[0] = 5; buf[1] = 1; buf[2] = 0; buf[3] = 3; buf[4] = h.length;
  buf.set(h, 5);
  buf[5 + h.length] = (port >> 8) & 0xff;
  buf[6 + h.length] = port & 0xff;
  return buf;
}

async function readN(reader, n) {
  const out = new Uint8Array(n);
  let off = 0;
  while (off < n) {
    const { done, value } = await reader.read();
    if (done) throw new Error("chain EOF");
    const take = Math.min(value.length, n - off);
    out.set(value.subarray(0, take), off);
    off += take;
  }
  return out;
}

export async function connectOutbound(env, address, port) {
  const sock = await import("cloudflare:sockets");
  const st = await getNetworkSettings(env);
  const mode = (st.chainMode || "off").toLowerCase();
  if (mode === "off" || !st.chainHost) {
    return sock.connect({ hostname: address, port });
  }

  const chainPort = parseInt(st.chainPort, 10) || 1080;
  const remote = sock.connect({ hostname: st.chainHost, port: chainPort });
  const writer = remote.writable.getWriter();
  const reader = remote.readable.getReader();

  try {
    if (mode === "socks5") {
      const needAuth = !!(st.chainUser || st.chainPass);
      await writer.write(needAuth ? new Uint8Array([5, 2, 0, 2]) : new Uint8Array([5, 1, 0]));
      const g = await readN(reader, 2);
      if (g[0] !== 5) throw new Error("not socks5");
      if (g[1] === 2) {
        await writer.write(encodeSocks5Auth(st.chainUser, st.chainPass));
        const a = await readN(reader, 2);
        if (a[1] !== 0) throw new Error("socks auth failed");
      } else if (g[1] !== 0) throw new Error("socks method");
      await writer.write(socks5ConnectReq(address, port));
      const head = await readN(reader, 4);
      if (head[1] !== 0) throw new Error("socks connect refused");
      let skip = 0;
      if (head[3] === 1) skip = 6;
      else if (head[3] === 4) skip = 18;
      else if (head[3] === 3) {
        const lenBuf = await readN(reader, 1);
        skip = lenBuf[0] + 2;
      }
      if (skip > 0) await readN(reader, skip);
    } else if (mode === "http") {
      const auth =
        st.chainUser || st.chainPass
          ? "Proxy-Authorization: Basic " +
            btoa(unescape(encodeURIComponent((st.chainUser || "") + ":" + (st.chainPass || "")))) +
            "\r\n"
          : "";
      const req = `CONNECT ${address}:${port} HTTP/1.1\r\nHost: ${address}:${port}\r\n${auth}\r\n`;
      await writer.write(new TextEncoder().encode(req));
      let buf = new Uint8Array(0);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) throw new Error("http chain EOF");
        const n = new Uint8Array(buf.length + value.length);
        n.set(buf); n.set(value, buf.length); buf = n;
        const s = new TextDecoder().decode(buf);
        if (s.includes("\r\n\r\n")) {
          if (!/^HTTP\/1\.[01] 200/i.test(s)) throw new Error("http CONNECT failed");
          break;
        }
        if (buf.length > 8192) throw new Error("http header too large");
      }
    } else {
      writer.releaseLock();
      reader.releaseLock();
      return sock.connect({ hostname: address, port });
    }
  } catch (e) {
    try { writer.releaseLock(); } catch (_) {}
    try { reader.releaseLock(); } catch (_) {}
    try { remote.close(); } catch (_) {}
    throw e;
  }

  const readable = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (e) { controller.error(e); }
    },
    cancel() { try { reader.cancel(); } catch (_) {} },
  });
  const writable = new WritableStream({
    write(chunk) { return writer.write(chunk); },
    close() { return writer.close(); },
    abort(r) { return writer.abort(r); },
  });
  return { readable, writable, close: () => { try { remote.close(); } catch (_) {} } };
}
