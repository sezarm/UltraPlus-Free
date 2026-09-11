# 🚀 UltraPlus-Free v0.4

**Self-hosted multi-language panel for Cloudflare Workers**  
Free • MIT • English / فارسی / 中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ⚠️ Important

**Every person deploys their own panel on their own Cloudflare account.**  
The admin password belongs only to that person.  
Default password is `admin` → **change it immediately**.

---

## Quick Download

- **Single file ready to upload:** [`worker.js`](worker.js)
- **Full installation guide (English + Persian):** [`INSTALL.md`](INSTALL.md)

---

## Features

- Multi-language UI (EN / FA / ZH) + RTL
- Admin login
- User management (expire date + traffic limit)
- Private subscription link per user (`/sub/<uuid>`)
- Optional KV (persistent users)
- Optional Telegram bot (admin only)
- Install Wizard (`/wizard`)

---

## Fastest Install

1. Download [`worker.js`](worker.js)
2. Cloudflare Dashboard → Workers → Create Worker
3. Paste the content of `worker.js` and Deploy
4. Open `/admin` and login with `admin`
5. Set `ADMIN_PASSWORD` in Worker Variables

Detailed steps → **[INSTALL.md](INSTALL.md)**

---

## فارسی

**هر کسی پنل خودش را می‌سازد.**  
رمز پیش‌فرض `admin` را حتماً عوض کنید.

- فایل آماده: [`worker.js`](worker.js)
- راهنمای کامل نصب: [`INSTALL.md`](INSTALL.md)

---

## License

MIT

**Each person owns their own panel.**
