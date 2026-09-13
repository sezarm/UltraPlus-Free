# 🚀 UltraPlus-Free v0.5.0

**Your own private multi-language control panel on a single Cloudflare Worker**  
Free • MIT • Self-hosted • English / فارسی / 中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.5.0-blueviolet.svg)](CHANGELOG.md)

---

## ⚠️ Important

**Every person deploys their own panel on their own Cloudflare account.**

- No central server.
- Admin password is only yours. Default: `admin` → **change it** via `ADMIN_PASSWORD`.
- Never share `/admin`. User `/sub/` links are credentials.

This is a **management panel + subscription generator** (written from scratch).

---

## Features (v0.5.0)

| Feature | Status |
|---------|--------|
| Multi-language UI (EN / FA / ZH) + RTL | ✅ |
| Admin login | ✅ |
| Users: expire, traffic GB, enable/disable | ✅ |
| Private `/sub/<uuid>` links | ✅ |
| Sub formats: **base64** / **raw** / **clash** | ✅ |
| Panel settings: path, remark, SNI (KV) | ✅ |
| Optional KV | ✅ |
| Telegram bot: /add /toggle /del /link /status /users | ✅ |
| Wizard + health | ✅ |

---

## Quick start

1. Download **[worker.js](worker.js)**
2. Cloudflare → Workers → Create Worker → paste → Deploy
3. Open `/admin` → login `admin`
4. Set `ADMIN_PASSWORD` in Worker Variables
5. (Recommended) Bind KV as `ULTRA_KV`

Full guide: **[INSTALL.md](INSTALL.md)**

---

## Subscription formats

```text
https://YOUR-WORKER/sub/<uuid>              → base64 (default)
https://YOUR-WORKER/sub/<uuid>?format=raw   → plain VLESS
https://YOUR-WORKER/sub/<uuid>?format=clash → Clash Meta block
```

---

## Telegram (optional)

Variables: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_ID`  
Webhook: `.../setWebhook?url=https://YOUR-WORKER/telegram`

Commands: `/status` `/users` `/add Name` `/toggle ID` `/del ID` `/link ID` `/help`

---

## فارسی

هر نفر پنل خودش را می‌سازد. رمز پیش‌فرض `admin` را عوض کنید.  
فایل: [worker.js](worker.js) · راهنما: [INSTALL.md](INSTALL.md)

فرمت ساب: `?format=base64` | `raw` | `clash`

---

## License

MIT — each person owns their own panel.
