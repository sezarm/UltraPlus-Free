import { LOGIN_RATE_MAX, LOGIN_RATE_WINDOW_MS, KV_KEYS } from "./constants.js";
export function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };
}
export function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(securityHeaders())) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
export async function checkLoginRate(env, ip) {
  if (!env.ULTRA_KV || !ip) return { allowed: true };
  const key = KV_KEYS.RATE_PREFIX + "login:" + ip;
  try {
    const raw = await env.ULTRA_KV.get(key, "json");
    const now = Date.now();
    let row = raw || { n: 0, start: now };
    if (now - row.start > LOGIN_RATE_WINDOW_MS) row = { n: 0, start: now };
    if (row.n >= LOGIN_RATE_MAX) {
      return { allowed: false, retryAfter: Math.ceil((LOGIN_RATE_WINDOW_MS - (now - row.start)) / 1000) };
    }
    row.n += 1;
    await env.ULTRA_KV.put(key, JSON.stringify(row), { expirationTtl: Math.ceil(LOGIN_RATE_WINDOW_MS / 1000) });
    return { allowed: true };
  } catch { return { allowed: true }; }
}
