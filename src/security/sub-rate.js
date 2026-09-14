import { KV_KEYS } from "../core/constants.js";

const MAX = 60;
const WINDOW_SEC = 60;

export async function checkSubRate(env, key) {
  if (!env.ULTRA_KV || !key) return { allowed: true };
  const k = (KV_KEYS.RATE_PREFIX || "rate:") + "sub:" + key;
  try {
    const raw = await env.ULTRA_KV.get(k, "json");
    const now = Date.now();
    let row = raw || { n: 0, start: now };
    if (now - row.start > WINDOW_SEC * 1000) row = { n: 0, start: now };
    if (row.n >= MAX) return { allowed: false };
    row.n += 1;
    await env.ULTRA_KV.put(k, JSON.stringify(row), { expirationTtl: WINDOW_SEC + 5 });
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
