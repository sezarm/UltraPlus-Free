/** VLESS header parser */
export function uuidFromBytes(arr, offset) {
  const h = [];
  for (let i = 0; i < 16; i++) h.push(arr[offset + i].toString(16).padStart(2, "0"));
  return h.slice(0, 4).join("") + "-" + h.slice(4, 6).join("") + "-" + h.slice(6, 8).join("") + "-" + h.slice(8, 10).join("") + "-" + h.slice(10, 16).join("");
}

export function parseVless(buf) {
  if (!buf || buf.length < 24) return null;
  let i = 0;
  const version = buf[i++];
  const uuid = uuidFromBytes(buf, i);
  i += 16;
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) return null;
  const optLen = buf[i++];
  if (buf.length < i + optLen + 4) return null;
  i += optLen;
  const command = buf[i++];
  const port = (buf[i] << 8) | buf[i + 1];
  i += 2;
  const atyp = buf[i++];
  let address = "";
  if (atyp === 1) {
    if (buf.length < i + 4) return null;
    address = `${buf[i]}.${buf[i + 1]}.${buf[i + 2]}.${buf[i + 3]}`;
    i += 4;
  } else if (atyp === 2) {
    const l = buf[i++];
    if (buf.length < i + l) return null;
    address = new TextDecoder().decode(buf.slice(i, i + l));
    i += l;
  } else if (atyp === 3) {
    if (buf.length < i + 16) return null;
    const parts = [];
    for (let j = 0; j < 16; j += 2) parts.push(((buf[i + j] << 8) | buf[i + j + 1]).toString(16));
    address = parts.join(":");
    i += 16;
  } else return null;
  return { protocol: "vless", version, uuid, command, port, address, payload: buf.length > i ? buf.slice(i) : new Uint8Array(0) };
}
