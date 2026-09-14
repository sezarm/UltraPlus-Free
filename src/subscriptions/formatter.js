export function formatBase64(lines) {
  const text = lines.join("\n");
  return btoa(unescape(encodeURIComponent(text)));
}
export function formatRaw(lines) {
  return lines.join("\n");
}
export function buildPlaceholderLinks(user, host, path = "/") {
  const uuid = user.uuid;
  const name = encodeURIComponent(user.displayName || "user");
  const p = encodeURIComponent(path || "/");
  const vless = `vless://${uuid}@${host}:443?encryption=none&security=tls&sni=${host}&fp=chrome&type=ws&host=${host}&path=${p}#${name}`;
  return [vless];
}
export function formatSubscription(user, host, format = "base64", path = "/") {
  const lines = buildPlaceholderLinks(user, host, path);
  const f = (format || "base64").toLowerCase();
  if (f === "raw") return { body: formatRaw(lines), contentType: "text/plain;charset=utf-8" };
  if (f === "clash") {
    const y = `proxies:\n  - name: ${user.displayName || "UP"}\n    type: vless\n    server: ${host}\n    port: 443\n    uuid: ${user.uuid}\n    network: ws\n    tls: true\n    servername: ${host}\n    ws-opts:\n      path: "${path || "/"}"\n      headers:\n        Host: ${host}\nproxy-groups:\n  - name: PROXY\n    type: select\n    proxies:\n      - ${user.displayName || "UP"}\nrules:\n  - MATCH,PROXY\n`;
    return { body: y, contentType: "text/yaml;charset=utf-8" };
  }
  return { body: formatBase64(lines), contentType: "text/plain;charset=utf-8" };
}
