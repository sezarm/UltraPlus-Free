import { SESSION_COOKIE, SESSION_TTL_SEC, KV_KEYS } from "../core/constants.js";
export function readSessionId(request) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(new RegExp("(?:^|; )" + SESSION_COOKIE + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
export function sessionCookieHeader(sessionId, maxAge = SESSION_TTL_SEC) {
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
export async function createSession(env, adminId) {
  const id = crypto.randomUUID();
  const payload = { adminId, createdAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_SEC * 1000 };
  if (env.ULTRA_KV) {
    await env.ULTRA_KV.put(KV_KEYS.SESSION_PREFIX + id, JSON.stringify(payload), { expirationTtl: SESSION_TTL_SEC });
  }
  return id;
}
export async function getSession(env, sessionId) {
  if (!sessionId || !env.ULTRA_KV) return null;
  const data = await env.ULTRA_KV.get(KV_KEYS.SESSION_PREFIX + sessionId, "json");
  if (!data) return null;
  if (data.expiresAt && Date.now() > data.expiresAt) {
    await env.ULTRA_KV.delete(KV_KEYS.SESSION_PREFIX + sessionId);
    return null;
  }
  return data;
}
export async function revokeSession(env, sessionId) {
  if (!sessionId || !env.ULTRA_KV) return;
  await env.ULTRA_KV.delete(KV_KEYS.SESSION_PREFIX + sessionId);
}
