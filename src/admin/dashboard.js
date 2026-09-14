import { APP_NAME, APP_VERSION } from "../core/constants.js";
import { formatDate } from "../utils/dates.js";

const CSS = `:root{--bg:#0b1220;--c:#151e32;--t:#e8eefc;--p:#3b82f6;--b:#243049;--s:#22c55e;--d:#ef4444;--w:#f59e0b}*{box-sizing:border-box}body{margin:0;font-family:system-ui,Tahoma,sans-serif;background:var(--bg);color:var(--t)}a{color:var(--p);text-decoration:none}.wrap{max-width:1100px;margin:0 auto;padding:1rem}.top{display:flex;align-items:center;justify-content:space-between;background:var(--c);padding:.75rem 1rem;border-bottom:1px solid var(--b);position:sticky;top:0;z-index:20}.brand{font-weight:700}.hb{background:none;border:1px solid var(--b);color:var(--t);padding:.35rem .65rem;border-radius:.4rem;font-size:1.2rem}.menu{display:none;flex-direction:column;background:var(--c)}.menu.open{display:flex}.menu a{padding:.85rem 1rem;border-bottom:1px solid var(--b);color:var(--t)}@media(min-width:768px){.hb{display:none}.menu{display:flex!important;flex-direction:row;background:transparent}.menu a{border:0;padding:.4rem .75rem}}.card{background:var(--c);border:1px solid var(--b);border-radius:.75rem;padding:1.25rem;margin:1rem 0}input,button,select{padding:.55rem .7rem;border-radius:.45rem;border:1px solid var(--b);background:#0b1220;color:var(--t);margin:.2rem}button,.btn{background:var(--p);color:#fff;border:none;font-weight:600;cursor:pointer;display:inline-block;padding:.45rem .75rem;border-radius:.45rem;font-size:.85rem;text-decoration:none}.btn-d{background:var(--d)}.btn-s{background:var(--s)}.btn-w{background:var(--w)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.75rem}.stat{background:#0b1220;padding:.85rem;border-radius:.5rem;border:1px solid var(--b)}.stat b{display:block;font-size:1.2rem}.err{color:var(--d);text-align:center}.foot{text-align:center;opacity:.4;font-size:.75rem;padding:1.5rem}label{font-size:.85rem;opacity:.85;display:block;margin-top:.4rem}table{width:100%;border-collapse:collapse;font-size:.82rem}th,td{padding:.55rem;border-bottom:1px solid var(--b);text-align:start;vertical-align:top}.badge{display:inline-block;padding:.1rem .45rem;border-radius:999px;font-size:.7rem;background:var(--s);color:#fff}.badge-off{background:var(--d)}.badge-exp{background:var(--w)}.sub{word-break:break-all;font-size:.7rem;opacity:.85;margin-top:.25rem}.form-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:end}.form-row input{width:auto;min-width:120px}.filters a{margin-inline-end:.5rem;font-size:.85rem}`;

function escapeHtml(s) {
  return String(s || "").replace(/&/g, "&").replace(/</g, "<").replace(/"/g, """);
}

function shell(lang, title, body) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${CSS}</style></head>
<body><div class="top"><div class="brand">${APP_NAME}</div>
<button class="hb" type="button" onclick="document.getElementById('m').classList.toggle('open')">☰</button>
<nav class="menu" id="m">
<a href="/admin?lang=${lang}">${lang === "fa" ? "نمای کلی" : "Overview"}</a>
<a href="/admin/users?lang=${lang}">${lang === "fa" ? "کاربران" : "Users"}</a>
<a href="/logout">${lang === "fa" ? "خروج" : "Logout"}</a>
</nav></div><div class="wrap">${body}</div><div class="foot">${APP_NAME} · ${APP_VERSION} · Phase 2</div>
<script>function cp(t){navigator.clipboard.writeText(t).then(function(){alert('OK')})}</script>
</body></html>`;
}

export function setupPage(lang = "fa", error = "") {
  const dir = lang === "fa" ? "rtl" : "ltr";
  const title = lang === "fa" ? "راه‌اندازی اولیه" : "First-run setup";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${CSS}body{display:flex;min-height:100vh;align-items:center;justify-content:center}.box{width:92%;max-width:420px}input,button{width:100%}</style></head>
<body><div class="box card"><h1 style="text-align:center">${title}</h1>
${error ? `<p class="err">${error}</p>` : ""}
<form method="POST" action="/setup"><input type="hidden" name="lang" value="${lang}">
<label>Username</label><input name="username" required minlength="3">
<label>Password (min 8)</label><input type="password" name="password" required minlength="8">
<label>Confirm</label><input type="password" name="confirm" required minlength="8">
<button type="submit">${lang === "fa" ? "تکمیل نصب" : "Complete setup"}</button></form>
<p style="text-align:center;margin-top:1rem"><a href="/setup?lang=fa">فارسی</a> · <a href="/setup?lang=en">English</a></p>
</div></body></html>`;
}

export function loginPage(lang = "fa", wrong = false) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login</title><style>${CSS}body{display:flex;min-height:100vh;align-items:center;justify-content:center}.box{width:92%;max-width:380px}input,button{width:100%}</style></head>
<body><div class="box card"><h1 style="text-align:center">${APP_NAME}</h1>
${wrong ? `<p class="err">${lang === "fa" ? "ورود ناموفق" : "Login failed"}</p>` : ""}
<form method="POST" action="/login"><input type="hidden" name="lang" value="${lang}">
<label>Username</label><input name="username" required>
<label>Password</label><input type="password" name="password" required>
<button type="submit">${lang === "fa" ? "ورود" : "Login"}</button></form>
<p style="text-align:center;margin-top:1rem"><a href="/login?lang=fa">فارسی</a> · <a href="/login?lang=en">English</a></p>
</div></body></html>`;
}

export function dashboardPage(lang, info) {
  const s = info.stats || {};
  return shell(lang, "Dashboard", `<h2>${lang === "fa" ? "نمای کلی" : "Overview"}</h2>
<div class="grid">
<div class="stat"><span>${lang === "fa" ? "کل کاربران" : "Users"}</span><b>${s.total ?? 0}</b></div>
<div class="stat"><span>${lang === "fa" ? "فعال" : "Active"}</span><b>${s.active ?? 0}</b></div>
<div class="stat"><span>${lang === "fa" ? "غیرفعال" : "Disabled"}</span><b>${s.disabled ?? 0}</b></div>
<div class="stat"><span>${lang === "fa" ? "منقضی" : "Expired"}</span><b>${s.expired ?? 0}</b></div>
<div class="stat"><span>D1</span><b>${info.hasD1 ? "ON" : "OFF"}</b></div>
<div class="stat"><span>KV</span><b>${info.hasKv ? "ON" : "OFF"}</b></div>
</div>
<div class="card"><p><a class="btn" href="/admin/users?lang=${lang}">${lang === "fa" ? "مدیریت کاربران" : "Manage users"}</a></p>
<p style="opacity:.7;font-size:.85rem;margin-top:1rem">Phase 2 · ${info.version}</p></div>`);
}

export function usersPage(lang, { users, host, q, msg }) {
  const fa = lang === "fa";
  let rows = "";
  if (!users.length) rows = `<tr><td colspan="5">${fa ? "کاربری نیست" : "No users"}</td></tr>`;
  else {
    for (const u of users) {
      const sub = `https://${host}/sub/${u.token}`;
      let badge = `<span class="badge">${fa ? "فعال" : "Active"}</span>`;
      if (u.status === "disabled") badge = `<span class="badge badge-off">${fa ? "خاموش" : "Off"}</span>`;
      else if (u.expired) badge = `<span class="badge badge-exp">${fa ? "منقضی" : "Expired"}</span>`;
      rows += `<tr><td><b>${escapeHtml(u.displayName)}</b> ${badge}<div class="sub">${sub}</div></td>
<td style="font-size:.7rem">${u.uuid.slice(0, 8)}…</td><td>${formatDate(u.expiresAt, lang)}</td>
<td>${u.quotaTotal ? Math.round(u.quotaTotal / 1e9) + " GB" : "∞"}</td>
<td style="white-space:nowrap">
<button type="button" class="btn" onclick="cp('${sub}')">${fa ? "کپی" : "Copy"}</button>
<form method="POST" action="/admin/users/toggle" style="display:inline"><input type="hidden" name="lang" value="${lang}"><input type="hidden" name="id" value="${u.id}"><button class="btn btn-w" type="submit">${fa ? "وضعیت" : "Toggle"}</button></form>
<form method="POST" action="/admin/users/regen" style="display:inline"><input type="hidden" name="lang" value="${lang}"><input type="hidden" name="id" value="${u.id}"><button class="btn" type="submit">${fa ? "توکن" : "Regen"}</button></form>
<form method="POST" action="/admin/users/delete" style="display:inline" onsubmit="return confirm('OK?')"><input type="hidden" name="lang" value="${lang}"><input type="hidden" name="id" value="${u.id}"><button class="btn btn-d" type="submit">${fa ? "حذف" : "Del"}</button></form>
</td></tr>`;
    }
  }
  return shell(lang, fa ? "کاربران" : "Users", `<h2>${fa ? "کاربران" : "Users"}</h2>
${msg ? `<div class="card" style="border-color:var(--s)">${escapeHtml(msg)}</div>` : ""}
<div class="card"><form method="POST" action="/admin/users/add" class="form-row">
<input type="hidden" name="lang" value="${lang}">
<div><label>${fa ? "نام" : "Name"}</label><input name="displayName" required></div>
<div><label>${fa ? "روز" : "Days"}</label><input name="days" type="number" value="0" min="0" style="width:5rem"></div>
<div><label>GB</label><input name="quotaGb" type="number" value="0" min="0" step="0.1" style="width:5rem"></div>
<div><button type="submit">${fa ? "افزودن" : "Add"}</button></div></form></div>
<div class="filters card">
<a href="/admin/users?lang=${lang}">${fa ? "همه" : "All"}</a>
<a href="/admin/users?lang=${lang}&status=active">${fa ? "فعال" : "Active"}</a>
<a href="/admin/users?lang=${lang}&status=disabled">${fa ? "خاموش" : "Off"}</a>
<a href="/admin/users?lang=${lang}&status=expired">${fa ? "منقضی" : "Expired"}</a>
<form method="GET" action="/admin/users" style="display:inline"><input type="hidden" name="lang" value="${lang}">
<input name="q" value="${escapeHtml(q || "")}" placeholder="${fa ? "جستجو" : "Search"}"><button type="submit">Go</button></form></div>
<div class="card" style="overflow-x:auto"><table>
<tr><th>${fa ? "نام / ساب" : "Name / Sub"}</th><th>UUID</th><th>${fa ? "انقضا" : "Expiry"}</th><th>Quota</th><th></th></tr>
${rows}</table></div>`);
}
