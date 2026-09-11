/**
 * UltraPlus-Free - Phase 1 Skeleton
 * Clean multi-language admin panel foundation for Cloudflare Workers
 * Built from scratch. No copied code.
 */

export interface Env {
  // ULTRA_KV?: KVNamespace; // enable later
}

const LANGUAGES = ["en", "fa", "zh"] as const;
type Lang = (typeof LANGUAGES)[number];

const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: "UltraPlus-Free Panel",
    subtitle: "Professional Cloudflare Worker Panel",
    login: "Login",
    password: "Password",
    dashboard: "Dashboard",
    welcome: "Welcome to UltraPlus-Free",
    status: "Status",
    online: "Online",
    users: "Users",
    configs: "Configs",
    settings: "Settings",
    logout: "Logout",
    coming: "Full features coming in next phases",
    lang: "Language",
  },
  fa: {
    title: "پنل UltraPlus-Free",
    subtitle: "پنل حرفه‌ای Cloudflare Worker",
    login: "ورود",
    password: "رمز عبور",
    dashboard: "داشبورد",
    welcome: "به UltraPlus-Free خوش آمدید",
    status: "وضعیت",
    online: "آنلاین",
    users: "کاربران",
    configs: "کانفیگ‌ها",
    settings: "تنظیمات",
    logout: "خروج",
    coming: "ویژگی‌های کامل در فازهای بعدی اضافه می‌شود",
    lang: "زبان",
  },
  zh: {
    title: "UltraPlus-Free 面板",
    subtitle: "专业 Cloudflare Worker 面板",
    login: "登录",
    password: "密码",
    dashboard: "仪表盘",
    welcome: "欢迎使用 UltraPlus-Free",
    status: "状态",
    online: "在线",
    users: "用户",
    configs: "配置",
    settings: "设置",
    logout: "退出",
    coming: "完整功能将在后续阶段推出",
    lang: "语言",
  },
};

function t(lang: Lang, key: string): string {
  return translations[lang][key] || translations.en[key] || key;
}

function getLang(request: Request): Lang {
  const url = new URL(request.url);
  const q = url.searchParams.get("lang");
  if (q && LANGUAGES.includes(q as Lang)) return q as Lang;
  const accept = request.headers.get("Accept-Language") || "";
  if (accept.includes("fa")) return "fa";
  if (accept.includes("zh")) return "zh";
  return "en";
}

function renderLogin(lang: Lang): string {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(lang, "title")}</title>
  <style>
    :root { --primary: #0ea5e9; --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: var(--card); padding: 2.5rem; border-radius: 1rem; width: 100%; max-width: 400px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center; }
    p { text-align: center; opacity: 0.7; margin-bottom: 2rem; font-size: 0.9rem; }
    input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid #334155; background: #0f172a; color: var(--text); margin-bottom: 1rem; font-size: 1rem; }
    button { width: 100%; padding: 0.75rem; border: none; border-radius: 0.5rem; background: var(--primary); color: white; font-weight: 600; cursor: pointer; font-size: 1rem; }
    button:hover { filter: brightness(1.1); }
    .langs { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem; }
    .langs a { color: var(--primary); text-decoration: none; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${t(lang, "title")}</h1>
    <p>${t(lang, "subtitle")}</p>
    <form method="GET" action="/admin">
      <input type="hidden" name="lang" value="${lang}">
      <input type="password" name="pass" placeholder="${t(lang, "password")}" required>
      <button type="submit">${t(lang, "login")}</button>
    </form>
    <div class="langs">
      <a href="?lang=en">English</a>
      <a href="?lang=fa">فارسی</a>
      <a href="?lang=zh">中文</a>
    </div>
  </div>
</body>
</html>`;
}

function renderDashboard(lang: Lang): string {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(lang, "dashboard")} - UltraPlus-Free</title>
  <style>
    :root { --primary: #0ea5e9; --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --border: #334155; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
    header { background: var(--card); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 0.5rem; }
    header h1 { font-size: 1.25rem; }
    nav a { color: var(--text); text-decoration: none; margin-left: 1rem; opacity: 0.8; }
    nav a:hover { opacity: 1; color: var(--primary); }
    main { padding: 2rem 1.5rem; max-width: 1100px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 1.5rem; }
    .card { background: var(--card); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border); }
    .card h3 { font-size: 0.9rem; opacity: 0.7; margin-bottom: 0.5rem; }
    .card p { font-size: 1.5rem; font-weight: 600; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; }
    .note { margin-top: 2rem; padding: 1rem; background: #1e293b; border-radius: 0.5rem; border-left: 4px solid var(--primary); opacity: 0.9; line-height: 1.6; }
  </style>
</head>
<body>
  <header>
    <h1>${t(lang, "title")}</h1>
    <nav>
      <a href="?lang=${lang}">${t(lang, "dashboard")}</a>
      <a href="?lang=${lang}">${t(lang, "users")}</a>
      <a href="?lang=${lang}">${t(lang, "configs")}</a>
      <a href="?lang=${lang}">${t(lang, "settings")}</a>
      <a href="/?lang=${lang}">${t(lang, "logout")}</a>
    </nav>
  </header>
  <main>
    <h2>${t(lang, "welcome")}</h2>
    <div class="grid">
      <div class="card">
        <h3>${t(lang, "status")}</h3>
        <p><span class="badge">${t(lang, "online")}</span></p>
      </div>
      <div class="card">
        <h3>${t(lang, "users")}</h3>
        <p>0</p>
      </div>
      <div class="card">
        <h3>${t(lang, "configs")}</h3>
        <p>—</p>
      </div>
    </div>
    <div class="note">
      ${t(lang, "coming")}<br><br>
      Phase 1 skeleton is live. Next: real user management, VLESS, Wizard & Telegram bot.
    </div>
  </main>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const lang = getLang(request);
    const path = url.pathname;

    if (path === "/" || path === "/login") {
      return new Response(renderLogin(lang), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (path === "/admin" || path.startsWith("/admin")) {
      // TODO Phase 2: real password check + session
      return new Response(renderDashboard(lang), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (path === "/health") {
      return Response.json({ status: "ok", project: "UltraPlus-Free", phase: 1 });
    }

    return new Response("UltraPlus-Free Worker is running. Go to /admin", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
