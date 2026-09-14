# Deploy UltraPlus-Free v5.1.0

## Important

The production `worker.js` is ~80KB (minified). If GitHub shows a tiny placeholder, replace it:

1. Download the file from the chat / release artifact
2. GitHub → **Add file → Upload files** → upload as `worker.js`
3. Cloudflare → Workers → paste entire file → Deploy

## Cloudflare setup

| Item | Value |
|------|--------|
| KV binding | `ULTRA_KV` |
| `ADMIN_PASSWORD` | your password |
| `SUB_TOKEN` | optional |
| Telegram | optional |

## Features vs BPB

Multi-user panel, VLESS+Trojan, DoH, Chain SOCKS5/HTTP, Warp-in-sub, routing, APIs, batch users, backup JSON.
