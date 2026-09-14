/**
 * UltraPlus-Free — Worker entry — Phase 2
 */
import { createApp } from "./core/app.js";
import { isSetupDone, markSetupDone } from "./storage/kv.js";
import { html, redirect, json, ok, text } from "./core/response.js";
import { APP_NAME, APP_VERSION } from "./core/constants.js";
import { hashPassword, verifyPassword } from "./auth/password.js";
import {
  createSession, sessionCookieHeader, clearSessionCookie, revokeSession, readSessionId,
} from "./auth/session.js";
import { requireAdmin } from "./auth/auth.js";
import { checkLoginRate } from "./core/middleware.js";
import { execute, queryOne, hasD1 } from "./database/d1.js";
import { setupPage, loginPage, dashboardPage, usersPage } from "./admin/dashboard.js";
import {
  listUsers, createUser, deleteUser, setUserStatus, getUserById, regenerateToken, userStats,
} from "./users/user-service.js";
import { resolveSubscription } from "./subscriptions/subscription-service.js";
import { NotFoundError, AuthorizationError } from "./core/errors.js";

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "0.0.0.0";
}
function langFrom(url, form) {
  if (form) {
    const l = form.get("lang");
    if (l) return String(l);
  }
  return url.searchParams.get("lang") || "fa";
}

const routes = [
  { method: "GET", path: "/setup", handler: async ({ env, url }) => {
    if (await isSetupDone(env)) return redirect("/login");
    return html(setupPage(langFrom(url)));
  }},
  { method: "POST", path: "/setup", handler: async ({ request, env }) => {
    if (await isSetupDone(env)) {
      return json({ success: false, error: { code: "SETUP_LOCKED", message: "Already initialized" } }, 403);
    }
    const form = await request.formData();
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    const lang = langFrom(new URL(request.url), form);
    if (!username || username.length < 3) return html(setupPage(lang, "Username too short"));
    if (password.length < 8) return html(setupPage(lang, "Password min 8 characters"));
    if (password !== confirm) return html(setupPage(lang, "Passwords do not match"));
    const id = crypto.randomUUID();
    const hash = await hashPassword(password);
    const t = Date.now();
    if (hasD1(env)) {
      await execute(env, "INSERT INTO admins (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [id, username, hash, t, t]);
    } else if (env.ULTRA_KV) {
      await env.ULTRA_KV.put("admin", JSON.stringify({ id, username, password_hash: hash, created_at: t }));
    } else {
      return html(setupPage(lang, "Bind D1 or KV before setup"));
    }
    await markSetupDone(env);
    const sid = await createSession(env, id);
    return redirect("/admin", 302, { "Set-Cookie": sessionCookieHeader(sid) });
  }},
  { method: "GET", path: "/login", handler: async ({ env, url }) => {
    if (!(await isSetupDone(env))) return redirect("/setup");
    return html(loginPage(langFrom(url)));
  }},
  { method: "POST", path: "/login", handler: async ({ request, env }) => {
    if (!(await isSetupDone(env))) return redirect("/setup");
    const rate = await checkLoginRate(env, clientIp(request));
    if (!rate.allowed) return json({ success: false, error: { code: "RATE_LIMIT", message: "Too many attempts" } }, 429);
    const form = await request.formData();
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    const lang = langFrom(new URL(request.url), form);
    let admin = null;
    if (hasD1(env)) admin = await queryOne(env, "SELECT * FROM admins WHERE username = ?", [username]);
    else if (env.ULTRA_KV) {
      const a = await env.ULTRA_KV.get("admin", "json");
      if (a && a.username === username) admin = a;
    }
    if (!admin || !(await verifyPassword(password, admin.password_hash))) return html(loginPage(lang, true));
    const sid = await createSession(env, admin.id);
    return redirect("/admin", 302, { "Set-Cookie": sessionCookieHeader(sid) });
  }},
  { method: "GET", path: "/logout", handler: async ({ request, env }) => {
    await revokeSession(env, readSessionId(request));
    return redirect("/login", 302, { "Set-Cookie": clearSessionCookie() });
  }},
  { method: "GET", path: "/admin", handler: async ({ request, env, url }) => {
    if (!(await isSetupDone(env))) return redirect("/setup");
    await requireAdmin(request, env);
    const lang = langFrom(url);
    const stats = await userStats(env);
    return html(dashboardPage(lang, { version: APP_VERSION, hasD1: hasD1(env), hasKv: !!env.ULTRA_KV, stats }));
  }},
  { method: "GET", path: "/admin/users", handler: async ({ request, env, url }) => {
    if (!(await isSetupDone(env))) return redirect("/setup");
    await requireAdmin(request, env);
    const lang = langFrom(url);
    const status = url.searchParams.get("status") || "";
    const q = url.searchParams.get("q") || "";
    const users = await listUsers(env, { status: status || undefined, q: q || undefined });
    const msg = url.searchParams.get("msg") || "";
    return html(usersPage(lang, { users, host: url.hostname, filter: status, q, msg }));
  }},
  { method: "POST", path: "/admin/users/add", handler: async ({ request, env }) => {
    await requireAdmin(request, env);
    const form = await request.formData();
    const lang = langFrom(new URL(request.url), form);
    await createUser(env, { displayName: form.get("displayName"), days: form.get("days"), quotaGb: form.get("quotaGb") });
    return redirect("/admin/users?lang=" + lang + "&msg=created");
  }},
  { method: "POST", path: "/admin/users/toggle", handler: async ({ request, env }) => {
    await requireAdmin(request, env);
    const form = await request.formData();
    const lang = langFrom(new URL(request.url), form);
    const id = String(form.get("id") || "");
    const u = await getUserById(env, id);
    if (u) await setUserStatus(env, id, u.status === "active" ? "disabled" : "active");
    return redirect("/admin/users?lang=" + lang);
  }},
  { method: "POST", path: "/admin/users/delete", handler: async ({ request, env }) => {
    await requireAdmin(request, env);
    const form = await request.formData();
    const lang = langFrom(new URL(request.url), form);
    await deleteUser(env, String(form.get("id") || ""));
    return redirect("/admin/users?lang=" + lang + "&msg=deleted");
  }},
  { method: "POST", path: "/admin/users/regen", handler: async ({ request, env }) => {
    await requireAdmin(request, env);
    const form = await request.formData();
    const lang = langFrom(new URL(request.url), form);
    await regenerateToken(env, String(form.get("id") || ""));
    return redirect("/admin/users?lang=" + lang + "&msg=token_regenerated");
  }},
  { method: "GET", path: "/api/users", handler: async ({ request, env, url }) => {
    await requireAdmin(request, env);
    const users = await listUsers(env, { status: url.searchParams.get("status") || undefined, q: url.searchParams.get("q") || undefined });
    return ok(users);
  }},
  { method: "POST", path: "/api/users", handler: async ({ request, env }) => {
    await requireAdmin(request, env);
    const body = await request.json().catch(() => ({}));
    return ok(await createUser(env, body));
  }},
  { method: "GET", path: "/api/users/:id", handler: async ({ request, env, params }) => {
    await requireAdmin(request, env);
    const user = await getUserById(env, params.id);
    if (!user) return json({ success: false, error: { code: "NOT_FOUND", message: "Not found" } }, 404);
    return ok(user);
  }},
  { method: "DELETE", path: "/api/users/:id", handler: async ({ request, env, params }) => {
    await requireAdmin(request, env);
    await deleteUser(env, params.id);
    return ok({ deleted: true });
  }},
  { method: "GET", path: "/api/stats", handler: async ({ request, env }) => {
    await requireAdmin(request, env);
    return ok(await userStats(env));
  }},
  { method: "GET", path: "/api/health", handler: async ({ env }) => {
    return ok({ version: APP_VERSION, d1: hasD1(env), kv: !!env.ULTRA_KV, setup: await isSetupDone(env) });
  }},
  { method: "GET", path: "/sub/:token", handler: async ({ env, url, params }) => {
    try {
      const format = url.searchParams.get("format") || "base64";
      const result = await resolveSubscription(env, params.token, url.hostname, format);
      return new Response(result.body, {
        headers: { "Content-Type": result.contentType, "Profile-Update-Interval": "12", "Cache-Control": "no-store" },
      });
    } catch (e) {
      if (e instanceof NotFoundError) return text("Not found", 404);
      if (e instanceof AuthorizationError) return text(e.message, 403);
      throw e;
    }
  }},
];

const app = createApp({
  routes,
  async fallback({ env, url }) {
    if (!(await isSetupDone(env))) return redirect("/setup");
    if (url.pathname === "/" || url.pathname === "") return redirect("/login");
    return html(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${APP_NAME}</title></head>
<body style="font-family:system-ui;background:#0b1220;color:#e8eefc;display:flex;min-height:100vh;align-items:center;justify-content:center">
<div><h1>${APP_NAME}</h1><p>v${APP_VERSION}</p><p><a href="/login" style="color:#3b82f6">Login</a></p></div></body></html>`);
  },
});

export default {
  async fetch(request, env, ctx) { return app.handle(request, env, ctx); },
  async scheduled() {},
};
