# UltraPlus-Free

Self-hosted Cloudflare Workers panel — **v1.7.0** (phases 1–7 complete).

## Features
- Setup wizard + secure auth (PBKDF2)
- Multi-user + private `/sub/:token`
- VLESS / Trojan over WebSocket
- Host pool + routing profiles + DoH
- Telegram admin bot
- Backup export/import
- Diagnostics + PWA shell
- Unit tests + CI

## Quick start
1. Bind **KV** `ULTRA_KV` and **D1** `DB`
2. Apply migrations
3. `npm i && npm run deploy`
4. Open `/setup`

Optional secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_IDS`

Webhook: `https://YOUR_WORKER/telegram/webhook`

## Docs
- [INSTALL](./docs/INSTALL.md)
- [Persian](./README.fa.md)
- [Roadmap](./ROADMAP.md)

MIT
