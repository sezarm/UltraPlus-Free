export function formatBase64(lines) {
  return btoa(unescape(encodeURIComponent(lines.join("\n"))));
}
export function formatRaw(lines) {
  return lines.join("\n");
}
export function buildVlessLink(user, host, server, st, tagSuffix = "") {
  const path = encodeURIComponent(st.path || "/");
  const sni = encodeURIComponent(st.sni || host);
  const fp = encodeURIComponent(st.fp || "chrome");
  const name = encodeURIComponent((st.remark || "UP") + tagSuffix + "-" + server);
  let extra = "";
  if (st.fragment) extra = "&fragment=10-20,10-20,tlshello";
  extra += "&alpn=" + encodeURIComponent("http/1.1");
  return `vless://${user.uuid}@${server}:443?encryption=none&security=tls&sni=${sni}&fp=${fp}&type=ws&host=${encodeURIComponent(host)}&path=${path}${extra}#${name}`;
}
export function buildTrojanLink(user, host, server, st, tagSuffix = "") {
  const path = encodeURIComponent(st.path || "/");
  const sni = encodeURIComponent(st.sni || host);
  const fp = encodeURIComponent(st.fp || "chrome");
  const name = encodeURIComponent((st.remark || "UP") + tagSuffix + "-TR-" + server);
  let extra = "";
  if (st.fragment) extra = "&fragment=10-20,10-20,tlshello";
  extra += "&alpn=" + encodeURIComponent("http/1.1");
  return `trojan://${user.uuid}@${server}:443?security=tls&sni=${sni}&fp=${fp}&type=ws&host=${encodeURIComponent(host)}&path=${path}${extra}#${name}`;
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
    if (st.enableTrojan !== false) add(buildTrojanLink(user, workerHost, s, st));
    if (st.fragment && out.length < 100) {
      const st2 = { ...st, fragment: false };
      if (st.enableVless !== false) add(buildVlessLink(user, workerHost, s, st2, "-nf"));
    }
    if (out.length >= 120) break;
  }
  if (!out.length) add(buildVlessLink(user, workerHost, workerHost, st));
  return out;
}
export function formatClash(user, workerHost, links, st, rules) {
  const names = [];
  let y = "mixed-port: 7890\nallow-lan: false\nmode: rule\nlog-level: info\n";
  y += "dns:\n  enable: true\n  enhanced-mode: fake-ip\n  nameserver:\n    - https://1.1.1.1/dns-query\n    - https://" + workerHost + "/dns-query\n";
  y += "proxies:\n";
  for (let i = 0; i < links.length; i++) {
    const isTr = links[i].startsWith("trojan://");
    const m = links[i].match(/@([^:]+):443/);
    const srv = m ? m[1] : workerHost;
    const nm = (st.remark || "UP") + "-" + i;
    names.push(nm);
    if (isTr) {
      y += `  - name: ${nm}\n    type: trojan\n    server: ${srv}\n    port: 443\n    password: ${user.uuid}\n    udp: false\n    network: ws\n    sni: ${st.sni || workerHost}\n    client-fingerprint: ${st.fp || "chrome"}\n    ws-opts:\n      path: "${st.path || "/"}"\n      headers:\n        Host: ${workerHost}\n`;
    } else {
      y += `  - name: ${nm}\n    type: vless\n    server: ${srv}\n    port: 443\n    uuid: ${user.uuid}\n    udp: false\n    network: ws\n    tls: true\n    servername: ${st.sni || workerHost}\n    client-fingerprint: ${st.fp || "chrome"}\n    ws-opts:\n      path: "${st.path || "/"}"\n      headers:\n        Host: ${workerHost}\n`;
    }
  }
  y += "proxy-groups:\n  - name: PROXY\n    type: select\n    proxies:\n      - AUTO\n      - LB\n";
  for (const n of names) y += `      - ${n}\n`;
  y += "  - name: AUTO\n    type: url-test\n    url: http://www.gstatic.com/generate_204\n    interval: 300\n    tolerance: 50\n    proxies:\n";
  for (const n of names) y += `      - ${n}\n`;
  y += "  - name: LB\n    type: load-balance\n    strategy: consistent-hashing\n    url: http://www.gstatic.com/generate_204\n    interval: 300\n    proxies:\n";
  for (const n of names) y += `      - ${n}\n`;
  y += "rules:\n";
  const defaultRules = rules && rules.length ? rules : ["GEOIP,IR,DIRECT", "DOMAIN-SUFFIX,ir,DIRECT", "MATCH,PROXY"];
  for (const r of defaultRules) y += `  - ${r}\n`;
  return y;
}
export function formatSingbox(user, workerHost, links, st) {
  const outbounds = [];
  const tags = [];
  for (let i = 0; i < links.length; i++) {
    const isTr = links[i].startsWith("trojan://");
    const m = links[i].match(/@([^:]+):443/);
    const srv = m ? m[1] : workerHost;
    const tag = (st.remark || "UP") + "-" + i;
    tags.push(tag);
    const tls = { enabled: true, server_name: st.sni || workerHost, utls: { enabled: true, fingerprint: st.fp || "chrome" } };
    const transport = { type: "ws", path: st.path || "/", headers: { Host: workerHost } };
    if (isTr) outbounds.push({ type: "trojan", tag, server: srv, server_port: 443, password: user.uuid, tls, transport });
    else outbounds.push({ type: "vless", tag, server: srv, server_port: 443, uuid: user.uuid, tls, transport });
  }
  outbounds.push({ type: "urltest", tag: "auto", outbounds: tags, url: "http://www.gstatic.com/generate_204", interval: "5m" });
  outbounds.push({ type: "selector", tag: "proxy", outbounds: ["auto", ...tags] });
  outbounds.push({ type: "direct", tag: "direct" });
  outbounds.push({ type: "block", tag: "block" });
  return JSON.stringify({
    log: { level: "warn" },
    dns: { servers: [{ tag: "dns-remote", address: "https://1.1.1.1/dns-query", detour: "proxy" }, { tag: "dns-direct", address: "local", detour: "direct" }], strategy: "ipv4_only" },
    outbounds,
    route: { rules: [{ domain_suffix: [".ir"], outbound: "direct" }, { geoip: "ir", outbound: "direct" }], final: "proxy" },
  }, null, 2);
}
export function formatSurge(user, workerHost, links, st) {
  let body = "#!MANAGED-CONFIG\n\n[General]\nbypass-system = true\nskip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, localhost, *.local, *.ir\n\n[Proxy]\n";
  const names = [];
  for (let i = 0; i < Math.min(links.length, 40); i++) {
    const isTr = links[i].startsWith("trojan://");
    const m = links[i].match(/@([^:]+):443/);
    const srv = m ? m[1] : workerHost;
    const nm = (st.remark || "UP") + i;
    names.push(nm);
    if (isTr) body += `${nm} = trojan, ${srv}, 443, password=${user.uuid}, sni=${st.sni || workerHost}, ws=true, ws-path=${st.path || "/"}, ws-headers=Host:${workerHost}\n`;
    else body += `${nm} = vless, ${srv}, 443, username=${user.uuid}, sni=${st.sni || workerHost}, ws=true, ws-path=${st.path || "/"}, ws-headers=Host:${workerHost}, tls=true\n`;
  }
  body += "\n[Proxy Group]\nPROXY = select, " + names.join(", ") + "\n\n[Rule]\nDOMAIN-SUFFIX,ir,DIRECT\nGEOIP,IR,DIRECT\nFINAL,PROXY\n";
  return body;
}
export function formatSubscription(user, host, format, st, servers, rules) {
  const links = buildLinks(user, host, servers, st || {});
  const f = (format || "base64").toLowerCase();
  if (f === "raw") return { body: formatRaw(links), contentType: "text/plain;charset=utf-8", count: links.length, links };
  if (f === "clash") return { body: formatClash(user, host, links, st || {}, rules), contentType: "text/yaml;charset=utf-8", count: links.length, links };
  if (f === "singbox" || f === "sing-box") return { body: formatSingbox(user, host, links, st || {}), contentType: "application/json;charset=utf-8", count: links.length, links };
  if (f === "surge") return { body: formatSurge(user, host, links, st || {}), contentType: "text/plain;charset=utf-8", count: links.length, links };
  return { body: formatBase64(links), contentType: "text/plain;charset=utf-8", count: links.length, links };
}
export function buildUserinfo(user) {
  const download = Number(user.quotaUsed || 0);
  const total = Number(user.quotaTotal || 0) || 0;
  let expire = 0;
  if (user.expiresAt) {
    const t = Date.parse(user.expiresAt);
    if (!isNaN(t)) expire = Math.floor(t / 1000);
  }
  return `upload=0; download=${download}; total=${total}; expire=${expire}`;
}
