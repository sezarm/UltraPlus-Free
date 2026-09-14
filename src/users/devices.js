import { kvGetJson, kvPutJson } from "../storage/kv.js";

const KEY = "devices:";

export async function listDevices(env, userId) {
  if (!env.ULTRA_KV || !userId) return [];
  return (await kvGetJson(env, KEY + userId, [])) || [];
}

export async function touchDevice(env, userId, fingerprint, limit = 2) {
  if (!env.ULTRA_KV || !userId || !fingerprint) return { ok: true };
  let list = await listDevices(env, userId);
  const now = Date.now();
  list = list.filter((d) => now - (d.lastSeen || 0) < 7 * 86400000);
  const existing = list.find((d) => d.fp === fingerprint);
  if (existing) existing.lastSeen = now;
  else {
    if (list.length >= limit) return { ok: false, reason: "device_limit", count: list.length };
    list.push({ fp: fingerprint, lastSeen: now });
  }
  await kvPutJson(env, KEY + userId, list, 30 * 86400);
  return { ok: true, count: list.length };
}

export async function clearDevices(env, userId) {
  if (env.ULTRA_KV && userId) await env.ULTRA_KV.delete(KEY + userId);
}
