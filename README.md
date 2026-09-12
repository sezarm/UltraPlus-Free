# 🚀 UltraPlus-Free v0.4.1

**Your own private multi-language control panel on a single Cloudflare Worker**  
Free • MIT • Self-hosted • English / فارسی / 中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.4.1-blueviolet.svg)](CHANGELOG.md)

---

## ⚠️ Important – Read First

**Every person deploys their own panel on their own Cloudflare account.**

- There is **no central server** and no middleman.
- The admin password belongs **only** to the person who deployed the panel.
- Default password is `admin` → **change it immediately** after first login.
- Never share `/admin` or your password. User subscription links are credentials.

This project is a **management panel + subscription link generator**.  
It is written from scratch (inspired by community tools at the feature level only).

---

## What it does

| Feature | Status |
|---------|--------|
| Multi-language UI (EN / FA / ZH) + RTL | ✅ |
| Admin login with session cookie | ✅ |
| Multi-user management | ✅ |
| Expire date + traffic limit (GB) | ✅ |
| Enable / Disable user (toggle) | ✅ |
| Private subscription link per user | ✅ |
| VLESS link generation | ✅ |
| Subscription-Userinfo headers | ✅ |
| Optional KV (persistent users) | ✅ |
| Install Wizard page (`/wizard`) | ✅ |
| Telegram bot (admin only) | ✅ |
| Single-file `worker.js` upload | ✅ |
| Full install guide (EN + FA) | ✅ |

---

## Quick start (easiest)

1. Download **[worker.js](worker.js)**
2. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create Worker**
3. Paste the content of `worker.js` → **Deploy**
4. Open `https://<your-worker>.workers.dev/admin`
5. Login with `admin`
6. Set `ADMIN_PASSWORD` in Worker → Settings → Variables

**Full step-by-step (KV + Telegram + links):** see **[INSTALL.md](INSTALL.md)**

---

## Developer install

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

---

## Routes

| Path | Description |
|------|-------------|
| `/` or `/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/users` | User management (add / toggle / delete) |
| `/admin/configs` | Subscription info |
| `/admin/settings` | Settings & warnings |
| `/wizard` | Install guide page |
| `/sub/<uuid>` | Private subscription link |
| `/telegram` | Telegram webhook |
| `/health` | Health check JSON |

---

## Optional: KV (recommended)

Without KV, users are stored in memory and reset on every redeploy.

1. Create a KV namespace in Cloudflare
2. Bind it as `ULTRA_KV` on your Worker
3. Redeploy if needed

Details in [INSTALL.md](INSTALL.md).

---

## Optional: Telegram bot

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Set variables:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ADMIN_ID` (your numeric Telegram ID)
3. Set webhook:
```text
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-WORKER.workers.dev/telegram
```
4. Commands: `/start` `/status` `/users` `/help`

---

## فارسی

**هر کسی پنل خودش را روی اکانت Cloudflare خودش می‌سازد.**  
رمز ادمین فقط مال همان شخص است.

- رمز پیش‌فرض: `admin` → حتماً عوض کنید
- فایل آماده: [worker.js](worker.js)
- راهنمای کامل نصب: [INSTALL.md](INSTALL.md)

### قابلیت‌ها
- پنل سه‌زبانه + راست‌چین
- مدیریت چند کاربر (انقضا، حجم، فعال/غیرفعال)
- لینک سابسکریپشن خصوصی
- KV اختیاری
- ربات تلگرام اختیاری

---

## 中文

**每个人都在自己的 Cloudflare 账户上部署自己的面板。**  
默认密码 `admin`，请立即修改。

完整安装说明见 [INSTALL.md](INSTALL.md)。

---

## License

MIT – Free for personal and community use.

**Built for freedom. Each person owns their own panel.**
