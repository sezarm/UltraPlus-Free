export function newId() {
  return crypto.randomUUID();
}
export function newSubToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}
