/** Multi-host subscription formats — Phase 3/4 */
export function formatBase64(lines) {
  return btoa(unescape(encodeURIComponent(lines.join("\n"))));
}

export function formatRaw(lines) {
  return lines.join("\n");
}

export function buildVlessLink(user, host, server, st) {
  const path = encodeURIComponent(st.path || "/");
  const sni = encodeURIComponent(st.sni || host);
  const fp = encodeURIComponent(st.fp || "chrome");
  const name = encodeURIComponent((st.remark || "UP") + "-" + server);
  let extra = "";
  if (st.fragment) extra = "&fragment=10-20,10-20,tlshello";
  return `vless://${user.uuid}@${server}:443?encryption=none&security=tls&sni=${sni}&fp=${fp}&type=ws&host=${host}&path=${path}${extra}#${name}`;
}

export function buildTrojanLink(user, host, server, st) {
  const path = encodeURIComponent(st.path || "/");
  const sni = encodeURIComponent(st.sni || host);
  const fp = encodeURIComponent(st.fp || "chrome");
  const name = encodeURIComponent((st.remark || "UP") + "-TR-" + server);
  let extra = "";
  if (st.fragment) extra = "&fragment=10-20,10-20,tlshello";
  return `trojan://${user.uuid}@${server}:443?security=tls&sni=${sni}&fp=${fp}&type=ws&host=${host}&path=${path}${extra}#${name}`;
}

export function buildLinks(user, workerHost, servers, st) {
  const out = [];
  const seen = {};
  const add = (line) => {
    if (seen[line]) return;
    seen[line] = 1;
    out.push(line);
  };
  const list = [workerHost, ...(servers || [])].filter(Boolean);
  for (const s of list) {
    if (st.enableVless !== false) add(buildVlessLink(user, workerHost, s, st));
    if (st.enableTrojan) add(buildTrojanLink(user, workerHost, s, st));
    if (out.length >= 120) break;
  }
  if (!out.length) add(buildVlessLink(user, workerHost, workerHost, st));
  return out;
}

export function formatClash(user, workerHost, links, st, rules) {
  const names = [];
  let y = "proxies:\n";
  for (let i = 0; i < links.length; i++) {
    const isTr = links[i].startsWith("trojan://");
    const m = links[i].match(/@([^:]+):443/);
    const srv = m ? m[1] : workerHost;
    const nm = (st.remark || "UP") + "-" + i;
    names.push(nm);
    if (isTr) {
      y += `  - name: ${nm}\n    type: trojan\n    server: ${srv}\n    port: 443\n    password: ${user.uuid}\n    network: ws\n    sni: ${st.sni || workerHost}\n    ws-opts:\n      path: "${st.path || "/"}"\n      headers:\n        Host: ${workerHost}\n`;
    } else {
      y += `  - name: ${nm}\n    type: vless\n    server: ${srv}\n    port: 443\n    uuid: ${user.uuid}\n    network: ws\n    tls: true\n    servername: ${st.sni || workerHost}\n    client-fingerprint: ${st.fp || "chrome"}\n    ws-opts:\n      path: "${st.path || "/"}"\n      headers:\n        Host: ${workerHost}\n`;
    }
  }
  y += "proxy-groups:\n  - name: PROXY\n    type: select\n    proxies:\n";
  for (const n of names) y += `      - ${n}\n`;
  y += "  - name: AUTO\n    type: url-test\n    url: http://www.gstatic.com/generate_204\n    interval: 300\n    proxies:\n";
  for (const n of names) y += `      - ${n}\n`;
  y += "rules:\n";
  for (const r of rules || ["MATCH,PROXY"]) y += `  - ${r}\n`;
  return y;
}

export function formatSubscription(user, host, format, st, servers, rules) {
  const links = buildLinks(user, host, servers, st || {});
  const f = (format || "base64").toLowerCase();
  if (f === "raw") return { body: formatRaw(links), contentType: "text/plain;charset=utf-8", count: links.length };
  if (f === "clash") {
    return {
      body: formatClash(user, host, links, st || {}, rules),
      contentType: "text/yaml;charset=utf-8",
      count: links.length,
    };
  }
  return { body: formatBase64(links), contentType: "text/plain;charset=utf-8", count: links.length };
}
