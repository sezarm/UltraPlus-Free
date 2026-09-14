# UltraPlus-Free v2.0.0

Free **Cloudflare Worker** panel – VLESS/WS – no VPS, no Python.

## Deploy

1. Download / open **`worker.js`**
2. Cloudflare → Workers → Create → **Paste all** → Deploy
3. Optional: KV binding name **`ULTRA_KV`**
4. Optional vars: `ADMIN_PASSWORD`, `SUB_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_ID`
5. Open `https://YOUR_WORKER/admin` (default password: `admin`)

## Features (v2)

- Multi-lang panel (EN/FA/ZH)
- Users: add, batch add, edit, dup, enable/disable all, remove expired, search
- Sub: base64, raw, clash, sing-box, **xray**
- Extra hosts, fragment, maintenance, ban UUID list
- Admin IP allowlist, sub rate limit
- Telegram bot, `/status`, `/client/<uuid>`
- VLESS over WebSocket core

## License

MIT – each person hosts their own Worker for free.
