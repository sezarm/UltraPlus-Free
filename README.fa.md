# اولتراپلاس رایگان v1.13.0

پنل Cloudflare Workers — تونل VLESS/Trojan تقویت‌شده.

## نصب ساده (موبایل / بدون Wrangler)
[docs/INSTALL-SIMPLE.fa.md](./docs/INSTALL-SIMPLE.fa.md)

## تست سایت خارجی بعد از آپدیت تونل
[docs/TUNNEL-TEST.fa.md](./docs/TUNNEL-TEST.fa.md)

```bash
npm i
# KV + D1 در wrangler.jsonc
npx wrangler d1 migrations apply ultraplus-db --remote
npm run deploy
```

سپس `/setup`

MIT · https://github.com/sezarm/UltraPlus-Free
