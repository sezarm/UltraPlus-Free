# 📖 UltraPlus-Free – Complete Installation Guide

**English** · **فارسی** · Version **0.5.0**

---

# English Guide

## What is UltraPlus-Free?

A self-hosted multi-language control panel on Cloudflare Workers.  
Every person deploys **their own panel** on their own account.

### Features
- Multi-language panel (EN / FA / ZH) + RTL
- Admin login, multi-user (expire, traffic, enable/disable)
- Private `/sub/<uuid>` with formats: base64 / raw / clash
- Panel settings: WS path, remark, SNI (needs KV)
- Optional Telegram bot
- Install Wizard

---

## Method 1 – Upload worker.js (Easiest)

1. Open https://github.com/sezarm/UltraPlus-Free → download **worker.js**
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create Worker
3. Edit code → paste full `worker.js` → Deploy
4. Open `https://<name>.workers.dev/admin` — password: `admin`
5. Set `ADMIN_PASSWORD` in Worker Variables immediately

---

## Method 2 – Wrangler

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install && npx wrangler login && npm run deploy
```

---

## KV (Recommended)

1. Workers & Pages → KV → Create namespace
2. Worker → Settings → Bindings → Variable name: `ULTRA_KV`
3. Without KV, users and settings reset on redeploy

---

## Subscription formats

```text
/sub/<uuid>                 → base64 (default, v2rayNG)
/sub/<uuid>?format=raw      → plain VLESS URI
/sub/<uuid>?format=clash    → simple Clash Meta block
```

---

## Panel settings (Settings page)

Requires `ULTRA_KV`:

- **WS Path** — path in generated links
- **Remark prefix** — config name prefix
- **SNI** — optional; empty = worker host

---

## Telegram bot (Optional)

1. @BotFather → create bot → copy token
2. Variables: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_ID`
3. Webhook:
```text
https://api.telegram.org/botTOKEN/setWebhook?url=https://YOUR-WORKER.workers.dev/telegram
```
4. Commands: `/status` `/users` `/add Name` `/toggle ID` `/del ID` `/link ID` `/help`

---

## Create users

1. `/admin` → Users → Add User
2. Share only that user’s `/sub/...` link

---

# راهنمای فارسی

**هر کسی پنل خودش را روی Cloudflare خودش می‌سازد.**  
رمز پیش‌فرض `admin` را فوراً عوض کنید.

1. فایل `worker.js` را دانلود و در Worker پیست کنید
2. `ADMIN_PASSWORD` را تنظیم کنید
3. KV با نام `ULTRA_KV` ببندید (پیشنهادی)

### فرمت ساب

```text
/sub/<uuid>                 → base64
/sub/<uuid>?format=raw      → لینک خام
/sub/<uuid>?format=clash    → Clash
```

### تنظیمات پنل (با KV)

Path ، Remark ، SNI در صفحه Settings

### ربات

`/status` `/users` `/add نام` `/toggle ID` `/del ID` `/link ID` `/help`

---

**موفق باشی.**
