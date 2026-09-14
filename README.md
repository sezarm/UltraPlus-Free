# UltraPlus-Free v1.0.0

Free self-hosted **Cloudflare Worker** panel (VLESS/WS).

## Deploy (no Python, no server)

1. Open [`worker.js`](./worker.js)
2. Copy all → Cloudflare **Workers** → Create → Paste → **Deploy**
3. Optional: bind **KV** as `ULTRA_KV`
4. Optional vars: `ADMIN_PASSWORD`, `SUB_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_ID`
5. Open `/admin` (default password `admin`)

## Links

| Path | Use |
|------|-----|
| `/admin` | Panel |
| `/sub/<uuid>` | Subscription |
| `/client/<uuid>` | User page |
| `/status` | Public status |

## License

MIT – help people for free. Each person hosts their own Worker.

## Note

`worker.js` is **minified** on purpose. For development keep a private readable copy; public deploy file is compacted.
