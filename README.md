# 🚀 UltraPlus-Free

**Professional, high-performance, multi-language Cloudflare Worker panel**  
Single-file ready • Robust • Fast • Free • Open Source (MIT)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)

**Languages / زبان‌ها / 语言**  
[English](#english) | [فارسی](#فارسی) | [中文](#中文)

---

## English

### What is UltraPlus-Free?

UltraPlus-Free is a clean, modern, from-scratch Cloudflare Worker panel.  
Key goals:

- True multi-language UI (English / Persian / Chinese)
- Admin authentication
- User management + private subscription links
- Extensible architecture for VLESS / Trojan / Wizard / Telegram bot
- MIT license – free for everyone

### Current Status

**Phase 2 completed**

- Multi-language panel (EN / FA / ZH + RTL)
- Real admin login (password + cookie)
- Users page: add / list / delete users
- Each user gets a private subscription link (`/sub/<uuid>`)
- Placeholder VLESS subscription output
- Settings page
- Clean TypeScript + Wrangler ready

### Quick Start

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

Default admin password: `admin`  
(You can set `ADMIN_PASSWORD` in Worker environment variables)

Open: `https://<your-worker>.workers.dev/admin`

### Roadmap

1. Phase 1 – Foundation + multi-lang panel ✅
2. Phase 2 – Auth + Users + Subscription skeleton ✅
3. Phase 3 – Persistent storage (KV) + full VLESS handler + Wizard
4. Phase 4 – Telegram bot + advanced routing + performance

### License

MIT

---

## فارسی

### وضعیت فعلی

**فاز ۲ کامل شد**

- پنل سه‌زبانه واقعی + RTL
- ورود ادمین با رمز و کوکی
- مدیریت کاربران (اضافه / لیست / حذف)
- لینک سابسکریپشن خصوصی برای هر کاربر
- خروجی placeholder برای VLESS
- صفحه تنظیمات

رمز پیش‌فرض ادمین: `admin`

### نصب

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

---

## 中文

**第二阶段已完成**

- 多语言面板（英语 / 波斯语 / 中文）
- 管理员登录
- 用户管理 + 私人订阅链接
- VLESS 订阅骨架

默认管理员密码：`admin`

---

**Built for freedom and ease of use.**
