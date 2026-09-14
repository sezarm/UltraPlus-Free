/** Subscription format registry — Phase 2 base formats */
export function formatBase64(lines) {
  const text = lines.join("\n");
  return btoa(unescape(encodeURIComponent(text)));
}

export function formatRaw(lines) {
  return lines.join("\n");
}

/** Placeholder VLESS line for worker host — full protocol engine in later phase */
export function buildPlaceholderLinks(user, host, path = "/") {
  const uuid = user.uuid;
  const name = encodeURIComponent(user.displayName || "user");
  const p = encodeURIComponent(path || "/");
  const vless =
    `vless://${uuid}@${host}:443?encryption=none&security=tls&sni=${host}&fp=chrome&type=ws&host=${host}&path=${p}#${name}`;
  return [vless];
}

export function formatSubscription(user, host, format = "base64", path = "/") {
  const lines = buildPlaceholderLinks(user, host, path);
  const f = (format || "base64").toLowerCase();
  if (f === "raw") return { body: formatRaw(lines), contentType: "text/plain;charset=utf-8" };
  if (f === "clash") {
    const y = `proxies:
  - name: ${user.displayName || "UP"}
    type: vless
    server: ${host}
    port: 443
    uuid: ${user.uuid}
    network: ws
    tls: true
    servername: ${host}
    ws-opts:
      path: "${path || "/"}"
      headers:
        Host: ${host}
proxy-groups:
  - name: PROXY
    type: select
    proxies:
      - ${user.displayName || "UP"}
rules:
  - MATCH,PROXY
`;
    return { body: y, contentType: "text/yaml;charset=utf-8" };
  }
  return { body: formatBase64(lines), contentType: "text/plain;charset=utf-8" };
}
