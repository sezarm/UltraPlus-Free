# نصب UltraPlus-Free (با گوشی یا کامپیوتر)

نسخه **۵.۲.۰** — بدون ترمینال، بدون پایتون، بدون سرور.

---

## چه چیزی لازم است؟

1. حساب رایگان [Cloudflare](https://dash.cloudflare.com)
2. فایل `worker.js` از همین مخزن (فایل کامل، نه چند خط)
3. حدود ۱۰ دقیقه وقت

---

## مرحله ۱ — دانلود فایل

1. در گیت‌هاب روی فایل **`worker.js`** بزن
2. دکمه **Download** یا Raw را باز کن و ذخیره کن
3. حجم باید حدود **۸۰ کیلوبایت** باشد (اگر فقط چند خط بود، فایل ناقص است)

---

## مرحله ۲ — ساخت Worker در کلودفلر

1. وارد [dash.cloudflare.com](https://dash.cloudflare.com) شو
2. از منو برو **Workers & Pages**
3. **Create application** → **Create Worker**
4. یک اسم بگذار (مثلاً `ultraplus`) → **Deploy**
5. بعد از Deploy روی **Edit code** بزن
6. **همه کد قبلی را پاک کن**
7. محتوای کامل `worker.js` را Paste کن
8. **Save and Deploy**

آدرس پنل چیزی شبیه این می‌شود:
`https://ultraplus.XXXX.workers.dev/admin`

---

## مرحله ۳ — ساخت KV (برای ماندن کاربران)

بدون KV با هر بار Deploy کاربران پاک می‌شوند.

1. در کلودفلر: **Workers & Pages** → **KV**
2. **Create a namespace** → اسم مثلاً `ULTRA_KV_NS`
3. برگرد به Worker خودت → **Settings** → **Bindings**
4. **Add binding** → نوع **KV Namespace**
5. Variable name دقیقاً: `ULTRA_KV`
6. Namespace همانی که ساختی را انتخاب کن
7. **Save** → دوباره **Deploy** اگر خواست

---

## مرحله ۴ — رمز ادمین

1. Worker → **Settings** → **Variables and Secrets**
2. **Add** → نوع Secret یا Text
3. Name: `ADMIN_PASSWORD`
4. Value: یک رمز قوی
5. Save

اگر نگذاری، رمز پیش‌فرض: `admin` (حتماً عوض کن)

### اختیاری

| نام | کار |
|-----|-----|
| `SUB_TOKEN` | اگر بگذاری، لینک ساب باید `?token=...` داشته باشد |
| `TELEGRAM_BOT_TOKEN` | ربات تلگرام |
| `TELEGRAM_ADMIN_ID` | آیدی عددی ادمین تلگرام |

---

## مرحله ۵ — ورود به پنل

1. باز کن: `https://WORKER-تو.workers.dev/admin`
2. رمز را بزن
3. زبان: فارسی / English / 中文 از صفحه ورود

---

## مرحله ۶ — ساخت کاربر و لینک

1. منو **Users**
2. نام بده → Add
3. لینک ساب را کپی کن: `https://WORKER/sub/UUID`
4. در v2rayNG / Streisand / Hiddify و مشابه Import کن

فرمت‌های ساب:

- پیش‌فرض: base64
- `?format=clash`
- `?format=singbox`
- `?format=xray`
- `?format=raw`

اگر `SUB_TOKEN` گذاشتی: `?token=رمز`

---

## تنظیمات مهم پنل

- **WS Path** باید با کلاینت یکی باشد
- **Enable VLESS / Trojan**
- **Proxy IP / Extra hosts** برای آدرس اضافه در ساب
- **Chain** = `socks5` یا `http` در صورت نیاز
- **Warp در ساب** فقط اگر private key داری
- **Maintenance** برای قطع موقت ساب و پروکسی

---

## ابزارهای عمومی (بدون لاگین)

| آدرس | کار |
|------|-----|
| `/status` | وضعیت ساده |
| `/ip` | IP و colo |
| `/dns-query` | DoH |
| `/wizard` | راهنمای کوتاه |
| `/client/UUID` | صفحه کاربر |

---

## پشتیبان‌گیری

از داشبورد: **Full backup JSON** یا Export کاربران.

---

## مشکل رایج

| مشکل | کار |
|------|-----|
| ورود نمی‌شود | `ADMIN_PASSWORD` را چک کن |
| کاربران بعد Deploy رفتند | KV با نام `ULTRA_KV` ببند |
| کلاینت وصل نمی‌شود | Path و UUID و TLS و type=ws |
| ساب Forbidden | `SUB_TOKEN` را در لینک بگذار |
| فایل worker چند خط است | دوباره فایل کامل را Upload کن |

---

## ربات تلگرام (اختیاری)

1. از @BotFather یک ربات بساز → توکن را در `TELEGRAM_BOT_TOKEN` بگذار
2. آیدی عددی خودت را در `TELEGRAM_ADMIN_ID` بگذار
3. Webhook:
   `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://WORKER-تو.workers.dev/telegram`
4. در پنل Settings دکمه **Test Telegram**

دستورات: `/status` `/users` `/add Name` `/toggle ID` `/del ID` `/link ID` `/help`

---

MIT — هر نفر Worker خودش را می‌سازد. رایگان روی کلودفلر.
