# UltraPlus-Free v7.0

پنل Cloudflare Worker شبیه مدل BPB:

- **بدون ساخت کاربر** اشتراک مالک آماده است: `/sub`
- **~۱۰۰+ کانفیگ** روی IP/دامنه‌های Cloudflare + دامنه Worker
- منوی **همبرگری** موبایل
- VLESS + Trojan + Fragment hint
- Clash / raw / base64

## نصب (گوشی)

1. فایل [worker.js](./worker.js) را Raw کن و کپی کن
2. Cloudflare → Create Worker → Paste → Deploy
3. KV Binding نام: `ULTRA_KV`
4. Secret: `ADMIN_PASSWORD`
5. برو `/admin` → کپی لینک `/sub`

رمز پیش‌فرض: `admin`

MIT
