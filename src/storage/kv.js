import { KV_KEYS } from "../core/constants.js";
export async function kvGetJson(env, key, fallback = null) {
  if (!env.ULTRA_KV) return fallback;
  try {
    const v = await env.ULTRA_KV.get(key, "json");
    return v == null ? fallback : v;
  } catch { return fallback; }
}
export async function kvPutJson(env, key, value, ttlSec) {
  if (!env.ULTRA_KV) return;
  const opt = {};
  if (ttlSec && ttlSec >= 60) opt.expirationTtl = ttlSec;
  await env.ULTRA_KV.put(key, JSON.stringify(value), opt);
}
export async function isSetupDone(env) {
  if (env.ULTRA_KV) {
    const v = await env.ULTRA_KV.get(KV_KEYS.SETUP_DONE);
    if (v === "1") return true;
  }
  if (env.DB) {
    try {
      const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM admins").first();
      return row && row.c > 0;
    } catch { return false; }
  }
  return false;
}
export async function markSetupDone(env) {
  if (env.ULTRA_KV) await env.ULTRA_KV.put(KV_KEYS.SETUP_DONE, "1");
}
