/**
 * UltraPlus-Free v0.6.6 - Single File Worker
 * Phase 7.6: user export JSON + TLS fingerprint setting
 * FROM SCRATCH – not copied from other projects
 */

const LANGUAGES = ["en", "fa", "zh"];
const translations = {
  en: { title: "UltraPlus-Free", subtitle: "Your private powerful panel", login: "Login", password: "Password", dashboard: "Dashboard", welcome: "Welcome to your panel", status: "Status", online: "Online", users: "Users", configs: "Configs", settings: "Settings", wizard: "Wizard", logout: "Logout", addUser: "Add User", name: "Name", remark: "Remark", enable: "Enable", disable: "Disable", delete: "Delete", subLink: "Sub Link", wrongPass: "Wrong password", noUsers: "No users yet", phase: "v0.6.6", uuid: "UUID", actions: "Actions", passWarning: "This password is ONLY for YOUR panel. Change it after first login.", defaultPass: "Default is admin. Set ADMIN_PASSWORD in Worker variables.", important: "Important", kvNote: "KV optional. Without it users reset on redeploy.", botNote: "Telegram bot optional. Set TELEGRAM_BOT_TOKEN + TELEGRAM_ADMIN_ID.", wizardTitle: "Quick Install Wizard", wizardStep1: "1. Deploy this Worker to your Cloudflare account", wizardStep2: "2. Open /admin and login (default: admin)", wizardStep3: "3. Set ADMIN_PASSWORD in Worker settings", wizardStep4: "4. Add users and share their private /sub/ links", wizardNote: "Self-hosted. Every person creates their own panel.", expire: "Expire (days, 0=never)", traffic: "Traffic GB (0=unlimited)", never: "Never", unlimited: "Unlimited", toggle: "Toggle", copy: "Copy Link" },
  fa: { title: "UltraPlus-Free", subtitle: "پنل قدرتمند و شخصی شما", login: "ورود", password: "رمز عبور", dashboard: "داشبورد", welcome: "به پنل خودتان خوش آمدید", status: "وضعیت", online: "آنلاین", users: "کاربران", configs: "کانفیگ‌ها", settings: "تنظیمات", wizard: "ویزارد", logout: "خروج", addUser: "افزودن کاربر", name: "نام", remark: "توضیح", enable: "فعال", disable: "غیرفعال", delete: "حذف", subLink: "لینک ساب", wrongPass: "رمز اشتباه است", noUsers: "هنوز کاربری وجود ندارد", phase: "نسخه ۰.۶.۶", uuid: "UUID", actions: "عملیات", passWarning: "این رمز فقط برای پنل شماست. بعد از ورود عوض کنید.", defaultPass: "پیش‌فرض admin است. با ADMIN_PASSWORD عوض کنید.", important: "مهم", kvNote: "KV اختیاری است. بدون آن با ری‌دیپلوی پاک می‌شود.", botNote: "ربات تلگرام اختیاری است.", wizardTitle: "ویزارد نصب سریع", wizardStep1: "۱. Worker را روی Cloudflare خود دیپلوی کنید", wizardStep2: "۲. به /admin بروید (رمز پیش‌فرض: admin)", wizardStep3: "۳. ADMIN_PASSWORD را تنظیم کنید", wizardStep4: "۴. کاربر اضافه کنید و لینک /sub/ بدهید", wizardNote: "کاملاً شخصی. هر نفر پنل خودش را می‌سازد.", expire: "انقضا (روز، ۰=بدون انقضا)", traffic: "حجم گیگ (۰=نامحدود)", never: "بدون انقضا", unlimited: "نامحدود", toggle: "فعال/غیرفعال", copy: "کپی لینک" },
  zh: { title: "UltraPlus-Free", subtitle: "你的强大私人面板", login: "登录", password: "密码", dashboard: "仪表盘", welcome: "欢迎来到你的面板", status: "状态", online: "在线", users: "用户", configs: "配置", settings: "设置", wizard: "向导", logout: "退出", addUser: "添加用户", name: "名称", remark: "备注", enable: "启用", disable: "禁用", delete: "删除", subLink: "订阅链接", wrongPass: "密码错误", noUsers: "暂无用户", phase: "v0.6.6", uuid: "UUID", actions: "操作", passWarning: "此密码仅属于你的面板。请立即修改。", defaultPass: "默认 admin。请设置 ADMIN_PASSWORD。", important: "重要", kvNote: "KV 可选。没有时重新部署会丢失。", botNote: "Telegram 机器人可选。", wizardTitle: "快速安装向导", wizardStep1: "1. 部署到你的 Cloudflare", wizardStep2: "2. 打开 /admin（默认密码 admin）", wizardStep3: "3. 设置 ADMIN_PASSWORD", wizardStep4: "4. 添加用户并分享 /sub/ 链接", wizardNote: "完全自托管。每人创建自己的面板。", expire: "过期天数 (0=永久)", traffic: "流量GB (0=无限)", never: "永久", unlimited: "无限", toggle: "切换", copy: "复制链接" }
};
function t(lang, key) { return (translations[lang] && translations[lang][key]) || translations.en[key] || key; }
function getLang(request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("lang");
  if (q && LANGUAGES.includes(q)) return q;
  const accept = request.headers.get("Accept-Language") || "";
  if (accept.includes("fa")) return "fa";
  if (accept.includes("zh")) return "zh";
  return "en";
}
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
let memoryUsers = [];
let proxyStats = { ok: 0, fail: 0, auth: 0, active: 0 };
const MAX_ACTIVE = 48;
async function loadUsers(env) {
  if (env.ULTRA_KV) { const data = await env.ULTRA_KV.get("users", "json"); return data || []; }
  return memoryUsers;
}
async function saveUsers(env, users) {
  if (env.ULTRA_KV) await env.ULTRA_KV.put("users", JSON.stringify(users));
  else memoryUsers = users;
}
async function loadSettings(env) {
  const defaults = { path: "/", remark: "UltraPlus", sni: "", fp: "chrome" };
  if (env.ULTRA_KV) { const data = await env.ULTRA_KV.get("settings", "json"); return Object.assign({}, defaults, data || {}); }
  return defaults;
}
async function saveSettings(env, settings) {
  if (env.ULTRA_KV) await env.ULTRA_KV.put("settings", JSON.stringify(settings));
}
function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}
function isAuthenticated(request, env) {
  const token = getCookie(request, "up_auth");
  return token === btoa(env.ADMIN_PASSWORD || "admin");
}
function isUserValid(u) {
  if (!u.enable) return false;
  if (u.expire && u.expire > 0 && Date.now() > u.expire) return false;
  return true;
}
async function sendTelegram(env, chatId, text) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch("https://api.telegram.org/bot" + env.TELEGRAM_BOT_TOKEN + "/sendMessage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "HTML" }),
    });
  } catch (e) {}
}
function buildVlessLink(user, host, settings) {
  settings = settings || { path: "/", remark: "UltraPlus", sni: "", fp: "chrome" };
  const path = encodeURIComponent(settings.path || "/");
  const sni = settings.sni || host;
  const fp = encodeURIComponent(settings.fp || "chrome");
  const remark = encodeURIComponent((settings.remark || "UltraPlus") + "-" + (user.name || "user"));
  return "vless://" + user.uuid + "@" + host + ":443?encryption=none&security=tls&sni=" + sni + "&fp=" + fp + "&type=ws&host=" + host + "&path=" + path + "#" + remark;
}
function buildClashConfig(user, host, settings) {
  settings = settings || { path: "/", remark: "UltraPlus", sni: "" };
  const path = settings.path || "/";
  const sni = settings.sni || host;
  const name = (settings.remark || "UltraPlus") + "-" + (user.name || "user");
  return "proxies:\n  - name: " + name + "\n    type: vless\n    server: " + host + "\n    port: 443\n    uuid: " + user.uuid + "\n    network: ws\n    tls: true\n    servername: " + sni + "\n    udp: false\n    ws-opts:\n      path: \"" + path + "\"\n      headers:\n        Host: " + host + "\n";
}

function uuidBytesToString(arr, offset) {
  const h = [];
  for (let i = 0; i < 16; i++) h.push(arr[offset + i].toString(16).padStart(2, "0"));
  return h[0]+h[1]+h[2]+h[3]+"-"+h[4]+h[5]+"-"+h[6]+h[7]+"-"+h[8]+h[9]+"-"+h[10]+h[11]+h[12]+h[13]+h[14]+h[15];
}
function isValidUuidFormat(u) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u);
}
function concatBytes(chunks) {
  let n = 0; for (let i = 0; i < chunks.length; i++) n += chunks[i].length;
  const out = new Uint8Array(n); let o = 0;
  for (let i = 0; i < chunks.length; i++) { out.set(chunks[i], o); o += chunks[i].length; }
  return out;
}
function parseVlessHeader(buf) {
  if (buf.length < 24) return null;
  let i = 0;
  const version = buf[i++];
  const uuid = uuidBytesToString(buf, i); i += 16;
  if (!isValidUuidFormat(uuid)) return null;
  const addonLen = buf[i++];
  if (buf.length < i + addonLen + 4) return null;
  i += addonLen;
  const command = buf[i++];
  const port = (buf[i] << 8) | buf[i + 1]; i += 2;
  const atype = buf[i++];
  let address = "";
  if (atype === 1) {
    if (buf.length < i + 4) return null;
    address = buf[i] + "." + buf[i+1] + "." + buf[i+2] + "." + buf[i+3]; i += 4;
  } else if (atype === 2) {
    const l = buf[i++]; if (buf.length < i + l) return null;
    address = new TextDecoder().decode(buf.slice(i, i + l)); i += l;
  } else if (atype === 3) {
    if (buf.length < i + 16) return null;
    const parts = []; for (let j = 0; j < 16; j += 2) parts.push(((buf[i+j] << 8) | buf[i+j+1]).toString(16));
    address = parts.join(":"); i += 16;
  } else return null;
  return { version: version, uuid: uuid, command: command, port: port, address: address, payload: buf.length > i ? buf.slice(i) : new Uint8Array(0) };
}
function safeCloseWs(ws, code, reason) {
  try { if (ws.readyState === 1 || ws.readyState === 0) ws.close(code || 1000, reason || ""); } catch (e) {}
}
async function pumpRemoteToWs(readable, ws) {
  const reader = readable.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (ws.readyState !== 1) break;
      ws.send(value);
    }
  } catch (e) {
  } finally {
    try { reader.releaseLock(); } catch (e) {}
    safeCloseWs(ws);
  }
}
async function handleVlessSession(ws, env) {
  if (proxyStats.active >= MAX_ACTIVE) {
    safeCloseWs(ws, 1013, "busy");
    return;
  }
  proxyStats.active++;
  let writer = null;
  let remote = null;
  let headerParsed = false;
  let closed = false;
  const early = [];
  const writeQueue = [];
  let writing = false;
  async function flushWrites() {
    if (writing || !writer) return;
    writing = true;
    try {
      while (writeQueue.length && writer) {
        const chunk = writeQueue.shift();
        await writer.write(chunk);
      }
    } catch (e) { shutdown(); }
    finally { writing = false; }
  }
  function shutdown() {
    if (closed) return;
    closed = true;
    if (proxyStats.active > 0) proxyStats.active--;
    try { if (writer) writer.releaseLock(); } catch (e) {}
    writer = null;
    try { if (remote && remote.close) remote.close(); } catch (e) {}
    safeCloseWs(ws);
  }
  const onMessage = async function (ev) {
    if (closed) return;
    try {
      let data;
      if (ev.data instanceof ArrayBuffer) data = new Uint8Array(ev.data);
      else if (typeof ev.data === "string") return;
      else data = new Uint8Array(await ev.data.arrayBuffer());
      if (!headerParsed) {
        early.push(data);
        const parsed = parseVlessHeader(concatBytes(early));
        if (!parsed) {
          if (concatBytes(early).length > 2048) shutdown();
          return;
        }
        headerParsed = true;
        const users = await loadUsers(env);
        const ok = users.some(function (u) {
          return u.uuid.toLowerCase() === parsed.uuid.toLowerCase() && isUserValid(u);
        });
        if (!ok) { proxyStats.auth++; safeCloseWs(ws, 1008, "unauthorized"); return; }
        if (parsed.command !== 1) { safeCloseWs(ws, 1008, "tcp-only"); return; }
        if (!parsed.address || !parsed.port || parsed.port < 1 || parsed.port > 65535) {
          proxyStats.fail++;
          safeCloseWs(ws, 1008, "bad-target");
          return;
        }
        try {
          const sock = await import("cloudflare:sockets");
          remote = sock.connect({ hostname: parsed.address, port: parsed.port });
          writer = remote.writable.getWriter();
          proxyStats.ok++;
        } catch (err) {
          proxyStats.fail++; safeCloseWs(ws, 1011, "connect-fail"); return;
        }
        if (ws.readyState === 1) ws.send(new Uint8Array([parsed.version || 0, 0]));
        if (parsed.payload && parsed.payload.length) {
          writeQueue.push(parsed.payload);
          await flushWrites();
        }
        pumpRemoteToWs(remote.readable, ws).catch(function () { shutdown(); });
        return;
      }
      if (writeQueue.length < 64) writeQueue.push(data);
      else { shutdown(); return; }
      await flushWrites();
    } catch (e) { shutdown(); }
  };
  ws.addEventListener("message", function (ev) { onMessage(ev); });
  ws.addEventListener("close", function () { shutdown(); });
  ws.addEventListener("error", function () { shutdown(); });
}
async function handleVlessWs(request, env) {
  if ((request.headers.get("Upgrade") || "").toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }
  try {
    const settings = await loadSettings(env);
    const want = (settings.path || "/").trim() || "/";
    const got = new URL(request.url).pathname || "/";
    const norm = function (p) {
      if (!p || p === "") return "/";
      return p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p;
    };
    if (norm(got) !== norm(want)) return new Response("Path mismatch", { status: 404 });
  } catch (e) {}
  const pair = new WebSocketPair();
  const client = pair[0], server = pair[1];
  server.accept();
  handleVlessSession(server, env).catch(function () { safeCloseWs(server); });
  return new Response(null, { status: 101, webSocket: client });
}

function renderLogin(lang, error) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t(lang,"title")}</title><style>:root{--p:#0ea5e9;--bg:#0f172a;--c:#1e293b;--t:#f1f5f9;--d:#ef4444}*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh;display:flex;align-items:center;justify-content:center}.card{background:var(--c);padding:2.5rem;border-radius:1rem;width:100%;max-width:420px}h1{text-align:center;margin-bottom:.5rem}p{text-align:center;opacity:.7;margin-bottom:1rem}input{width:100%;padding:.75rem;margin-bottom:1rem;border-radius:.5rem;border:1px solid #334155;background:#0f172a;color:var(--t)}button{width:100%;padding:.75rem;border:none;border-radius:.5rem;background:var(--p);color:#fff;font-weight:600}.error{color:var(--d);text-align:center}.warn{background:#422006;color:#fcd34d;padding:.75rem;border-radius:.5rem;font-size:.8rem;margin-bottom:1rem}.langs{display:flex;gap:.75rem;justify-content:center;margin-top:1.5rem}.langs a{color:var(--p);text-decoration:none}</style></head><body><div class="card"><h1>${t(lang,"title")}</h1><p>${t(lang,"subtitle")}</p><div class="warn">${t(lang,"passWarning")}</div>${error?'<div class="error">'+t(lang,"wrongPass")+'</div>':''}<form method="POST" action="/login"><input type="hidden" name="lang" value="${lang}"><input type="password" name="pass" placeholder="${t(lang,"password")}" required autofocus><button type="submit">${t(lang,"login")}</button></form><div class="langs"><a href="/?lang=en">English</a><a href="/?lang=fa">فارسی</a><a href="/?lang=zh">中文</a></div></div></body></html>`;
}
function baseLayout(lang, title, body) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><style>:root{--p:#0ea5e9;--bg:#0f172a;--c:#1e293b;--t:#f1f5f9;--b:#334155;--s:#10b981;--d:#ef4444;--w:#f59e0b}*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh}header{background:var(--c);padding:1rem;display:flex;justify-content:space-between;flex-wrap:wrap;border-bottom:1px solid var(--b)}nav a{color:var(--t);text-decoration:none;margin:0 .4rem;font-size:.9rem}main{padding:1.5rem;max-width:1100px;margin:0 auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin:1rem 0}.card{background:var(--c);padding:1rem;border-radius:.75rem;border:1px solid var(--b)}.badge{background:var(--s);color:#fff;padding:.15rem .5rem;border-radius:999px;font-size:.75rem}.badge-off{background:var(--d)}.btn{display:inline-block;padding:.3rem .6rem;border-radius:.4rem;border:none;color:#fff;background:var(--p);font-size:.75rem;cursor:pointer;text-decoration:none;margin:0 .1rem}.btn-d{background:var(--d)}.btn-w{background:var(--w)}.btn-s{background:var(--s)}table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{padding:.6rem;border-bottom:1px solid var(--b)}input{padding:.5rem;border-radius:.4rem;border:1px solid var(--b);background:#0f172a;color:var(--t);width:100%;max-width:280px}.note{margin-top:1rem;padding:1rem;background:var(--c);border-left:4px solid var(--p);border-radius:.5rem;font-size:.9rem}.warn{background:#422006;color:#fcd34d;padding:1rem;border-radius:.5rem;margin-bottom:1rem}.sub-box{font-size:.7rem;word-break:break-all;margin-top:.3rem;background:#0f172a;padding:.4rem;border-radius:.3rem}</style></head><body><header><h1>${t(lang,"title")}</h1><nav><a href="/admin?lang=${lang}">${t(lang,"dashboard")}</a><a href="/admin/users?lang=${lang}">${t(lang,"users")}</a><a href="/admin/configs?lang=${lang}">${t(lang,"configs")}</a><a href="/admin/settings?lang=${lang}">${t(lang,"settings")}</a><a href="/wizard?lang=${lang}">${t(lang,"wizard")}</a><a href="/logout?lang=${lang}">${t(lang,"logout")}</a></nav></header><main>${body}</main></body></html>`;
}
function renderDashboard(lang, users, settings) {
  settings = settings || { path: "/", remark: "UltraPlus", sni: "" };
  const active = users.filter(isUserValid).length;
  const pathShow = (settings.path || "/").replace(/</g, "");
  return baseLayout(lang, t(lang,"dashboard"), `<h2>${t(lang,"welcome")}</h2><div class="grid"><div class="card"><h3>${t(lang,"status")}</h3><p><span class="badge">${t(lang,"online")}</span></p></div><div class="card"><h3>${t(lang,"users")}</h3><p>${users.length}</p></div><div class="card"><h3>Active</h3><p>${active}</p></div><div class="card"><h3>${t(lang,"phase")}</h3><p>0.6.6</p></div><div class="card"><h3>Proxy</h3><p><span class="badge">VLESS/WS</span></p></div><div class="card"><h3>WS Path</h3><p style="font-size:1rem">${pathShow}</p></div><div class="card"><h3>Proxy OK</h3><p>${proxyStats.ok}</p></div><div class="card"><h3>Proxy Fail</h3><p>${proxyStats.fail}</p></div><div class="card"><h3>Auth Deny</h3><p>${proxyStats.auth}</p></div><div class="card"><h3>Active WS</h3><p>${proxyStats.active}</p></div></div><div class="note">${t(lang,"kvNote")}<br>${t(lang,"botNote")}<br>Core 7.6: export users JSON + custom TLS fingerprint (fp).</div>`);
}
function renderUsers(lang, host, users) {
  let rows = users.length ? "" : `<tr><td colspan="6">${t(lang,"noUsers")}</td></tr>`;
  for (const u of users) {
    const sub = "https://" + host + "/sub/" + u.uuid;
    const exp = u.expire && u.expire > 0 ? new Date(u.expire).toLocaleDateString() : t(lang,"never");
    const tr = u.totalGB && u.totalGB > 0 ? u.totalGB + " GB" : t(lang,"unlimited");
    const statusBadge = u.enable ? `<span class="badge">${t(lang,"enable")}</span>` : `<span class="badge badge-off">${t(lang,"disable")}</span>`;
    const toggleLabel = u.enable ? t(lang,"disable") : t(lang,"enable");
    const toggleClass = u.enable ? "btn-w" : "btn-s";
    rows += `<tr><td>${u.name}<div class="sub-box">${sub}</div></td><td>${u.uuid.slice(0,8)}...</td><td>${statusBadge}</td><td>${exp}</td><td>${tr}</td><td><a class="btn" href="${sub}" target="_blank">${t(lang,"subLink")}</a><form method="POST" action="/admin/users/toggle" style="display:inline"><input type="hidden" name="id" value="${u.id}"><input type="hidden" name="lang" value="${lang}"><button class="btn ${toggleClass}" type="submit">${toggleLabel}</button></form><form method="POST" action="/admin/users/delete" style="display:inline"><input type="hidden" name="id" value="${u.id}"><input type="hidden" name="lang" value="${lang}"><button class="btn btn-d" type="submit">${t(lang,"delete")}</button></form></td></tr>`;
  }
  return baseLayout(lang, t(lang,"users"), `<h2>${t(lang,"users")}</h2><p><a class="btn" href="/admin/export">Export JSON</a></p><form method="POST" action="/admin/users/add" style="padding:1rem;background:var(--c);border-radius:.75rem;margin:1rem 0"><input name="name" placeholder="${t(lang,"name")}" required> <input name="remark" placeholder="${t(lang,"remark")}"> <input name="expireDays" type="number" min="0" value="0"> <input name="totalGB" type="number" min="0" value="0"> <input type="hidden" name="lang" value="${lang}"> <button class="btn" type="submit">${t(lang,"addUser")}</button></form><table><thead><tr><th>${t(lang,"name")}</th><th>${t(lang,"uuid")}</th><th>${t(lang,"status")}</th><th>Expire</th><th>Traffic</th><th>${t(lang,"actions")}</th></tr></thead><tbody>${rows}</tbody></table>`);
}
function renderConfigs(lang, host) {
  return baseLayout(lang, t(lang,"configs"), `<h2>${t(lang,"configs")}</h2><div class="note">/sub/<uuid> — base64 | raw | clash<br>VLESS WS 0.6.6: path must match Settings. TCP only; max 48 concurrent WS.</div><p>Base: https://${host}/sub/<uuid></p>`);
}
function renderSettings(lang, settings) {
  settings = settings || { path: "/", remark: "UltraPlus", sni: "", fp: "chrome" };
  return baseLayout(lang, t(lang,"settings"), `<h2>${t(lang,"settings")}</h2><div class="warn">${t(lang,"passWarning")}<br>${t(lang,"defaultPass")}</div><form method="POST" action="/admin/settings/save" style="padding:1rem;background:var(--c);border-radius:.75rem"><div>WS Path (must match client)<br><input name="path" value="${(settings.path||"/").replace(/"/g,"")}"></div><div>Remark<br><input name="remark" value="${(settings.remark||"UltraPlus").replace(/"/g,"")}"></div><div>SNI<br><input name="sni" value="${(settings.sni||"").replace(/"/g,"")}"></div><div>Fingerprint (fp)<br><input name="fp" value="${(settings.fp||"chrome").replace(/"/g,"")}" placeholder="chrome"></div><input type="hidden" name="lang" value="${lang}"><button class="btn" type="submit">Save</button><p style="font-size:.8rem;opacity:.7">Needs KV. Path used by proxy core.</p></form><div class="note">Bot: /status /stats /users /add /toggle /del /link /help</div>`);
}
function renderWizard(lang) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><title>${t(lang,"wizardTitle")}</title><style>body{font-family:system-ui;background:#0f172a;color:#f1f5f9;padding:2rem}a{color:#0ea5e9}.card{background:#1e293b;padding:1.5rem;border-radius:.75rem;max-width:640px;margin:0 auto}</style></head><body><div class="card"><h1>${t(lang,"wizardTitle")}</h1><ol><li>${t(lang,"wizardStep1")}</li><li>${t(lang,"wizardStep2")}</li><li>${t(lang,"wizardStep3")}</li><li>${t(lang,"wizardStep4")}</li></ol><p>${t(lang,"wizardNote")}</p><p><a href="/admin?lang=${lang}">${t(lang,"dashboard")}</a></p></div></body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const lang = getLang(request);
    const path = url.pathname;
    const host = url.host;

    if ((request.headers.get("Upgrade") || "").toLowerCase() === "websocket") {
      return handleVlessWs(request, env);
    }

    if (path === "/telegram" && request.method === "POST") {
      try {
        const update = await request.json();
        const msg = update && update.message;
        if (!msg) return new Response("ok");
        const chatId = String(msg.chat.id);
        const text = (msg.text || "").trim();
        const isAdmin = env.TELEGRAM_ADMIN_ID && chatId === String(env.TELEGRAM_ADMIN_ID);
        if (text === "/start" || text === "/help") {
          await sendTelegram(env, chatId, isAdmin ? "✅ UltraPlus Admin\n/status /stats /users /add Name /toggle ID /del ID /link ID /help" : "Private bot.");
        } else if (!isAdmin) await sendTelegram(env, chatId, "Access denied.");
        else if (text === "/status" || text === "/stats") {
          const users = await loadUsers(env);
          await sendTelegram(env, chatId,
            "Users: " + users.length +
            "\nActive users: " + users.filter(isUserValid).length +
            "\nProxy OK: " + proxyStats.ok +
            "\nProxy Fail: " + proxyStats.fail +
            "\nAuth Deny: " + proxyStats.auth +
            "\nWS Active: " + proxyStats.active +
            "\nv0.6.6"
          );
        } else if (text === "/users") {
          const users = await loadUsers(env);
          await sendTelegram(env, chatId, users.length ? users.map(function(u){return u.name+"|"+(u.enable?"ON":"OFF")+"|"+u.id.slice(0,8);}).join("\n") : "No users");
        } else if (text.indexOf("/add ") === 0) {
          const name = text.slice(5).trim() || "User";
          let users = await loadUsers(env);
          const nu = { id: uuidv4(), name: name, uuid: uuidv4(), created: Date.now(), enable: true, remark: "tg", expire: 0, totalGB: 0 };
          users.push(nu); await saveUsers(env, users);
          await sendTelegram(env, chatId, "OK " + nu.name + "\nhttps://" + host + "/sub/" + nu.uuid);
        } else if (text.indexOf("/toggle ") === 0) {
          const key = text.slice(8).trim().toLowerCase();
          let users = await loadUsers(env); let found = null;
          users = users.map(function(u){ if (u.id.slice(0,8).toLowerCase()===key||u.uuid.slice(0,8).toLowerCase()===key){ found=Object.assign({},u,{enable:!u.enable}); return found;} return u;});
          if (!found) await sendTelegram(env, chatId, "Not found"); else { await saveUsers(env, users); await sendTelegram(env, chatId, found.name+" -> "+(found.enable?"ON":"OFF")); }
        } else if (text.indexOf("/del ") === 0) {
          const key = text.slice(5).trim().toLowerCase();
          let users = await loadUsers(env); const n = users.length;
          users = users.filter(function(u){return u.id.slice(0,8).toLowerCase()!==key&&u.uuid.slice(0,8).toLowerCase()!==key;});
          if (users.length===n) await sendTelegram(env, chatId, "Not found"); else { await saveUsers(env, users); await sendTelegram(env, chatId, "Deleted"); }
        } else if (text.indexOf("/link ") === 0) {
          const key = text.slice(6).trim().toLowerCase();
          const users = await loadUsers(env);
          const u = users.find(function(x){return x.id.slice(0,8).toLowerCase()===key||x.uuid.slice(0,8).toLowerCase()===key;});
          await sendTelegram(env, chatId, u ? (u.name+"\nhttps://"+host+"/sub/"+u.uuid) : "Not found");
        } else await sendTelegram(env, chatId, "/help");
      } catch (e) {}
      return new Response("ok");
    }

    if (path === "/login" && request.method === "POST") {
      const form = await request.formData();
      const pass = (form.get("pass") || "").toString();
      const expected = env.ADMIN_PASSWORD || "admin";
      if (pass === expected) {
        const h = new Headers({ Location: "/admin?lang=" + lang });
        h.append("Set-Cookie", "up_auth=" + btoa(expected) + "; Path=/; HttpOnly; SameSite=Lax");
        return new Response(null, { status: 302, headers: h });
      }
      return new Response(renderLogin(lang, true), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    if (path === "/logout") {
      const h = new Headers({ Location: "/?lang=" + lang });
      h.append("Set-Cookie", "up_auth=; Path=/; Max-Age=0");
      return new Response(null, { status: 302, headers: h });
    }
    if (path === "/" || path === "/login") return new Response(renderLogin(lang, false), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    if (path === "/wizard") return new Response(renderWizard(lang), { headers: { "Content-Type": "text/html;charset=utf-8" } });

    if (path.startsWith("/admin")) {
      if (!isAuthenticated(request, env)) return new Response(null, { status: 302, headers: { Location: "/?lang=" + lang } });
      let users = await loadUsers(env);
      if (path === "/admin/users/add" && request.method === "POST") {
        const form = await request.formData();
        const name = ((form.get("name") || "User") + "").trim();
        const remark = (form.get("remark") || "") + "";
        const expireDays = parseInt((form.get("expireDays") || "0") + "", 10) || 0;
        const totalGB = parseInt((form.get("totalGB") || "0") + "", 10) || 0;
        users.push({ id: uuidv4(), name: name, uuid: uuidv4(), created: Date.now(), enable: true, remark: remark, expire: expireDays > 0 ? Date.now() + expireDays * 86400000 : 0, totalGB: totalGB });
        await saveUsers(env, users);
        return new Response(null, { status: 302, headers: { Location: "/admin/users?lang=" + lang } });
      }
      if (path === "/admin/users/toggle" && request.method === "POST") {
        const form = await request.formData();
        const id = (form.get("id") || "") + "";
        users = users.map(function(u){ return u.id === id ? Object.assign({}, u, { enable: !u.enable }) : u; });
        await saveUsers(env, users);
        return new Response(null, { status: 302, headers: { Location: "/admin/users?lang=" + lang } });
      }
      if (path === "/admin/users/delete" && request.method === "POST") {
        const form = await request.formData();
        const id = (form.get("id") || "") + "";
        users = users.filter(function(u){ return u.id !== id; });
        await saveUsers(env, users);
        return new Response(null, { status: 302, headers: { Location: "/admin/users?lang=" + lang } });
      }
      if (path === "/admin/settings/save" && request.method === "POST") {
        const form = await request.formData();
        const settings = { path: ((form.get("path") || "/") + "").trim() || "/", remark: ((form.get("remark") || "UltraPlus") + "").trim() || "UltraPlus", sni: ((form.get("sni") || "") + "").trim(), fp: ((form.get("fp") || "chrome") + "").trim() || "chrome" };
        await saveSettings(env, settings);
        return new Response(null, { status: 302, headers: { Location: "/admin/settings?lang=" + lang } });
      }
      if (path === "/admin/export") {
        return new Response(JSON.stringify({ project: "UltraPlus-Free", version: "0.6.6", exportedAt: new Date().toISOString(), users: users }, null, 2), {
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Content-Disposition": "attachment; filename=ultraplus-users.json"
          }
        });
      }
      if (path === "/admin" || path === "/admin/") {
        const settings = await loadSettings(env);
        return new Response(renderDashboard(lang, users, settings), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }
      if (path === "/admin/users") return new Response(renderUsers(lang, host, users), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      if (path === "/admin/configs") return new Response(renderConfigs(lang, host), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      if (path === "/admin/settings") {
        const settings = await loadSettings(env);
        return new Response(renderSettings(lang, settings), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }
    }

    if (path.startsWith("/sub/")) {
      const uuid = path.slice(5).split("?")[0];
      const format = (url.searchParams.get("format") || "base64").toLowerCase();
      const users = await loadUsers(env);
      const settings = await loadSettings(env);
      const user = users.find(function(u){ return u.uuid === uuid && isUserValid(u); });
      if (!user) return new Response("Not found or expired/disabled", { status: 404 });
      const link = buildVlessLink(user, host, settings);
      const headers = { "Profile-Update-Interval": "6", "Subscription-Userinfo": "upload=0; download=0; total=" + ((user.totalGB || 0) * 1073741824) + "; expire=" + (user.expire ? Math.floor(user.expire / 1000) : 0) };
      if (format === "raw" || format === "text") {
        headers["Content-Type"] = "text/plain;charset=utf-8";
        return new Response(link + "\n", { headers: headers });
      }
      if (format === "clash") {
        headers["Content-Type"] = "text/yaml;charset=utf-8";
        return new Response(buildClashConfig(user, host, settings), { headers: headers });
      }
      headers["Content-Type"] = "text/plain;charset=utf-8";
      return new Response(btoa(link + "\n"), { headers: headers });
    }

    if (path === "/health") {
      const users = await loadUsers(env);
      return Response.json({ status: "ok", project: "UltraPlus-Free", version: "0.6.6", phase: "7.6", users: users.length, active: users.filter(isUserValid).length, kv: !!env.ULTRA_KV, telegram: !!env.TELEGRAM_BOT_TOKEN, proxy: true, pathMatch: true, hardened: true, queueCap: 64, stats: proxyStats, maxActive: MAX_ACTIVE });
    }

    return new Response("UltraPlus-Free v0.6.6 – /admin or /wizard", { headers: { "Content-Type": "text/plain;charset=utf-8" } });
  },
};
