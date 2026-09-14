# UltraPlus-Free v6.1.0

پنل رایگان روی **Cloudflare Worker** — چندکاربره، VLESS + Trojan.

## نصب سریع (گوشی / کامپیوتر — بدون ترمینال)

### ۱) فایل Worker

از همین مخزن فایل **[worker.js](./worker.js)** را باز کن → **Raw** یا Download  
(حجم حدود **۲۷KB** — اگر چند خط بود، صفحه را Refresh کن)

### ۲) کلودفلر

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**
2. **Create Worker** → اسم بگذار → Deploy
3. **Edit code** → همه را پاک کن → **کل** `worker.js` را Paste کن
4. **Save and Deploy**

### ۳) KV (مهم)

1. **KV** → Create namespace
2. Worker → **Settings → Bindings → KV**
3. Variable name دقیقاً: **`ULTRA_KV`**
4. Save

### ۴) رمز

**Variables** → `ADMIN_PASSWORD` = رمز خودت  
(اگر خالی باشد پیش‌فرض: `admin`)

### ۵) ورود

`https://WORKER-تو.workers.dev/admin`

آموزش کامل: [INSTALL-FA.md](./INSTALL-FA.md)

---

## قابلیت‌ها

- پنل چندزبانه EN/FA/ZH
- چند کاربر + انقضا + لینک ساب جدا
- VLESS و Trojan روی WebSocket
- ساب base64 / raw / clash
- DoH: `/dns-query`
- KV برای ماندن داده

## بعد از Deploy

| مسیر | کار |
|------|-----|
| `/admin` | پنل |
| `/sub/<uuid>` | اشتراک |
| `/wizard` | راهنما |
| `/health` | وضعیت |

MIT — هر نفر Worker خودش را رایگان می‌سازد.
