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

export async function runRadarScan(env, { addNew = true, maxCheck = 24 } = {}) {
  const existing = await listHosts(env);
  const known = new Set(existing.map((h) => h.address));
  const results = [];
  for (const address of RADAR_CANDIDATES.slice(0, maxCheck)) {
    const r = await checkHost(address, 3500);
    results.push(r);
    if (r.ok && addNew && !known.has(address)) {
      try {
        await addHost(env, { address, label: "radar:" + address, priority: 80, notes: "radar" });
        known.add(address);
      } catch (_) {}
    }
  }
  for (const h of existing.slice(0, 15)) {
    if (results.some((x) => x.address === h.address)) continue;
    results.push({ ...(await checkHost(h.address, 3000)), id: h.id });
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
