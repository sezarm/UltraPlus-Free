# 🚀 UltraPlus-Free v0.4

**Strong self-hosted multi-language panel for Cloudflare Workers**  
Free • MIT • English / فارسی / 中文

---

## ⚠️ Critical Notice

**Every person deploys their own panel on their own Cloudflare account.**

- There is no central server.
- Admin password belongs **only** to the person who deployed it.
- Default password: `admin` → **change it immediately**.
- Never share `/admin` or your password.

This is a **management panel + subscription generator**.  
It is inspired by community tools at the feature level and written completely from scratch.

---

## Features (v0.4)

- Multi-language UI (EN / FA / ZH) + RTL
- Secure admin login (cookie)
- User management with:
  - Name / Remark
  - Enable / Disable
  - Expire date (days)
  - Traffic limit (GB)
- Private subscription link per user (`/sub/<uuid>`)
- VLESS link generation + Subscription-Userinfo headers
- Optional KV (persistent users)
- Install Wizard (`/wizard`)
- Telegram bot (admin only): `/status` `/users` `/help`
- Clean single Worker

---

## Quick Start

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

1. Open `https://<your-worker>.workers.dev/admin`
2. Login with `admin`
3. Set `ADMIN_PASSWORD` in Cloudflare → Worker → Settings → Variables
4. (Recommended) Create KV and bind as `ULTRA_KV`

---

## Telegram Bot (Optional)

1. Create bot with @BotFather
2. Add variables:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ADMIN_ID` (your numeric Telegram ID)
3. Set webhook:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-WORKER.workers.dev/telegram
```

---

## فارسی

**هر کسی پنل خودش را می‌سازد.**  
رمز ادمین فقط مال همان شخص است.  
رمز پیش‌فرض `admin` را فوراً عوض کنید.

---

## 中文

**每个人部署自己的面板。**  
默认密码 `admin`，请立即修改。

---

## License

MIT

**Each person owns their own panel.**
