# UltraPlus-Free v4.0.0

Cloudflare Worker panel – single file – free.

## Deploy

1. Copy `worker.js` → Cloudflare Workers → Deploy
2. Optional KV binding: `ULTRA_KV`
3. Optional: `ADMIN_PASSWORD`, `SUB_TOKEN`, Telegram vars
4. Open `/admin` (default password `admin`)

## Protocols

- VLESS + Trojan (WS+TLS)
- Subscription: base64 / raw / clash / singbox / xray
- DoH: `https://YOUR_WORKER/dns-query`

MIT
