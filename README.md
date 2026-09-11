# 🚀 UltraPlus-Free

**Self-hosted multi-language control panel for Cloudflare Workers**  
Free • MIT • English / فارسی / 中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)

---

## ⚠️ Important – Read First

**Every person deploys their own panel on their own Cloudflare account.**

- There is **no central server**.
- The admin password belongs **only to the person who deployed the panel**.
- Default password is `admin` → **change it immediately** after first login.
- Never share your admin password or the `/admin` URL.

This project is a **management panel + subscription link generator**.  
Full proxy protocol handling (VLESS/Trojan core) is intentionally kept simple so the panel stays light and does not hit Cloudflare limits easily.

---

## Features

| Feature | Status |
|---------|--------|
| Multi-language UI (EN / FA / ZH) + RTL | ✅ |
| Admin login with cookie session | ✅ |
| User management (add / list / delete) | ✅ |
| Private subscription link per user (`/sub/<uuid>`) | ✅ |
| Optional KV storage (persistent users) | ✅ |
| Install Wizard page (`/wizard`) | ✅ |
| Telegram bot skeleton (admin only) | ✅ |
| Clean single Worker deployment | ✅ |

---

## Quick Start

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

1. Open: `https://<your-worker>.workers.dev/admin`
2. Login with password: `admin`
3. Go to Cloudflare Dashboard → Workers → your worker → **Settings → Variables**
4. Add `ADMIN_PASSWORD` = your strong password
5. Redeploy if needed

---

## Optional: Persistent Users (KV)

1. Create a **KV namespace** in Cloudflare
2. Open `wrangler.toml` and uncomment the `[[kv_namespaces]]` section
3. Put your KV id
4. Redeploy

Without KV, users are stored in memory and will be lost on redeploy.

---

## Optional: Telegram Bot

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. In Worker Variables add:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_ADMIN_ID` = your Telegram numeric user ID
3. Set webhook:
```text
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-WORKER.workers.dev/telegram
```
4. Commands for admin: `/start` `/status` `/users`

---

## Routes

| Path | Description |
|------|-------------|
| `/` or `/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/users` | User management |
| `/admin/configs` | Subscription info |
| `/admin/settings` | Settings & warnings |
| `/wizard` | Install guide |
| `/sub/<uuid>` | Private subscription link |
| `/telegram` | Telegram webhook |
| `/health` | Health check |

---

## فارسی

### نکته خیلی مهم

**هر کسی پنل خودش را روی اکانت Cloudflare خودش می‌سازد.**  
رمز ادمین فقط مال همان شخص است.

- رمز پیش‌فرض: `admin`
- حتماً بعد از اولین ورود عوض کنید (`ADMIN_PASSWORD`)
- پنل کاملاً شخصی و self-hosted است

### نصب سریع

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

---

## 中文

**每个人都在自己的 Cloudflare 账户上部署自己的面板。**  
管理员密码只属于部署者本人。

默认密码：`admin` → 请立即修改。

---

## License

MIT – Free for personal use.

**Built for freedom. Each person owns their own panel.**
