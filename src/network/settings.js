import { kvGetJson, kvPutJson } from "../storage/kv.js";

const DEFAULTS = {
  path: "/",
  remark: "UP",
  sni: "",
  fp: "chrome",
  enableVless: true,
  enableTrojan: true,
  fragment: false,
  maxPerUser: 2,
  selection: "priority",
  dohUpstream: "https://1.1.1.1/dns-query",
};

export async function getNetworkSettings(env) {
  const stored = await kvGetJson(env, "network_settings", null);
  return Object.assign({}, DEFAULTS, stored || {});
}

export async function saveNetworkSettings(env, patch) {
  const cur = await getNetworkSettings(env);
  const next = {
    ...cur,
    path: String(patch.path ?? cur.path).trim() || "/",
    remark: String(patch.remark ?? cur.remark).trim() || "UP",
    sni: String(patch.sni ?? cur.sni).trim(),
    fp: String(patch.fp ?? cur.fp).trim() || "chrome",
    enableVless: patch.enableVless !== undefined ? !!patch.enableVless : cur.enableVless,
    enableTrojan: patch.enableTrojan !== undefined ? !!patch.enableTrojan : cur.enableTrojan,
    fragment: patch.fragment !== undefined ? !!patch.fragment : cur.fragment,
    maxPerUser: Math.min(16, Math.max(1, parseInt(patch.maxPerUser ?? cur.maxPerUser, 10) || 2)),
    selection: ["priority", "random", "roundrobin"].includes(patch.selection) ? patch.selection : cur.selection,
    dohUpstream: String(patch.dohUpstream ?? cur.dohUpstream).trim() || DEFAULTS.dohUpstream,
  };
  await kvPutJson(env, "network_settings", next);
  return next;
}
