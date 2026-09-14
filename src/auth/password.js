const ITERATIONS = 100000;
const SALT_LEN = 16;
const KEY_LEN = 32;
function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function b64ToBuf(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out.buffer;
}
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, keyMaterial, KEY_LEN * 8);
  return `pbkdf2$${ITERATIONS}$${bufToB64(salt)}$${bufToB64(bits)}`;
}
export async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith("pbkdf2$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const iterations = parseInt(parts[1], 10);
  const salt = b64ToBuf(parts[2]);
  const expected = parts[3];
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, KEY_LEN * 8);
  return bufToB64(bits) === expected;
}
