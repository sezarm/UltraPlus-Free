/**
 * UltraPlus-Free v0.4.2 - Single File Worker
 * Self-hosted multi-language panel
 * NEW: Telegram /add /toggle /del /link + panel toggle
 * Download and upload to Cloudflare Workers.
 */

const LANGUAGES = ["en", "fa", "zh"];

const translations = {
  en: {
    title: "UltraPlus-Free", subtitle: "Your private powerful panel", login: "Login", password: "Password",
    dashboard: "Dashboard", welcome: "Welcome to your panel", status: "Status", online: "Online",
    users: "Users", configs: "Configs", settings: "Settings", wizard: "Wizard", logout: "Logout",
    addUser: "Add User", name: "Name", remark: "Remark", enable: "Enable", disable: "Disable",
    delete: "Delete", subLink: "Sub Link", wrongPass: "Wrong password", noUsers: "No users yet",
    phase: "v0.4.2", uuid: "UUID", actions: "Actions",
    passWarning: "This password is ONLY for YOUR panel. Change it after first login.",
    defaultPass: "Default is admin. Set ADMIN_PASSWORD in Worker variables.",
    important: "Important", kvNote: "KV optional. Without it users reset on redeploy.",
    botNote: "Telegram bot optional. Set TELEGRAM_BOT_TOKEN + TELEGRAM_ADMIN_ID.",
    wizardTitle: "Quick Install Wizard",
    wizardStep1: "1. Deploy this Worker to your Cloudflare account",
    wizardStep2: "2. Open /admin and login (default: admin)",
    wizardStep3: "3. Set ADMIN_PASSWORD in Worker settings",
    wizardStep4: "4. Add users and share their private /sub/ links",
    wizardNote: "Self-hosted. Every person creates their own panel.",
    expire: "Expire (days, 0=never)", traffic: "Traffic GB (0=unlimited)", never: "Never", unlimited: "Unlimited",
    toggle: "Toggle", copy: "Copy Link"
  },
  fa: {
    title: "UltraPlus-Free", subtitle: "پنل قدرتمند و شخصی شما", login: "ورود", password: "رمز عبور",
    dashboard: "داشبورد", welcome: "به پنل خودتان خوش آمدید", status: "وضعیت", online: "آنلاین",
    users: "کاربران", configs: "کانفیگ‌ها", settings: "تنظیمات", wizard: "ویزارد", logout: "خروج",
    addUser: "افزودن کاربر", name: "نام", remark: "توضیح", enable: "فعال", disable: "غیرفعال",
    delete: "حذف", subLink: "لینک ساب", wrongPass: "رمز اشتباه است", noUsers: "هنوز کاربری وجود ندارد",
    phase: "نسخه ۰.۴.۲", uuid: "UUID", actions: "عملیات",
    passWarning: "این رمز فقط برای پنل شماست. بعد از ورود عوض کنید.",
    defaultPass: "پیش‌فرض admin است. با ADMIN_PASSWORD عوض کنید.",
    important: "مهم", kvNote: "KV اختیاری است. بدون آن با ری‌دیپلوی پاک می‌شود.",
    botNote: "ربات تلگرام اختیاری است.",
    wizardTitle: "ویزارد نصب سریع",
    wizardStep1: "۱. Worker را روی Cloudflare خود دیپلوی کنید",
    wizardStep2: "۲. به /admin بروید (رمز پیش‌فرض: admin)",
    wizardStep3: "۳. ADMIN_PASSWORD را تنظیم کنید",
    wizardStep4: "۴. کاربر اضافه کنید و لینک /sub/ بدهید",
    wizardNote: "کاملاً شخصی. هر نفر پنل خودش را می‌سازد.",
    expire: "انقضا (روز، ۰=بدون انقضا)", traffic: "حجم گیگ (۰=نامحدود)", never: "بدون انقضا", unlimited: "نامحدود",
    toggle: "فعال/غیرفعال", copy: "کپی لینک"
  },
  zh: {
    title: "UltraPlus-Free", subtitle: "你的强大私人面板", login: "登录", password: "密码",
    dashboard: "仪表盘", welcome: "欢迎来到你的面板", status: "状态", online: "在线",
    users: "用户", configs: "配置", settings: "设置", wizard: "向导", logout: "退出",
    addUser: "添加用户", name: "名称", remark: "备注", enable: "启用", disable: "禁用",
    delete: "删除", subLink: "订阅链接", wrongPass: "密码错误", noUsers: "暂无用户",
    phase: "v0.4.2", uuid: "UUID", actions: "操作",
    passWarning: "此密码仅属于你的面板。请立即修改。",
    defaultPass: "默认 admin。请设置 ADMIN_PASSWORD。",
    important: "重要", kvNote: "KV 可选。没有时重新部署会丢失。",
    botNote: "Telegram 机器人可选。",
    wizardTitle: "快速安装向导",
    wizardStep1: "1. 部署到你的 Cloudflare",
    wizardStep2: "2. 打开 /admin（默认密码 admin）",
    wizardStep3: "3. 设置 ADMIN_PASSWORD",
    wizardStep4: "4. 添加用户并分享 /sub/ 链接",
    wizardNote: "完全自托管。每人创建自己的面板。",
    expire: "过期天数 (0=永久)", traffic: "流量GB (0=无限)", never: "永久", unlimited: "无限",
    toggle: "切换", copy: "复制链接"
  }
};

function t(lang, key) {
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

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

async function loadUsers(env) {
  if (env.ULTRA_KV) {
    const data = await env.ULTRA_KV.get("users", "json");
    return data || [];
  }
  return memoryUsers;
}

async function saveUsers(env, users) {
  if (env.ULTRA_KV) {
    await env.ULTRA_KV.put("users", JSON.stringify(users));
  } else {
    memoryUsers = users;
  }
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function isAuthenticated(request, env) {
  const token = getCookie(request, "up_auth");
  const expected = env.ADMIN_PASSWORD || "admin";
  return token === btoa(expected);
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "HTML" }),
    });
  } catch (e) {}
}

function buildVlessLink(user, host) {
  const name = encodeURIComponent(user.name || "UltraPlus");
  return "vless://" + user.uuid + "@" + host + ":443?encryption=none&security=tls&sni=" + host + "&fp=chrome&type=ws&host=" + host + "&path=%2F#" + name;
}

function renderLogin(lang, error) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t(lang,"title")}</title><style>:root{--p:#0ea5e9;--bg:#0f172a;--c:#1e293b;--t:#f1f5f9;--d:#ef4444}*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh;display:flex;align-items:center;justify-content:center}.card{background:var(--c);padding:2.5rem;border-radius:1rem;width:100%;max-width:420px;box-shadow:0 25px 50px -12px #0008}h1{font-size:1.5rem;text-align:center;margin-bottom:.5rem}p{text-align:center;opacity:.7;margin-bottom:1rem;font-size:.9rem}input{width:100%;padding:.75rem 1rem;border-radius:.5rem;border:1px solid #334155;background:#0f172a;color:var(--t);margin-bottom:1rem;font-size:1rem}button{width:100%;padding:.75rem;border:none;border-radius:.5rem;background:var(--p);color:#fff;font-weight:600;cursor:pointer;font-size:1rem}.error{color:var(--d);text-align:center;margin-bottom:1rem}.warn{background:#422006;color:#fcd34d;padding:.75rem;border-radius:.5rem;font-size:.8rem;margin-bottom:1rem;line-height:1.4}.langs{display:flex;gap:.75rem;justify-content:center;margin-top:1.5rem}.langs a{color:var(--p);text-decoration:none;font-size:.85rem}</style></head><body><div class="card"><h1>${t(lang,"title")}</h1><p>${t(lang,"subtitle")}</p><div class="warn">${t(lang,"passWarning")}</div>${error?'<div class="error">'+t(lang,"wrongPass")+'</div>':''}<form method="POST" action="/login"><input type="hidden" name="lang" value="${lang}"><input type="password" name="pass" placeholder="${t(lang,"password")}" required autofocus><button type="submit">${t(lang,"login")}</button></form><div class="langs"><a href="/?lang=en">English</a><a href="/?lang=fa">فارسی</a><a href="/?lang=zh">中文</a></div></div></body></html>`;
}

function baseLayout(lang, title, body) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - UltraPlus-Free</title><style>:root{--p:#0ea5e9;--bg:#0f172a;--c:#1e293b;--t:#f1f5f9;--b:#334155;--s:#10b981;--d:#ef4444;--w:#f59e0b}*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh}header{background:var(--c);padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--b);flex-wrap:wrap;gap:.5rem}header h1{font-size:1.2rem}nav a{color:var(--t);text-decoration:none;margin:0 .5rem;opacity:.85;font-size:.9rem}nav a:hover{opacity:1;color:var(--p)}main{padding:1.5rem;max-width:1100px;margin:0 auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin:1.25rem 0}.card{background:var(--c);padding:1.25rem;border-radius:.75rem;border:1px solid var(--b)}.card h3{font-size:.85rem;opacity:.7;margin-bottom:.4rem}.card p{font-size:1.4rem;font-weight:600}.badge{display:inline-block;background:var(--s);color:#fff;padding:.2rem .55rem;border-radius:999px;font-size:.75rem}.badge-off{background:var(--d)}table{width:100%;border-collapse:collapse;margin-top:1rem;font-size:.85rem}th,td{padding:.65rem;text-align:start;border-bottom:1px solid var(--b)}th{opacity:.7}.btn{display:inline-block;padding:.3rem .6rem;border-radius:.4rem;border:none;cursor:pointer;font-size:.75rem;text-decoration:none;color:#fff;background:var(--p);margin:0 .1rem}.btn-d{background:var(--d)}.btn-w{background:var(--w)}.btn-s{background:var(--s)}input{padding:.5rem .75rem;border-radius:.4rem;border:1px solid var(--b);background:#0f172a;color:var(--t);margin:.25rem 0;width:100%;max-width:280px}.form-row{margin-bottom:.7rem}.note{margin-top:1.5rem;padding:1rem;background:var(--c);border-radius:.5rem;border-left:4px solid var(--p);font-size:.9rem;line-height:1.5}.warn{background:#422006;color:#fcd34d;padding:1rem;border-radius:.5rem;margin-bottom:1rem;font-size:.9rem;line-height:1.5}.sub-box{background:#0f172a;padding:.5rem;border-radius:.4rem;font-size:.7rem;word-break:break-all;margin-top:.3rem;max-width:220px}</style></head><body><header><h1>${t(lang,"title")}</h1><nav><a href="/admin?lang=${lang}">${t(lang,"dashboard")}</a><a href="/admin/users?lang=${lang}">${t(lang,"users")}</a><a href="/admin/configs?lang=${lang}">${t(lang,"configs")}</a><a href="/admin/settings?lang=${lang}">${t(lang,"settings")}</a><a href="/wizard?lang=${lang}">${t(lang,"wizard")}</a><a href="/logout?lang=${lang}">${t(lang,"logout")}</a></nav></header><main>${body}</main></body></html>`;
}

function renderDashboard(lang, users) {
  const active = users.filter(isUserValid).length;
  const body = `<h2>${t(lang,"welcome")}</h2><div class="grid"><div class="card"><h3>${t(lang,"status")}</h3><p><span class="badge">${t(lang,"online")}</span></p></div><div class="card"><h3>${t(lang,"users")}</h3><p>${users.length}</p></div><div class="card"><h3>Active</h3><p>${active}</p></div><div class="card"><h3>${t(lang,"phase")}</h3><p>0.4.2</p></div></div><div class="note">${t(lang,"kvNote")}<br>${t(lang,"botNote")}</div>`;
  return baseLayout(lang, t(lang,"dashboard"), body);
}

function renderUsers(lang, host, users) {
  let rows = "";
  if (users.length === 0) {
    rows = `<tr><td colspan="6">${t(lang,"noUsers")}</td></tr>`;
  } else {
    for (const u of users) {
      const sub = "https://" + host + "/sub/" + u.uuid;
      const exp = u.expire && u.expire > 0 ? new Date(u.expire).toLocaleDateString() : t(lang,"never");
      const tr = u.totalGB && u.totalGB > 0 ? u.totalGB + " GB" : t(lang,"unlimited");
      const statusBadge = u.enable ? `<span class="badge">${t(lang,"enable")}</span>` : `<span class="badge badge-off">${t(lang,"disable")}</span>`;
      const toggleLabel = u.enable ? t(lang,"disable") : t(lang,"enable");
      const toggleClass = u.enable ? "btn-w" : "btn-s";
      rows += `<tr><td>${u.name}<div class="sub-box">${sub}</div></td><td style="font-size:.75rem">${u.uuid.slice(0,8)}...</td><td>${statusBadge}</td><td>${exp}</td><td>${tr}</td><td><a class="btn" href="${sub}" target="_blank">${t(lang,"subLink")}</a><form method="POST" action="/admin/users/toggle" style="display:inline"><input type="hidden" name="id" value="${u.id}"><input type="hidden" name="lang" value="${lang}"><button class="btn ${toggleClass}" type="submit">${toggleLabel}</button></form><form method="POST" action="/admin/users/delete" style="display:inline"><input type="hidden" name="id" value="${u.id}"><input type="hidden" name="lang" value="${lang}"><button class="btn btn-d" type="submit">${t(lang,"delete")}</button></form></td></tr>`;
    }
  }
  const body = `<h2>${t(lang,"users")}</h2><form method="POST" action="/admin/users/add" style="margin:1rem 0;padding:1rem;background:var(--c);border-radius:.75rem"><div class="form-row"><input name="name" placeholder="${t(lang,"name")}" required></div><div class="form-row"><input name="remark" placeholder="${t(lang,"remark")}"></div><div class="form-row"><input name="expireDays" type="number" min="0" value="0" placeholder="${t(lang,"expire")}"></div><div class="form-row"><input name="totalGB" type="number" min="0" value="0" placeholder="${t(lang,"traffic")}"></div><input type="hidden" name="lang" value="${lang}"><button class="btn" type="submit">${t(lang,"addUser")}</button></form><table><thead><tr><th>${t(lang,"name")} / Link</th><th>${t(lang,"uuid")}</th><th>${t(lang,"status")}</th><th>Expire</th><th>Traffic</th><th>${t(lang,"actions")}</th></tr></thead><tbody>${rows}</tbody></table>`;
  return baseLayout(lang, t(lang,"users"), body);
}

function renderConfigs(lang, host) {
  const body = `<h2>${t(lang,"configs")}</h2><div class="note">Private link: <code>/sub/<uuid></code><br>Only share the private link with each user.</div><p style="margin-top:1rem">Base: <code>https://${host}/sub/<uuid></code></p>`;
  return baseLayout(lang, t(lang,"configs"), body);
}

function renderSettings(lang) {
  const body = `<h2>${t(lang,"settings")}</h2><div class="warn"><strong>${t(lang,"important")}</strong><br>${t(lang,"passWarning")}<br><br>${t(lang,"defaultPass")}</div><div class="note">${t(lang,"kvNote")}<br><br>${t(lang,"botNote")}<br>Webhook: <code>https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-WORKER/telegram</code><br>Bot commands: /status /users /add Name /toggle ID /del ID /link ID /help</div>`;
  return baseLayout(lang, t(lang,"settings"), body);
}

function renderWizard(lang) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t(lang,"wizardTitle")}</title><style>:root{--p:#0ea5e9;--bg:#0f172a;--c:#1e293b;--t:#f1f5f9}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh;padding:2rem 1rem}.box{max-width:640px;margin:0 auto}h1{font-size:1.6rem;margin-bottom:1rem}.card{background:var(--c);padding:1.5rem;border-radius:.75rem;margin-bottom:1rem}ol{padding-left:1.25rem;line-height:1.8}a{color:var(--p)}</style></head><body><div class="box"><h1>${t(lang,"wizardTitle")}</h1><div class="card"><ol><li>${t(lang,"wizardStep1")}</li><li>${t(lang,"wizardStep2")}</li><li>${t(lang,"wizardStep3")}</li><li>${t(lang,"wizardStep4")}</li></ol><p style="margin-top:1rem;opacity:.85">${t(lang,"wizardNote")}</p></div><p><a href="/admin?lang=${lang}">${t(lang,"dashboard")}</a> · <a href="/?lang=${lang}">${t(lang,"login")}</a></p></div></body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const lang = getLang(request);
    const path = url.pathname;
    const host = url.host;

    if (path === "/telegram" && request.method === "POST") {
      try {
        const update = await request.json();
        const msg = update && update.message;
        if (!msg) return new Response("ok");
        const chatId = String(msg.chat.id);
        const text = (msg.text || "").trim();
        const isAdmin = env.TELEGRAM_ADMIN_ID && chatId === String(env.TELEGRAM_ADMIN_ID);
        if (text === "/start" || text === "/help") {
          if (!isAdmin) await sendTelegram(env, chatId, "This bot is private.");
          else await sendTelegram(env, chatId, "✅ <b>UltraPlus-Free Admin</b>\n\n/status — panel status\n/users — list users\n/add Name — create user\n/toggle ID — enable/disable\n/del ID — delete user\n/link ID — get sub link\n/help — this message");
        } else if (!isAdmin) {
          await sendTelegram(env, chatId, "Access denied.");
        } else if (text === "/status") {
          const users = await loadUsers(env);
          const active = users.filter(isUserValid).length;
          await sendTelegram(env, chatId, "Online\nUsers: " + users.length + "\nActive: " + active + "\nKV: " + (env.ULTRA_KV ? "Yes" : "No") + "\nVersion: 0.4.2");
        } else if (text === "/users") {
          const users = await loadUsers(env);
          if (!users.length) await sendTelegram(env, chatId, "No users. Use /add Name");
          else await sendTelegram(env, chatId, users.map(function(u){return "• " + u.name + " | " + (u.enable?"ON":"OFF") + " | id:" + u.id.slice(0,8);}).join("\n"));
        } else if (text.indexOf("/add ") === 0) {
          const name = text.slice(5).trim() || "User";
          let users = await loadUsers(env);
          const nu = { id: uuidv4(), name: name, uuid: uuidv4(), created: Date.now(), enable: true, remark: "telegram", expire: 0, totalGB: 0 };
          users.push(nu);
          await saveUsers(env, users);
          await sendTelegram(env, chatId, "Created: " + nu.name + "\nid:" + nu.id.slice(0,8) + "\nhttps://" + host + "/sub/" + nu.uuid);
        } else if (text.indexOf("/toggle ") === 0) {
          const key = text.slice(8).trim().toLowerCase();
          let users = await loadUsers(env);
          let found = null;
          users = users.map(function(u) {
            if (u.id.slice(0,8).toLowerCase() === key || u.uuid.slice(0,8).toLowerCase() === key) { found = Object.assign({}, u, { enable: !u.enable }); return found; }
            return u;
          });
          if (!found) await sendTelegram(env, chatId, "Not found. Use id from /users");
          else { await saveUsers(env, users); await sendTelegram(env, chatId, found.name + " -> " + (found.enable ? "ON" : "OFF")); }
        } else if (text.indexOf("/del ") === 0) {
          const key = text.slice(5).trim().toLowerCase();
          let users = await loadUsers(env);
          const before = users.length;
          users = users.filter(function(u){ return u.id.slice(0,8).toLowerCase() !== key && u.uuid.slice(0,8).toLowerCase() !== key; });
          if (users.length === before) await sendTelegram(env, chatId, "Not found.");
          else { await saveUsers(env, users); await sendTelegram(env, chatId, "Deleted."); }
        } else if (text.indexOf("/link ") === 0) {
          const key = text.slice(6).trim().toLowerCase();
          const users = await loadUsers(env);
          const u = users.find(function(x){ return x.id.slice(0,8).toLowerCase() === key || x.uuid.slice(0,8).toLowerCase() === key; });
          if (!u) await sendTelegram(env, chatId, "Not found.");
          else await sendTelegram(env, chatId, u.name + "\nhttps://" + host + "/sub/" + u.uuid);
        } else {
          await sendTelegram(env, chatId, "Unknown. /help");
        }
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

    if (path === "/" || path === "/login") {
      return new Response(renderLogin(lang, false), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    if (path === "/wizard") {
      return new Response(renderWizard(lang), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    if (path.startsWith("/admin")) {
      if (!isAuthenticated(request, env)) {
        return new Response(null, { status: 302, headers: { Location: "/?lang=" + lang } });
      }
      let users = await loadUsers(env);

      if (path === "/admin/users/add" && request.method === "POST") {
        const form = await request.formData();
        const name = ((form.get("name") || "User") + "").trim();
        const remark = (form.get("remark") || "") + "";
        const expireDays = parseInt((form.get("expireDays") || "0") + "", 10) || 0;
        const totalGB = parseInt((form.get("totalGB") || "0") + "", 10) || 0;
        const expire = expireDays > 0 ? Date.now() + expireDays * 86400000 : 0;
        users.push({ id: uuidv4(), name: name, uuid: uuidv4(), created: Date.now(), enable: true, remark: remark, expire: expire, totalGB: totalGB });
        await saveUsers(env, users);
        return new Response(null, { status: 302, headers: { Location: "/admin/users?lang=" + lang } });
      }

      if (path === "/admin/users/toggle" && request.method === "POST") {
        const form = await request.formData();
        const id = (form.get("id") || "") + "";
        users = users.map(function(u) { if (u.id === id) return Object.assign({}, u, { enable: !u.enable }); return u; });
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

      if (path === "/admin" || path === "/admin/") {
        return new Response(renderDashboard(lang, users), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }
      if (path === "/admin/users") {
        return new Response(renderUsers(lang, host, users), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }
      if (path === "/admin/configs") {
        return new Response(renderConfigs(lang, host), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }
      if (path === "/admin/settings") {
        return new Response(renderSettings(lang), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }
    }

    if (path.startsWith("/sub/")) {
      const uuid = path.slice(5);
      const users = await loadUsers(env);
      const user = users.find(function(u){ return u.uuid === uuid && isUserValid(u); });
      if (!user) return new Response("Not found or expired/disabled", { status: 404 });
      const link = buildVlessLink(user, host);
      const body = btoa(link + "\n");
      return new Response(body, {
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
          "Profile-Update-Interval": "6",
          "Subscription-Userinfo": "upload=0; download=0; total=" + ((user.totalGB || 0) * 1073741824) + "; expire=" + (user.expire ? Math.floor(user.expire / 1000) : 0),
        },
      });
    }

    if (path === "/health") {
      const users = await loadUsers(env);
      return Response.json({ status: "ok", project: "UltraPlus-Free", version: "0.4.2", users: users.length, active: users.filter(isUserValid).length, kv: !!env.ULTRA_KV, telegram: !!env.TELEGRAM_BOT_TOKEN });
    }

    return new Response("UltraPlus-Free v0.4.2 – /admin or /wizard", { headers: { "Content-Type": "text/plain;charset=utf-8" } });
  },
};
