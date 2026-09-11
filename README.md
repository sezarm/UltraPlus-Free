# 🚀 UltraPlus-Free

**Professional, high-performance, multi-language Cloudflare Worker panel**  
Single-file `worker.js` • Robust • Fast • Free • Open Source

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)

**Languages / زبان‌ها / 语言**  
[English](#english) | [فارسی](#فارسی) | [中文](#中文)

---

## English

### What is UltraPlus-Free?

UltraPlus-Free is a clean, modern, from-scratch Cloudflare Worker panel designed for privacy-focused proxy configurations.  
It prioritizes:

- **Single file deployment** – After build you only need `worker.js`
- **True multi-language UI** (English, Persian/Farsi, Chinese)
- **Professional & resistant** design (optimized to reduce Cloudflare 1011 / CPU / size issues)
- **Extensible architecture** – Easy to add users, protocols, Telegram bot, Wizard, etc.
- **100% free & open source** under MIT

This project is built independently from the ground up. Inspiration was taken only at the feature-idea level from existing community tools. No code was copied.

### Current Status (Phase 1)

- Project foundation & MIT license
- Multi-language README
- Clean TypeScript structure
- Basic Worker + Admin panel skeleton with real language switching
- Full deployment guide below

### Roadmap

1. **Phase 1** (now): Foundation + multi-lang panel skeleton
2. **Phase 2**: User management + subscription links + VLESS base
3. **Phase 3**: Wizard page + Telegram bot (admin + user control)
4. **Phase 4**: Advanced routing, Clean IP helpers, performance hardening, auto-update

### Quick Start

```bash
# 1. Clone
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free

# 2. Install
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Deploy
npm run deploy
```

After deploy, open `https://<your-worker>.workers.dev/admin`

### License

MIT – Free for personal and commercial use. See [LICENSE](LICENSE).

---

## فارسی

### UltraPlus-Free چیست؟

یک پنل حرفه‌ای، پرسرعت و مقاوم برای Cloudflare Workers که از صفر نوشته شده است.  
هدف:

- فقط یک فایل `worker.js` بعد از نصب
- پنل واقعی سه‌زبانه (فارسی + انگلیسی + چینی)
- طراحی مقاوم در برابر خطاهای Cloudflare (مثل ۱۰۱۱)
- معماری تمیز و قابل توسعه
- کاملاً رایگان و متن‌باز (لایسنس MIT)

این پروژه کپی نیست. فقط از ایده‌های کلی پروژه‌های موجود الهام گرفته شده و همه چیز از صفر طراحی و پیاده‌سازی می‌شود.

### وضعیت فعلی

فاز ۱: پایه‌گذاری پروژه + README سه‌زبانه + اسکلت پنل سه‌زبانه + ساختار تمیز

### نقشه راه

- فاز ۱: اسکلت پنل سه‌زبانه (انجام شد)
- فاز ۲: مدیریت کاربران + لینک سابسکریپشن + VLESS پایه
- فاز ۳: صفحه Wizard + ربات تلگرام
- فاز ۴: بهینه‌سازی نهایی و ویژگی‌های پیشرفته

### نصب سریع

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

بعد از دیپلوی به آدرس `/admin` بروید.

---

## 中文

### 什么是 UltraPlus-Free？

UltraPlus-Free 是一个从零开始构建的专业、高性能、多语言 Cloudflare Worker 面板。

核心目标：

- 安装后仅需单个 `worker.js` 文件
- 真正的多语言界面（英语、波斯语、中文）
- 针对 Cloudflare 限制（如 1011 错误）进行优化的稳健设计
- 可扩展架构，易于添加用户管理、协议、Telegram 机器人、安装向导等
- 完全免费开源（MIT 许可证）

本项目独立开发，仅在功能理念层面参考了社区现有工具，没有复制任何代码。

### 当前状态

第一阶段：项目基础 + 多语言 README + 干净的项目结构 + 多语言面板骨架

### 路线图

1. 第一阶段：多语言面板骨架（已完成）
2. 第二阶段：用户管理 + 订阅链接 + VLESS 基础
3. 第三阶段：安装向导 + Telegram 机器人
4. 第四阶段：高级路由、性能优化、自动更新

---

**Built for freedom and ease of use.**  
Contributions and feedback are welcome.
