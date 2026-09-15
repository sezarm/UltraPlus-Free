import { listHosts, addHost } from "./hosts.js";
import { checkHost } from "./health.js";
import { kvPutJson, kvGetJson } from "../storage/kv.js";

export const RADAR_CANDIDATES = [
  "104.16.132.229", "104.16.133.229", "104.17.144.22", "104.17.145.22",
  "104.18.2.2", "104.18.3.2", "104.19.140.96", "104.19.141.96",
  "104.21.32.1", "104.21.48.1", "104.24.0.1", "104.24.1.1",
  "172.67.0.1", "172.67.128.1", "162.159.36.1", "162.159.46.1",
  "188.114.96.1", "188.114.97.1", "1.1.1.1", "1.0.0.1",
  "www.cloudflare.com", "cdnjs.cloudflare.com", "www.visa.com",
  "www.samsung.com", "www.microsoft.com", "www.apple.com",
  "cloudflare-dns.com", "workers.dev",
];

export async function getRadarReport(env) {
  return (await kvGetJson(env, "radar_last", null)) || null;
}

async function poolMap(items, concurrency, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) || 1 }, () => worker()));
  return out;
}

export async function runRadarScan(env, { addNew = true, maxCheck = 12, concurrency = 4 } = {}) {
  const existing = await listHosts(env);
  const known = new Set(existing.map((h) => h.address));
  const list = RADAR_CANDIDATES.slice(0, maxCheck);
  const results = await poolMap(list, concurrency, (address) => checkHost(address, 3000));
  if (addNew) {
    for (const r of results) {
      if (r.ok && !known.has(r.address)) {
        try {
          await addHost(env, {
            address: r.address,
            label: "radar:" + r.address,
            priority: 80,
            notes: "radar",
          });
          known.add(r.address);
        } catch (_) {}
      }
    }
  }
  for (const h of existing.slice(0, 8)) {
    if (results.some((x) => x.address === h.address)) continue;
    results.push({ ...(await checkHost(h.address, 2500)), id: h.id });
  }
  const report = {
    at: new Date().toISOString(),
    checked: results.length,
    healthy: results.filter((x) => x.ok).length,
    results,
  };
  await kvPutJson(env, "radar_last", report);
  return report;
}
