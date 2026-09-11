# 🚀 UltraPlus-Free

**Professional multi-language Cloudflare Worker panel**  
Self-hosted • Single Worker • Free • MIT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)

**Languages**  
[English](#english) | [فارسی](#فارسی) | [中文](#中文)

---

## English

### Important about Password

**Every person deploys their own panel on their own Cloudflare account.**  
The admin password is **only for that person’s panel**.  

- Default password: `admin`
- Strongly recommended: change it immediately after first deploy by setting the environment variable `ADMIN_PASSWORD` in your Worker settings.
- Never share your admin password or your Worker URL with admin access.

This is a self-hosted tool. There is no central server. Your data and your panel belong only to you.

### Features (Current)

- True multi-language UI (English / Persian / Chinese) with RTL support
- Admin login with cookie session
- User management (add / list / delete)
- Private subscription link per user (`/sub/<uuid>`)
- VLESS subscription skeleton (ready for full protocol)
- Clean TypeScript + Wrangler

### Quick Start

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

After deploy:
1. Go to `https://<your-worker>.workers.dev/admin`
2. Login with password `admin`
3. Immediately change the password via Cloudflare Dashboard → Workers → your worker → Settings → Variables → add `ADMIN_PASSWORD`

### Roadmap

- ✅ Phase 1: Foundation + multi-lang panel
- ✅ Phase 2: Auth + Users + Subscription skeleton
- 🔄 Phase 3: KV persistence + better VLESS + Wizard (in progress)
- Phase 4: Telegram bot + advanced features

### License

MIT – Free for personal use.

---

## فارسی

### نکته خیلی مهم درباره رمز

**هر کسی پنل خودش را روی اکانت Cloudflare خودش می‌سازد.**  
رمز ادمین فقط برای پنل همان شخص است.

- رمز پیش‌فرض: `admin`
- حتماً بعد از اولین دیپلوی رمز را عوض کنید (با متغیر محیطی `ADMIN_PASSWORD`)
- رمز و آدرس پنل خود را با کسی به اشتراک نگذارید.

این ابزار کاملاً شخصی و self-hosted است. هیچ سرور مرکزی وجود ندارد.

### نصب سریع

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

بعد از دیپلوی به `/admin` بروید و با رمز `admin` وارد شوید، سپس فوراً رمز را تغییر دهید.

---

## 中文

### 关于密码的重要说明

**每个人都在自己的 Cloudflare 账户上部署自己的面板。**  
管理员密码仅属于该用户自己的面板。

- 默认密码：`admin`
- 强烈建议首次部署后立即通过环境变量 `ADMIN_PASSWORD` 修改密码
- 请勿分享你的管理员密码或面板地址

这是完全自托管的工具，没有中央服务器。

---

**Built for freedom. Each person owns their own panel.**
