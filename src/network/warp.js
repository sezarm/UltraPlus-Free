import { kvGetJson, kvPutJson } from "../storage/kv.js";

const DEFAULT_WARP = {
  enabled: false,
  privateKey: "",
  publicKey: "",
  address: "172.16.0.2/32",
  dns: "1.1.1.1",
  endpoint: "engage.cloudflareclient.com:2408",
  allowedIPs: "0.0.0.0/0, ::/0",
  mtu: 1280,
  reserved: "",
};

export async function getWarpConfig(env) {
  const stored = await kvGetJson(env, "warp_config", null);
  return Object.assign({}, DEFAULT_WARP, stored || {});
}

export async function saveWarpConfig(env, patch) {
  const cur = await getWarpConfig(env);
  const next = {
    enabled: patch.enabled !== undefined ? !!patch.enabled : cur.enabled,
    privateKey: patch.privateKey != null ? String(patch.privateKey).trim() : cur.privateKey,
    publicKey: patch.publicKey != null ? String(patch.publicKey).trim() : cur.publicKey,
    address: String(patch.address ?? cur.address).trim() || DEFAULT_WARP.address,
    dns: String(patch.dns ?? cur.dns).trim() || DEFAULT_WARP.dns,
    endpoint: String(patch.endpoint ?? cur.endpoint).trim() || DEFAULT_WARP.endpoint,
    allowedIPs: String(patch.allowedIPs ?? cur.allowedIPs).trim() || DEFAULT_WARP.allowedIPs,
    mtu: parseInt(patch.mtu ?? cur.mtu, 10) || 1280,
    reserved: String(patch.reserved ?? cur.reserved).trim(),
  };
  await kvPutJson(env, "warp_config", next);
  return next;
}

export function formatWarpConf(w) {
  if (!w || !w.privateKey) return "# WARP not configured — set private/public keys in admin\n";
  return `[Interface]
PrivateKey = ${w.privateKey}
Address = ${w.address}
DNS = ${w.dns}
MTU = ${w.mtu}

[Peer]
PublicKey = ${w.publicKey}
AllowedIPs = ${w.allowedIPs}
Endpoint = ${w.endpoint}
${w.reserved ? `Reserved = ${w.reserved}\n` : ""}`;
}

export function formatWarpSingbox(w) {
  if (!w || !w.privateKey) return null;
  return {
    type: "wireguard",
    tag: "warp",
    local_address: [w.address],
    private_key: w.privateKey,
    peer_public_key: w.publicKey,
    server: (w.endpoint || "").split(":")[0],
    server_port: parseInt((w.endpoint || ":2408").split(":")[1], 10) || 2408,
    mtu: w.mtu || 1280,
  };
}
