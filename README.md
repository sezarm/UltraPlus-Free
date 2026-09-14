# UltraPlus-Free v5.2.0

پنل رایگان Cloudflare Worker — چندکاربره، VLESS + Trojan، بدون VPS.

**نصب با گوشی (بدون ترمینال):** [INSTALL-FA.md](./INSTALL-FA.md) · [English](./INSTALL-EN.md)

**لیست قابلیت‌ها:** [FEATURES.md](./FEATURES.md)

---

## فایل اصلی

| فایل | توضیح |
|------|--------|
| **`worker.js`** | کل پنل + پروکسی (یک فایل) → در Cloudflare Paste کن |
| `INSTALL-FA.md` | آموزش کامل فارسی با مراحل لمسی |
| `INSTALL-EN.md` | English install |
| `FEATURES.md` | چک‌لیست عملکردها |
| `LICENSE` | MIT |

اگر `worker.js` روی گیت‌هاب خیلی کوچک بود، فایل کامل را از بخش Releases یا فایل پیوست پروژه بگیر (باید حدود ۸۰KB باشد).

---

## خلاصه نصب (۳ قدم — فقط مرورگر)

1. Cloudflare → Create Worker → Paste **کل** `worker.js` → Deploy  
2. KV Binding با نام متغیر **`ULTRA_KV`**  
3. Secret: **`ADMIN_PASSWORD`** → برو `/admin`

جزئیات: **[INSTALL-FA.md](./INSTALL-FA.md)**

---

## بعد از نصب

- پنل: `/admin`
- ساب هر کاربر: `/sub/<uuid>`
- DoH: `/dns-query`
- وضعیت: `/status` · IP: `/ip`

MIT — هر نفر Worker خودش را می‌سازد.
