# میزبانی ویزارد نصب (برای صاحب ریپو)

## ایده

تو یک‌بار فایل **`wizard-installer.js`** را روی Cloudflare خودت Deploy می‌کنی.
بعد لینک `https://….workers.dev` را در README / کانال می‌گذاری.
هر کاربر با Account ID + API Token پنل را **روی حساب خودش** نصب می‌کند.

## مراحل برای تو (sezarm)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → Worker
2. نام مثلاً: `ultraplus-wizard`
3. کد داخل ادیتور را پاک کن و محتویات این فایل را بچسبان:
   - [`wizard-installer.js`](./wizard-installer.js)
4. **Deploy**
5. لینک را کپی کن، مثلاً:
   ```text
   https://ultraplus-wizard.YOUR_SUBDOMAIN.workers.dev
   ```
6. همان لینک را در README ریپو بگذار (جای `YOUR_WIZARD_URL`)

## مراحل برای کاربر نهایی

1. باز کردن لینک ویزارد تو
2. ساخت API Token در Cloudflare با دسترسی Workers + KV
3. وارد کردن Account ID + Token + نام Worker + رمز پنل
4. دکمه نصب → KV + Worker روی حساب **او** ساخته می‌شود
5. ورود به `/admin` با رمزی که گذاشته

## امنیت

- توکن فقط در همان درخواست استفاده می‌شود و ذخیره نمی‌شود
- بعد از نصب، کاربر می‌تواند Token را Revoke کند
- این ویزارد پنل پروکسی نیست؛ فقط نصاب است

## تفاوت با BPB

کد از صفر نوشته شده (MIT). از OAuth رسمی Cloudflare استفاده نمی‌کند؛ از **API Token** کاربر استفاده می‌کند که همان قدرت نصب را می‌دهد.
