/**
 * UltraPlus-Free - Phase 2.1
 * Multi-language panel with admin auth, users management & subscription skeleton
 * Each person deploys their own panel and sets their own password.
 */

export interface Env {
  ADMIN_PASSWORD?: string;
  // ULTRA_KV?: KVNamespace; // Phase 3
}

interface User {
  id: string;
  name: string;
  uuid: string;
  created: number;
  enable: boolean;
  remark?: string;
}

const LANGUAGES = ["en", "fa", "zh"] as const;
type Lang = (typeof LANGUAGES)[number];

const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: "UltraPlus-Free",
    subtitle: "Your own private panel on Cloudflare",
    login: "Login",
    password: "Password",
    dashboard: "Dashboard",
    welcome: "Welcome to your panel",
    status: "Status",
    online: "Online",
    users: "Users",
    configs: "Configs",
    settings: "Settings",
    logout: "Logout",
    addUser: "Add User",
    name: "Name",
    remark: "Remark",
    enable: "Enable",
    disable: "Disable",
    delete: "Delete",
    subLink: "Subscription Link",
    wrongPass: "Wrong password",
    noUsers: "No users yet",
    phase: "Phase 2",
    uuid: "UUID",
    actions: "Actions",
    adminPass: "Admin Password",
    passWarning: "This password is ONLY for YOUR panel. Change it after first login.",
    defaultPass: "Default password is admin. Set ADMIN_PASSWORD in Worker environment variables.",
    important: "Important",
  },
  fa: {
    title: "UltraPlus-Free",
    subtitle: "پنل شخصی شما روی Cloudflare",
    login: "ورود",
    password: "رمز عبور",
    dashboard: "داشبورد",
    welcome: "به پنل خودتان خوش آمدید",
    status: "وضعیت",
    online: "آنلاین",
    users: "کاربران",
    configs: "کانفیگ‌ها",
    settings: "تنظیمات",
    logout: "خروج",
    addUser: "افزودن کاربر",
    name: "نام",
    remark: "توضیح",
    enable: "فعال",
    disable: "غیرفعال",
    delete: "حذف",
    subLink: "لینک سابسکریپشن",
    wrongPass: "رمز اشتباه است",
    noUsers: "هنوز کاربری وجود ندارد",
    phase: "فاز ۲",
    uuid: "UUID",
    actions: "عملیات",
    adminPass: "رمز ادمین",
    passWarning: "این رمز فقط برای پنل شماست. بعد از اولین ورود حتماً عوضش کنید.",
    defaultPass: "رمز پیش‌فرض admin است. با متغیر ADMIN_PASSWORD در تنظیمات Worker عوض کنید.",
    important: "مهم",
  },
  zh: {
    title: "UltraPlus-Free",
    subtitle: "你自己的 Cloudflare 私人面板",
    login: "登录",
    password: "密码",
    dashboard: "仪表盘",
    welcome: "欢迎来到你的面板",
    status: "状态",
    online: "在线",
    users: "用户",
    configs: "配置",
    settings: "设置",
    logout: "退出",
    addUser: "添加用户",
    name: "名称",
    remark: "备注",
    enable: "启用",
    disable: "禁用",
    delete: "删除",
    subLink: "订阅链接",
    wrongPass: "密码错误",
    noUsers: "暂无用户",
    phase: "第二阶段",
    uuid: "UUID",
    actions: "操作",
    adminPass: "管理员密码",
    passWarning: "此密码仅属于你自己的面板。首次登录后请立即修改。",
    defaultPass: "默认密码是 admin。请在 Worker 环境变量中设置 ADMIN_PASSWORD。",
    important: "重要",
  },
};

function t(lang: Lang, key: string): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

function getLang(request: Request): Lang {
  const url = new URL(request.url);
  const q = url.searchParams.get("lang");
  if (q && (LANGUAGES as readonly string[]).includes(q)) return q as Lang;
  const accept = request.headers.get("Accept-Language") || "";
  if (accept.includes("fa")) return "fa";
  if (accept.includes("zh")) return "zh";
  return "en";
}

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let usersStore: User[] = [];

function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function isAuthenticated(request: Request, env: Env): boolean {
  const token = getCookie(request, "up_auth");
  const expected = env.ADMIN_PASSWORD || "admin";
  return token === btoa(expected);
}

function renderLogin(lang: Lang, error = false): string {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(lang, "title")}</title>
  <style>
    :root { --primary: #0ea5e9; --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --danger: #ef4444; --warn: #f59e0b; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: var(--card); padding: 2.5rem; border-radius: 1rem; width: 100%; max-width: 420px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; text-align: center; }
    p { text-align: center; opacity: 0.7; margin-bottom: 1rem; font-size: 0.9rem; }
    input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid #334155; background: #0f172a; color: var(--text); margin-bottom: 1rem; font-size: 1rem; }
    button { width: 100%; padding: 0.75rem; border: none; border-radius: 0.5rem; background: var(--primary); color: white; font-weight: 600; cursor: pointer; font-size: 1rem; }
    button:hover { filter: brightness(1.1); }
    .error { color: var(--danger); text-align: center; margin-bottom: 1rem; font-size: 0.9rem; }
    .warn { background: #422006; color: #fcd34d; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.8rem; margin-bottom: 1rem; line-height: 1.4; }
    .langs { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.5rem; }
    .langs a { color: var(--primary); text-decoration: none; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${t(lang, "title")}</h1>
    <p>${t(lang, "subtitle")}</p>
    <div class="warn">${t(lang, "passWarning")}</div>
    ${error ? `<div class="error">${t(lang, "wrongPass")}</div>` : ""}
    <form method="POST" action="/login">
      <input type="hidden" name="lang" value="${lang}">
      <input type="password" name="pass" placeholder="${t(lang, "password")}" required autofocus>
      <button type="submit">${t(lang, "login")}</button>
    </form>
    <div class="langs">
      <a href="/?lang=en">English</a>
      <a href="/?lang=fa">فارسی</a>
      <a href="/?lang=zh">中文</a>
    </div>
  </div>
</body>
</html>`;
}

function baseLayout(lang: Lang, title: string, body: string): string {
  const dir = lang === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - UltraPlus-Free</title>
  <style>
    :root { --primary: #0ea5e9; --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --border: #334155; --success: #10b981; --danger: #ef4444; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
    header { background: var(--card); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 0.5rem; }
    header h1 { font-size: 1.2rem; }
    nav a { color: var(--text); text-decoration: none; margin: 0 0.6rem; opacity: 0.85; font-size: 0.95rem; }
    nav a:hover { opacity: 1; color: var(--primary); }
    main { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.25rem 0; }
    .card { background: var(--card); padding: 1.25rem; border-radius: 0.75rem; border: 1px solid var(--border); }
    .card h3 { font-size: 0.85rem; opacity: 0.7; margin-bottom: 0.4rem; }
    .card p { font-size: 1.4rem; font-weight: 600; }
    .badge { display: inline-block; background: var(--success); color: white; padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.75rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem; text-align: start; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    th { opacity: 0.7; font-weight: 500; }
    .btn { display: inline-block; padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: none; cursor: pointer; font-size: 0.85rem; text-decoration: none; color: white; background: var(--primary); margin: 0 0.2rem; }
    .btn-danger { background: var(--danger); }
    input { padding: 0.5rem 0.75rem; border-radius: 0.4rem; border: 1px solid var(--border); background: #0f172a; color: var(--text); margin: 0.3rem 0; width: 100%; max-width: 320px; }
    .form-row { margin-bottom: 0.8rem; }
    .note { margin-top: 1.5rem; padding: 1rem; background: var(--card); border-radius: 0.5rem; border-left: 4px solid var(--primary); font-size: 0.9rem; line-height: 1.5; }
    .warn-box { background: #422006; color: #fcd34d; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.5; }
  </style>
</head>
<body>
  <header>
    <h1>${t(lang, "title")}</h1>
    <nav>
      <a href="/admin?lang=${lang}">${t(lang, "dashboard")}</a>
      <a href="/admin/users?lang=${lang}">${t(lang, "users")}</a>
      <a href="/admin/configs?lang=${lang}">${t(lang, "configs")}</a>
      <a href="/admin/settings?lang=${lang}">${t(lang, "settings")}</a>
      <a href="/logout?lang=${lang}">${t(lang, "logout")}</a>
    </nav>
  </header>
  <main>${body}</main>
</body>
</html>`;
}

function renderDashboard(lang: Lang): string {
  const body = `
    <h2>${t(lang, "welcome")}</h2>
    <div class="grid">
      <div class="card"><h3>${t(lang, "status")}</h3><p><span class="badge">${t(lang, "online")}</span></p></div>
      <div class="card"><h3>${t(lang, "users")}</h3><p>${usersStore.length}</p></div>
      <div class="card"><h3>${t(lang, "phase")}</h3><p>2.1</p></div>
    </div>
    <div class="note">
      This is YOUR private panel. Only you control the users and links.<br>
      Next steps: KV storage + full VLESS + Wizard.
    </div>`;
  return baseLayout(lang, t(lang, "dashboard"), body);
}

function renderUsers(lang: Lang, host: string): string {
  let rows = "";
  if (usersStore.length === 0) {
    rows = `<tr><td colspan="5">${t(lang, "noUsers")}</td></tr>`;
  } else {
    for (const u of usersStore) {
      const sub = `https://${host}/sub/${u.uuid}`;
      rows += `<tr>
        <td>${u.name}</td>
        <td style="font-size:0.75rem">${u.uuid.slice(0, 8)}...</td>
        <td>${u.enable ? t(lang, "enable") : t(lang, "disable")}</td>
        <td><a class="btn" href="${sub}" target="_blank">${t(lang, "subLink")}</a></td>
        <td>
          <form method="POST" action="/admin/users/delete" style="display:inline">
            <input type="hidden" name="id" value="${u.id}">
            <input type="hidden" name="lang" value="${lang}">
            <button class="btn btn-danger" type="submit">${t(lang, "delete")}</button>
          </form>
        </td>
      </tr>`;
    }
  }

  const body = `
    <h2>${t(lang, "users")}</h2>
    <form method="POST" action="/admin/users/add" style="margin:1rem 0;padding:1rem;background:var(--card);border-radius:0.75rem;">
      <div class="form-row"><input name="name" placeholder="${t(lang, "name")}" required></div>
      <div class="form-row"><input name="remark" placeholder="${t(lang, "remark")}"></div>
      <input type="hidden" name="lang" value="${lang}">
      <button class="btn" type="submit">${t(lang, "addUser")}</button>
    </form>
    <table>
      <thead><tr><th>${t(lang, "name")}</th><th>${t(lang, "uuid")}</th><th>${t(lang, "status")}</th><th>${t(lang, "subLink")}</th><th>${t(lang, "actions")}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  return baseLayout(lang, t(lang, "users"), body);
}

function renderConfigs(lang: Lang, host: string): string {
  const body = `
    <h2>${t(lang, "configs")}</h2>
    <div class="note">
      Each user has a private subscription link: <code>/sub/<uuid></code><br>
      Full VLESS protocol handling is planned for the next phase.
    </div>
    <p style="margin-top:1rem">Base URL: <code>https://${host}/sub/<user-uuid></code></p>`;
  return baseLayout(lang, t(lang, "configs"), body);
}

function renderSettings(lang: Lang): string {
  const body = `
    <h2>${t(lang, "settings")}</h2>
    <div class="warn-box">
      <strong>${t(lang, "important")}</strong><br>
      ${t(lang, "passWarning")}<br><br>
      ${t(lang, "defaultPass")}
    </div>
    <div class="note">
      How to change password:<br>
      Cloudflare Dashboard → Workers & Pages → your worker → Settings → Variables and Secrets → Add <code>ADMIN_PASSWORD</code>
    </div>`;
  return baseLayout(lang, t(lang, "settings"), body);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const lang = getLang(request);
    const path = url.pathname;
    const host = url.host;

    if (path === "/login" && request.method === "POST") {
      const form = await request.formData();
      const pass = form.get("pass")?.toString() || "";
      const expected = env.ADMIN_PASSWORD || "admin";
      if (pass === expected) {
        const headers = new Headers({ Location: `/admin?lang=${lang}` });
        headers.append("Set-Cookie", `up_auth=${btoa(expected)}; Path=/; HttpOnly; SameSite=Lax`);
        return new Response(null, { status: 302, headers });
      }
      return new Response(renderLogin(lang, true), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (path === "/logout") {
      const headers = new Headers({ Location: `/?lang=${lang}` });
      headers.append("Set-Cookie", "up_auth=; Path=/; Max-Age=0");
      return new Response(null, { status: 302, headers });
    }

    if (path === "/" || path === "/login") {
      return new Response(renderLogin(lang), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (path.startsWith("/admin")) {
      if (!isAuthenticated(request, env)) {
        return new Response(null, { status: 302, headers: { Location: `/?lang=${lang}` } });
      }

      if (path === "/admin/users/add" && request.method === "POST") {
        const form = await request.formData();
        const name = form.get("name")?.toString()?.trim() || "User";
        const remark = form.get("remark")?.toString() || "";
        usersStore.push({
          id: uuidv4(),
          name,
          uuid: uuidv4(),
          created: Date.now(),
          enable: true,
          remark,
        });
        return new Response(null, { status: 302, headers: { Location: `/admin/users?lang=${lang}` } });
      }

      if (path === "/admin/users/delete" && request.method === "POST") {
        const form = await request.formData();
        const id = form.get("id")?.toString();
        usersStore = usersStore.filter((u) => u.id !== id);
        return new Response(null, { status: 302, headers: { Location: `/admin/users?lang=${lang}` } });
      }

      if (path === "/admin" || path === "/admin/") {
        return new Response(renderDashboard(lang), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      if (path === "/admin/users") {
        return new Response(renderUsers(lang, host), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      if (path === "/admin/configs") {
        return new Response(renderConfigs(lang, host), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      if (path === "/admin/settings") {
        return new Response(renderSettings(lang), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    }

    if (path.startsWith("/sub/")) {
      const uuid = path.slice(5);
      const user = usersStore.find((u) => u.uuid === uuid && u.enable);
      if (!user) return new Response("Not found", { status: 404 });

      const vless = `vless://${user.uuid}@${host}:443?encryption=none&security=tls&type=ws&host=${host}&path=%2F#${encodeURIComponent(user.name)}`;
      const body = btoa(vless + "\n");
      return new Response(body, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Profile-Update-Interval": "6",
          "Subscription-Userinfo": `upload=0; download=0; total=0; expire=0`,
        },
      });
    }

    if (path === "/health") {
      return Response.json({ status: "ok", project: "UltraPlus-Free", phase: "2.1", users: usersStore.length });
    }

    return new Response("UltraPlus-Free is running. Go to /admin", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
