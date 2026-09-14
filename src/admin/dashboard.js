import { APP_NAME, APP_VERSION } from "../core/constants.js";

const CSS = `
:root{--bg:#0b1220;--c:#151e32;--t:#e8eefc;--p:#3b82f6;--b:#243049;--s:#22c55e;--d:#ef4444}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Tahoma,sans-serif;background:var(--bg);color:var(--t)}
a{color:var(--p);text-decoration:none}.wrap{max-width:960px;margin:0 auto;padding:1rem}
.top{display:flex;align-items:center;justify-content:space-between;background:var(--c);padding:.75rem 1rem;border-bottom:1px solid var(--b);position:sticky;top:0;z-index:20}
.brand{font-weight:700}.hb{background:none;border:1px solid var(--b);color:var(--t);padding:.35rem .65rem;border-radius:.4rem;font-size:1.2rem}
.menu{display:none;flex-direction:column;background:var(--c)}.menu.open{display:flex}.menu a{padding:.85rem 1rem;border-bottom:1px solid var(--b);color:var(--t)}
@media(min-width:768px){.hb{display:none}.menu{display:flex!important;flex-direction:row;background:transparent}.menu a{border:0;padding:.4rem .75rem}}
.card{background:var(--c);border:1px solid var(--b);border-radius:.75rem;padding:1.25rem;margin:1rem 0}
input,button{padding:.65rem .8rem;border-radius:.45rem;border:1px solid var(--b);background:#0b1220;color:var(--t);margin:.25rem 0;width:100%}
button{background:var(--p);border:none;font-weight:600;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem}
.stat{background:#0b1220;padding:.85rem;border-radius:.5rem;border:1px solid var(--b)}.stat b{display:block;font-size:1.25rem}
.err{color:var(--d);text-align:center}.foot{text-align:center;opacity:.4;font-size:.75rem;padding:1.5rem}
label{font-size:.85rem;opacity:.85}
`;

function shell(lang, title, body) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${CSS}</style></head>
<body><div class="top"><div class="brand">${APP_NAME}</div>
<button class="hb" type="button" onclick="document.getElementById('m').classList.toggle('open')">☰</button>
<nav class="menu" id="m">
<a href="/admin?lang=${lang}">Overview</a>
<a href="/admin?lang=${lang}">Users</a>
<a href="/admin?lang=${lang}">Settings</a>
<a href="/logout">Logout</a>
</nav></div><div class="wrap">${body}</div><div class="foot">${APP_NAME} · ${APP_VERSION} · Phase 1</div></body></html>`;
}

export function setupPage(lang = "fa", error = "") {
  const dir = lang === "fa" ? "rtl" : "ltr";
  const title = lang === "fa" ? "راه‌اندازی اولیه" : "First-run setup";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${CSS}
body{display:flex;min-height:100vh;align-items:center;justify-content:center}.box{width:92%;max-width:420px}</style></head>
<body><div class="box card">
<h1 style="text-align:center">${title}</h1>
<p style="text-align:center;opacity:.7">${APP_NAME} · ${APP_VERSION}</p>
${error ? `<p class="err">${error}</p>` : ""}
<form method="POST" action="/setup">
<input type="hidden" name="lang" value="${lang}">
<label>Username</label>
<input name="username" required minlength="3" autocomplete="username">
<label>Password (min 8)</label>
<input type="password" name="password" required minlength="8" autocomplete="new-password">
<label>Confirm</label>
<input type="password" name="confirm" required minlength="8" autocomplete="new-password">
<button type="submit">${lang === "fa" ? "تکمیل نصب" : "Complete setup"}</button>
</form>
<p style="text-align:center;margin-top:1rem"><a href="/setup?lang=fa">فارسی</a> · <a href="/setup?lang=en">English</a></p>
</div></body></html>`;
}

export function loginPage(lang = "fa", wrong = false) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login</title><style>${CSS}
body{display:flex;min-height:100vh;align-items:center;justify-content:center}.box{width:92%;max-width:380px}</style></head>
<body><div class="box card">
<h1 style="text-align:center">${APP_NAME}</h1>
${wrong ? `<p class="err">${lang === "fa" ? "ورود ناموفق" : "Login failed"}</p>` : ""}
<form method="POST" action="/login">
<input type="hidden" name="lang" value="${lang}">
<label>Username</label>
<input name="username" required autocomplete="username">
<label>Password</label>
<input type="password" name="password" required autocomplete="current-password">
<button type="submit">${lang === "fa" ? "ورود" : "Login"}</button>
</form>
<p style="text-align:center;margin-top:1rem"><a href="/login?lang=fa">فارسی</a> · <a href="/login?lang=en">English</a></p>
</div></body></html>`;
}

export function dashboardPage(lang, info) {
  return shell(
    lang,
    "Dashboard",
    `<h2>${lang === "fa" ? "نمای کلی" : "Overview"}</h2>
<div class="grid">
<div class="stat"><span>Version</span><b>${info.version}</b></div>
<div class="stat"><span>D1</span><b>${info.hasD1 ? "ON" : "OFF"}</b></div>
<div class="stat"><span>KV</span><b>${info.hasKv ? "ON" : "OFF"}</b></div>
<div class="stat"><span>Phase</span><b>1</b></div>
</div>
<div class="card">
<p>${lang === "fa"
      ? "فاز ۱: معماری ماژولار، ویزارد نصب، احراز هویت امن، health، اسکلت داشبورد."
      : "Phase 1: modular architecture, setup wizard, secure auth, health, dashboard shell."}</p>
<p style="opacity:.7;font-size:.9rem">Next: users, subscriptions, protocols, Telegram, backup.</p>
</div>`
  );
}
