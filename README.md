# 🚀 UltraPlus-Free

**Your own private multi-language panel on Cloudflare Workers**  
Self-hosted • Free • MIT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Languages** · [English](#english) · [فارسی](#فارسی) · [中文](#中文)

---

## English

### Important

**Every person deploys their own panel on their own Cloudflare account.**  
The admin password belongs only to that person’s panel.

- Default password: `admin`
- Change it immediately after first deploy by setting `ADMIN_PASSWORD` in Worker environment variables.

### Current Features (Phase 3)

- Multi-language UI (English / Persian / Chinese) + RTL
- Admin login with session cookie
- User management (add / list / delete)
- Private subscription link per user (`/sub/<uuid>`)
- Optional KV persistence (users survive redeploys when KV is bound)
- Clean TypeScript + Wrangler

### Quick Start

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

1. Open `https://<your-worker>.workers.dev/admin`
2. Login with `admin`
3. Set your own `ADMIN_PASSWORD` in Cloudflare Dashboard → Worker → Settings → Variables

### Optional: Enable KV (recommended)

1. Create a KV namespace in Cloudflare
2. Uncomment the `[[kv_namespaces]]` section in `wrangler.toml` and put your KV id
3. Redeploy

### Roadmap

- ✅ Phase 1 & 2: Panel + Auth + Users + Subscription skeleton
- 🔄 Phase 3: KV persistence (started) + VLESS improvements + Wizard
- Phase 4: Telegram bot + advanced features

---

## فارسی

**هر کسی پنل خودش را می‌سازد.**  
رمز ادمین فقط مال پنل همان شخص است.

رمز پیش‌فرض: `admin` — حتماً عوض کنید.

برای ذخیره دائمی کاربران، KV را در `wrangler.toml` فعال کنید.

---

## 中文

**每个人部署自己的面板。**  
管理员密码只属于该用户自己的面板。

默认密码：`admin` — 请立即修改。

---

**Built for freedom. Each person owns their own panel.**
