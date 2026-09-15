# نصب ساده UltraPlus-Free (بدون ترمینال / مناسب موبایل)

این راهنما برای کسی است که **Wrangler بلد نیست** یا بیشتر با **گوشی** کار می‌کند.

---

## واقعیت مهم (یک‌بار بخوان)

| موضوع | توضیح |
|--------|--------|
| پنل بعد از نصب | فقط با **مرورگر** کار می‌کند (موبایل عالی است) |
| نصب اولیه‌ی Worker | از روی گوشی سخت‌تر از کامپیوتر است؛ اگر ممکن است یک‌بار از **کامپیوتر یا تبلت** انجام بده |
| بدون کامپیوتر | با روش «اتصال گیت‌هاب به Cloudflare» معمولاً انجام‌پذیر است |
| اکانت | باید اکانت **رایگان Cloudflare** داشته باشی |

پروژه **سرور شخصی روی VPS نمی‌خواهد**؛ همه‌چیز روی Cloudflare Workers است.

---

## چیزهایی که لازم داری

1. اکانت [Cloudflare](https://dash.cloudflare.com/sign-up)
2. اکانت [GitHub](https://github.com/signup)
3. پروژه: https://github.com/sezarm/UltraPlus-Free

---

# روش ۱ (پیشنهادی): داشبورد Cloudflare + گیت‌هاب

### ۱) Fork

1. برو: https://github.com/sezarm/UltraPlus-Free
2. **Fork** بزن تا کپی در اکانت خودت بیاید.

### ۲) ساخت KV

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **KV**
2. **Create a namespace** مثلاً `ultraplus-kv`
3. **Namespace ID** را کپی کن.

### ۳) ساخت D1

1. **Workers & Pages** → **D1** → **Create database** مثلاً `ultraplus-db`
2. **Database ID** را کپی کن.

### ۴) اتصال Worker به گیت‌هاب

1. **Workers & Pages** → **Create** → اتصال به **Git repository**
2. GitHub را Authorize کن و فورک **UltraPlus-Free** را انتخاب کن.
3. ورودی پروژه: `src/index.js` · فایل تنظیمات: `wrangler.jsonc`

### ۵) Bindings (خیلی مهم)

| نام بایندینگ | نوع | مقدار |
|--------------|-----|--------|
| `ULTRA_KV` | KV | همان KV |
| `DB` | D1 | همان D1 |

نام‌ها باید **دقیقاً** همین باشند.

### ۶) Migration دیتابیس (یک‌بار)

**با کامپیوتر:**

```bash
npm install
npx wrangler login
npx wrangler d1 migrations apply ultraplus-db --remote
```

**فقط گوشی:** از یک نفر با لپ‌تاپ همین را بخواه، یا در D1 Console محتویات `migrations/0001` تا `0004` را به ترتیب اجرا کن.

بدون این مرحله ساخت ادمین ممکن است خطا بدهد.

### ۷) پنل

1. آدرس Worker را باز کن: `https://....workers.dev`
2. برو به `/setup` و ادمین بساز.
3. بعداً ورود از `/login`.

### ۸) کاربر و ساب

1. **Users** → کاربر جدید
2. لینک: `https://آدرس-ورکر/sub/توکن`
3. در v2rayNG / Hiddify / Streisand / Clash وارد کن.

---

# روش ۲: یک‌بار کمک بگیر (بهترین برای موبایل‌محورها)

1. فورک گیت‌هاب را بساز.
2. به یک نفر معتمد بگو:

```text
ریپوی من: https://github.com/USERNAME/UltraPlus-Free
لطفاً KV و D1 بساز، IDها را در wrangler بگذار،
migrations را apply کن و deploy بزن.
فقط آدرس workers.dev را بفرست.
```

3. از آن به بعد پنل و ساب فقط با **مرورگر گوشی** دست خودت است.

---

# روش ۳: خودت با کامپیوتر (اختیاری)

```bash
git clone https://github.com/YOUR_USERNAME/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
# idها را در wrangler.jsonc بگذار
npx wrangler d1 migrations apply ultraplus-db --remote
npm run deploy
```

---

## بعد از نصب — روزمره با گوشی

| کار | کجا |
|-----|-----|
| ورود | `/login` |
| کاربر | Users |
| لینک ساب | همان کاربر |
| اسکن IP | Network |
| بک‌آپ | Backup |

در کلاینت: Server = IP لیست · SNI/Host = دامنه Worker.

---

## خطاهای رایج

| مشکل | کار |
|------|-----|
| setup خطا | D1 یا migration |
| سشن می‌پرد | KV با نام `ULTRA_KV` |
| ساب خالی | کاربر فعال + Host فعال |

---

## خلاصه

**فورک → KV + D1 → وصل Worker → migration → /setup → کاربر → لینک sub روی گوشی.**

سخت‌ترین قسمت نصب اول است؛ استفاده بعدی برای موبایل طراحی شده.
