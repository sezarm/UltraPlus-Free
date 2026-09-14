# UltraPlus-Free

Self-hosted Cloudflare Workers panel — modular, secure, Persian-first.

**Version:** `1.1.0-phase2`

## Phase 2 features
- First-run `/setup` (locks after admin)
- PBKDF2 login + KV sessions
- Users: create / disable / delete / regenerate token
- Private subscription: `/sub/<token>?format=base64|raw|clash`
- API: `/api/users`, `/api/stats`, `/api/health`
- Mobile hamburger UI

## Deploy
See [docs/INSTALL.md](./docs/INSTALL.md)

1. Bind **KV** as `ULTRA_KV` and **D1** as `DB`
2. Apply migrations
3. `npm run deploy`
4. Open `/setup`

## License
MIT
