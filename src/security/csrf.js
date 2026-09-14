import { readSessionId, getSession } from "../auth/session.js";
import { KV_KEYS } from "../core/constants.js";

export function generateCsrfToken() {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export async function ensureCsrf(env, sessionId) {
  if (!env.ULTRA_KV || !sessionId) return generateCsrfToken();
  const key = (KV_KEYS.SESSION_PREFIX || "session:") + sessionId;
  const sess = await env.ULTRA_KV.get(key, "json");
  if (!sess) return generateCsrfToken();
  if (sess.csrf) return sess.csrf;
  sess.csrf = generateCsrfToken();
  await env.ULTRA_KV.put(key, JSON.stringify(sess), { expirationTtl: 86400 });
  return sess.csrf;
}

export async function requireCsrf(request, env) {
  const sid = readSessionId(request);
  if (!sid || !env.ULTRA_KV) return true;
  const sess = await getSession(env, sid);
  if (!sess) return false;
  const expected = sess.csrf;
  if (!expected) return true;
  let token = request.headers.get("X-CSRF-Token") || "";
  if (!token) {
    try {
      const ct = request.headers.get("Content-Type") || "";
      if (ct.includes("form")) {
        const fd = await request.clone().formData();
        token = String(fd.get("_csrf") || "");
      }
    } catch (_) {}
  }
  return token && token === expected;
}

export function csrfField(token) {
  return `<input type="hidden" name="_csrf" value="${token || ""}">`;
}
