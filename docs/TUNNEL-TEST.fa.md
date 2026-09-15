# تست تونل بعد از v1.13.0

بعد از `npm run deploy`:

1. Network → Path = `/` · Fragment خاموش · Chain = off
2. یک کاربر فعال بساز و لینک raw بگیر
3. در v2rayNG / Hiddify فقط همان کانفیگ (Global/Proxy)
4. DNS کلاینت: `1.1.1.1` یا DoH ورکر `/dns-query`
5. تست: `http://cp.cloudflare.com/generate_204` سپس `https://1.1.1.1`
6. اگر این‌ها OK شد، یوتیوب/گوگل را تست کن

اگر هنوز فقط ایران باز است:
- Clash با `GEOIP,IR,DIRECT` طبیعی است برای دامنه ir
- سایت خارجی باید از PROXY برود؛ اگر نرفت تونل یا DNS را دوباره چک کن

UDP (تماس تلگرام ویدیویی) روی Workers پشتیبانی نمی‌شود.
