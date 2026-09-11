# 📖 UltraPlus-Free – Complete Installation Guide

**English** · **فارسی**

---

# English Guide

## What is UltraPlus-Free?

A self-hosted multi-language control panel that runs on Cloudflare Workers.  
Every person deploys **their own panel** on their own Cloudflare account.

### Features
- Multi-language panel (English / Persian / Chinese) + RTL
- Admin login with password
- User management (add / delete / expire date / traffic limit)
- Private subscription link for each user (`/sub/<uuid>`)
- Optional KV (users stay after redeploy)
- Optional Telegram bot (admin only)
- Install Wizard page

---

## Method 1 – Upload worker.js (Easiest)

1. Go to the repository: https://github.com/sezarm/UltraPlus-Free
2. Download the file **`worker.js`** (click on it → Download raw file)
3. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
4. Click **Create** → **Create Worker**
5. Give it a name (example: `ultraplus`)
6. Click **Deploy**
7. After deploy, click **Edit code**
8. Delete everything inside the editor
9. Paste the entire content of `worker.js`
10. Click **Deploy**

Your panel is ready at:  
`https://ultraplus.<your-subdomain>.workers.dev/admin`

**Default password:** `admin`

---

## Method 2 – Using Git + Wrangler (Recommended for developers)

```bash
git clone https://github.com/sezarm/UltraPlus-Free.git
cd UltraPlus-Free
npm install
npx wrangler login
npm run deploy
```

---

## Change Admin Password (Very Important)

1. Cloudflare Dashboard → Workers & Pages → your worker
2. **Settings** → **Variables and Secrets**
3. Add variable:
   - Name: `ADMIN_PASSWORD`
   - Value: your strong password
4. Save

Now login only works with your new password.

---

## Enable KV (Recommended – Persistent Users)

1. Cloudflare Dashboard → **Workers & Pages** → **KV**
2. Create a namespace (example name: `ULTRA_KV`)
3. Copy the **Namespace ID**
4. Go to your Worker → **Settings** → **Bindings**
5. Add binding:
   - Variable name: `ULTRA_KV`
   - KV namespace: the one you created
6. Save and redeploy if needed

Without KV, users are lost every time you redeploy.

---

## Setup Telegram Bot (Optional)

1. Open Telegram and talk to [@BotFather](https://t.me/BotFather)
2. Create a new bot with `/newbot` and copy the **token**
3. Get your numeric Telegram ID (you can use @userinfobot)
4. In Worker Variables add:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_ADMIN_ID` = your numeric ID
5. Set the webhook (replace TOKEN and YOUR-WORKER):
```
https://api.telegram.org/botTOKEN/setWebhook?url=https://YOUR-WORKER.workers.dev/telegram
```
6. Send `/start` to your bot

Admin commands: `/status` `/users` `/help`

---

## How to Create Users and Get Links

1. Login to `/admin`
2. Go to **Users**
3. Fill Name, optional Remark, Expire days, Traffic GB
4. Click **Add User**
5. Click the **Sub Link** button next to the user
6. Give only that private link to the user (`/sub/xxxxxxxx-xxxx-...`)

Never share the admin panel address or password.

---

## Important Notes

- Each person has their **own** panel and **own** password.
- Default password `admin` must be changed.
- This is a management panel + subscription generator.
- Keep your Worker private.

---

# راهنمای فارسی

## این پروژه چیست؟

یک پنل کنترل چندزبانه که روی Cloudflare Workers اجرا می‌شود.  
**هر کسی پنل خودش را روی اکانت خودش می‌سازد.**

### قابلیت‌ها
- پنل سه‌زبانه (فارسی / انگلیسی / چینی) + پشتیبانی راست‌چین
- ورود ادمین با رمز
- مدیریت کاربران (اضافه، حذف، تاریخ انقضا، محدودیت حجم)
- لینک سابسکریپشن خصوصی برای هر کاربر
- ذخیره دائمی با KV (اختیاری)
- ربات تلگرام (اختیاری – فقط ادمین)
- صفحه ویزارد نصب

---

## روش ۱ – آپلود فایل worker.js (ساده‌ترین روش)

1. برو به ریپو: https://github.com/sezarm/UltraPlus-Free
2. فایل **`worker.js`** را دانلود کن (روی فایل کلیک کن → Download raw file)
3. وارد [داشبورد کلودفلر](https://dash.cloudflare.com) شو → **Workers & Pages**
4. روی **Create** → **Create Worker** بزن
5. یک اسم بگذار (مثلاً `ultraplus`)
6. **Deploy** را بزن
7. بعد از دیپلوی روی **Edit code** بزن
8. همه محتوای داخل ادیتور را پاک کن
9. کل محتوای فایل `worker.js` را پیست کن
10. دوباره **Deploy** بزن

آدرس پنل شما:  
`https://ultraplus.<ساب‌دامین-شما>.workers.dev/admin`

**رمز پیش‌فرض:** `admin`

---

## تغییر رمز ادمین (خیلی مهم)

1. داشبورد کلودفلر → Workers → ورکر خودت
2. **Settings** → **Variables and Secrets**
3. متغیر جدید اضافه کن:
   - Name: `ADMIN_PASSWORD`
   - Value: رمز قوی خودت
4. ذخیره کن

از این به بعد فقط با رمز جدید وارد می‌شوی.

---

## فعال کردن KV (پیشنهادی – برای ماندگاری کاربران)

1. داشبورد کلودفلر → **Workers & Pages** → **KV**
2. یک Namespace بساز (مثلاً اسم: `ULTRA_KV`)
3. **Namespace ID** را کپی کن
4. برو به ورکر خودت → **Settings** → **Bindings**
5. یک Binding اضافه کن:
   - Variable name: `ULTRA_KV`
   - KV namespace: همانی که ساختی
6. ذخیره کن

بدون KV، با هر بار دیپلوی مجدد کاربران پاک می‌شوند.

---

## راه‌اندازی ربات تلگرام (اختیاری)

1. در تلگرام به [@BotFather](https://t.me/BotFather) پیام بده
2. با دستور `/newbot` یک ربات بساز و **توکن** را کپی کن
3. آیدی عددی تلگرام خودت را بگیر (از ربات‌هایی مثل @userinfobot)
4. در Variables ورکر این دو تا را اضافه کن:
   - `TELEGRAM_BOT_TOKEN` = توکن ربات
   - `TELEGRAM_ADMIN_ID` = آیدی عددی خودت
5. وب‌هوک را ست کن (TOKEN و آدرس ورکر را جایگزین کن):
```
https://api.telegram.org/botTOKEN/setWebhook?url=https://YOUR-WORKER.workers.dev/telegram
```
6. به ربات `/start` بفرست

دستورات ادمین: `/status` `/users` `/help`

---

## ساخت کاربر و گرفتن لینک

1. وارد `/admin` شو
2. برو به بخش **Users**
3. نام، توضیح، تعداد روز انقضا و حجم گیگ را وارد کن
4. روی **Add User** بزن
5. روی دکمه **Sub Link** کنار کاربر کلیک کن
6. فقط همان لینک خصوصی را به کاربر بده

هرگز آدرس پنل ادمین یا رمز را به کسی نده.

---

## نکات خیلی مهم

- هر نفر پنل و رمز **مخصوص خودش** را دارد.
- رمز پیش‌فرض `admin` را حتماً عوض کن.
- این پروژه یک پنل مدیریت + تولید لینک سابسکریپشن است.
- ورکر خودت را خصوصی نگه دار.

---

**موفق باشی.**
