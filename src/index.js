/**
 * UltraPlus-Free — Worker entry (thin)
 */
import { createApp } from "./core/app.js";
import { isSetupDone, markSetupDone } from "./storage/kv.js";
import { html, redirect, json, ok } from "./core/response.js";
import { APP_NAME, APP_VERSION } from "./core/constants.js";
import { hashPassword, verifyPassword } from "./auth/password.js";
import {
  createSession,
  sessionCookieHeader,
  clearSessionCookie,
  revokeSession,
  readSessionId,
} from "./auth/session.js";
import { requireAdmin } from "./auth/auth.js";
import { checkLoginRate } from "./core/middleware.js";
import { execute, queryOne, hasD1 } from "./database/d1.js";
import { setupPage, loginPage, dashboardPage } from "./admin/dashboard.js";

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "0.0.0.0";
}

const routes = [
  {
    method: "GET",
    path: "/setup",
    handler: async ({ env, url }) => {
      if (await isSetupDone(env)) return redirect("/login");
      const lang = url.searchParams.get("lang") || "fa";
      return html(setupPage(lang));
    },
  },
  {
    method: "POST",
    path: "/setup",
    handler: async ({ request, env }) => {
      if (await isSetupDone(env)) {
        return json({ success: false, error: { code: "SETUP_LOCKED", message: "Already initialized" } }, 403);
      }
      const form = await request.formData();
      const username = String(form.get("username") || "").trim();
      const password = String(form.get("password") || "");
      const confirm = String(form.get("confirm") || "");
      const lang = String(form.get("lang") || "fa");
      if (!username || username.length < 3) return html(setupPage(lang, "Username too short"));
      if (password.length < 8) return html(setupPage(lang, "Password min 8 characters"));
      if (password !== confirm) return html(setupPage(lang, "Passwords do not match"));
      const id = crypto.randomUUID();
      const hash = await hashPassword(password);
      const now = Date.now();
      if (hasD1(env)) {
        await execute(
          env,
          "INSERT INTO admins (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
          [id, username, hash, now, now]
        );
      } else if (env.ULTRA_KV) {
        await env.ULTRA_KV.put(
          "admin",
          JSON.stringify({ id, username, password_hash: hash, created_at: now })
        );
      } else {
        return html(setupPage(lang, "Bind D1 or KV before setup"));
      }
      await markSetupDone(env);
      const sid = await createSession(env, id);
      return redirect("/admin", 302, { "Set-Cookie": sessionCookieHeader(sid) });
    },
  },
  {
    method: "GET",
    path: "/login",
    handler: async ({ env, url }) => {
      if (!(await isSetupDone(env))) return redirect("/setup");
      const lang = url.searchParams.get("lang") || "fa";
      return html(loginPage(lang));
    },
  },
  {
    method: "POST",
    path: "/login",
    handler: async ({ request, env }) => {
      if (!(await isSetupDone(env))) return redirect("/setup");
      const ip = clientIp(request);
      const rate = await checkLoginRate(env, ip);
      if (!rate.allowed) {
        return json({ success: false, error: { code: "RATE_LIMIT", message: "Too many attempts" } }, 429);
      }
      const form = await request.formData();
      const username = String(form.get("username") || "").trim();
      const password = String(form.get("password") || "");
      const lang = String(form.get("lang") || "fa");
      let admin = null;
      if (hasD1(env)) {
        admin = await queryOne(env, "SELECT * FROM admins WHERE username = ?", [username]);
      } else if (env.ULTRA_KV) {
        const a = await env.ULTRA_KV.get("admin", "json");
        if (a && a.username === username) admin = a;
      }
      if (!admin || !(await verifyPassword(password, admin.password_hash))) {
        return html(loginPage(lang, true));
      }
      const sid = await createSession(env, admin.id);
      return redirect("/admin", 302, { "Set-Cookie": sessionCookieHeader(sid) });
    },
  },
  {
    method: "GET",
    path: "/logout",
    handler: async ({ request, env }) => {
      const sid = readSessionId(request);
      await revokeSession(env, sid);
      return redirect("/login", 302, { "Set-Cookie": clearSessionCookie() });
    },
  },
  {
    method: "GET",
    path: "/admin",
    handler: async ({ request, env, url }) => {
      if (!(await isSetupDone(env))) return redirect("/setup");
      await requireAdmin(request, env);
      const lang = url.searchParams.get("lang") || "fa";
      return html(
        dashboardPage(lang, {
          version: APP_VERSION,
          hasD1: hasD1(env),
          hasKv: !!env.ULTRA_KV,
        })
      );
    },
  },
  {
    method: "GET",
    path: "/api/health",
    handler: async ({ env }) => {
      return ok({
        version: APP_VERSION,
        d1: hasD1(env),
        kv: !!env.ULTRA_KV,
        setup: await isSetupDone(env),
      });
    },
  },
];

const app = createApp({
  routes,
  async fallback({ env, url }) {
    if (!(await isSetupDone(env))) return redirect("/setup");
    if (url.pathname === "/" || url.pathname === "") return redirect("/login");
    return html(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${APP_NAME}</title></head>
<body style="font-family:system-ui;background:#0b1220;color:#e8eefc;display:flex;min-height:100vh;align-items:center;justify-content:center">
<div><h1>${APP_NAME}</h1><p>v${APP_VERSION}</p><p><a href="/login" style="color:#3b82f6">Login</a></p></div></body></html>`
    );
  },
});

export default {
  async fetch(request, env, ctx) {
    return app.handle(request, env, ctx);
  },
  async scheduled(event, env, ctx) {
    // later phases: expiry, radar, telegram
  },
};
