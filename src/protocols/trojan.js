/** Trojan: SHA224(password) hex + CRLF + SOCKS5-like addr */
function rotr(n, x) {
  return (x >>> n) | (x << (32 - n));
}

export function sha224Hex(msg) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let H = [0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4];
  const m = new TextEncoder().encode(msg);
  const l = m.length;
  const bit = l * 8;
  const pad = (64 - ((l + 1 + 8) % 64)) % 64;
  const buf = new Uint8Array(l + 1 + pad + 8);
  buf.set(m);
  buf[l] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(buf.length - 8, Math.floor(bit / 0x100000000), false);
  dv.setUint32(buf.length - 4, bit >>> 0, false);
  for (let off = 0; off < buf.length; off += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H = H.map((x, i) => (x + [a, b, c, d, e, f, g, h][i]) >>> 0);
  }
  return H.slice(0, 7).map((x) => x.toString(16).padStart(8, "0")).join("");
}

export function parseTrojan(buf) {
  if (!buf || buf.length < 58) return null;
  const head = new TextDecoder().decode(buf.slice(0, 56));
  if (!/^[0-9a-f]{56}$/i.test(head) || buf[56] !== 0x0d || buf[57] !== 0x0a) return null;
  let i = 58;
  if (buf[i++] !== 1) return null;
  const atyp = buf[i++];
  let address = "";
  if (atyp === 1) {
    if (buf.length < i + 6) return null;
    address = `${buf[i]}.${buf[i + 1]}.${buf[i + 2]}.${buf[i + 3]}`;
    i += 4;
  } else if (atyp === 3) {
    const l = buf[i++];
    if (buf.length < i + l + 2) return null;
    address = new TextDecoder().decode(buf.slice(i, i + l));
    i += l;
  } else if (atyp === 4) {
    if (buf.length < i + 18) return null;
    const parts = [];
    for (let j = 0; j < 16; j += 2) parts.push(((buf[i + j] << 8) | buf[i + j + 1]).toString(16));
    address = parts.join(":");
    i += 16;
  } else return null;
  const port = (buf[i] << 8) | buf[i + 1];
  i += 2;
  return {
    protocol: "trojan",
    hash: head.toLowerCase(),
    address,
    port,
    payload: buf.length > i ? buf.slice(i) : new Uint8Array(0),
  };
}
