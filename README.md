# UltraPlus-Free

Self-hosted Cloudflare Workers panel — modular, secure, Persian-first.

**Current: Phase 2 (`1.1.0-phase2`)**

## Features now
- First-run setup wizard (locks after admin)
- PBKDF2 auth + KV sessions
- User management (UI + API)
- Private `/sub/:token` (base64 / raw / clash)
- D1 + KV

## Deploy
See [docs/INSTALL.md](./docs/INSTALL.md)

```bash
npm i
# configure wrangler.jsonc KV + D1 ids
npm run deploy
```

Open `/setup` → `/admin` → Users.

## License
MIT
