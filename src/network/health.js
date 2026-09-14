import { listHosts, updateHost } from "./hosts.js";
import { kvPutJson, kvGetJson } from "../storage/kv.js";

export async function checkHost(address, timeoutMs = 4000) {
  const start = Date.now();
  try {
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(address);
    if (isIp) {
      const sock = await import("cloudflare:sockets");
      const c = sock.connect({ hostname: address, port: 443 });
      const t = setTimeout(() => { try { c.close(); } catch (_) {} }, timeoutMs);
      try {
        const w = c.writable.getWriter();
        await Promise.race([
          w.ready,
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
        ]);
        try { w.releaseLock(); } catch (_) {}
        clearTimeout(t);
        try { c.close(); } catch (_) {}
        return { ok: true, ms: Date.now() - start, address };
      } catch (e) {
        clearTimeout(t);
        try { c.close(); } catch (_) {}
        return { ok: false, ms: Date.now() - start, address, error: e.message || "fail" };
      }
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch("https://" + address + "/", {
      method: "HEAD",
      redirect: "manual",
      signal: ctrl.signal,
    }).catch((e) => ({ error: e }));
    clearTimeout(t);
    return { ok: !!(r && !r.error), ms: Date.now() - start, address, status: r && r.status };
  } catch (e) {
    return { ok: false, ms: Date.now() - start, address, error: e.message || "error" };
  }
}

export async function runHostHealthScan(env, { disableUnhealthy = false, limit = 40 } = {}) {
  const hosts = await listHosts(env);
  const results = [];
  for (const h of hosts.slice(0, limit)) {
    const r = await checkHost(h.address);
    results.push({ id: h.id, ...r, enabled: h.enabled });
    if (disableUnhealthy && !r.ok && h.enabled) {
      try { await updateHost(env, h.id, { enabled: false }); } catch (_) {}
    }
  }
  const report = {
    at: new Date().toISOString(),
    total: results.length,
    healthy: results.filter((x) => x.ok).length,
    results,
  };
  await kvPutJson(env, "host_health_last", report);
  return report;
}

export async function getLastHealthReport(env) {
  return (await kvGetJson(env, "host_health_last", null)) || null;
}
