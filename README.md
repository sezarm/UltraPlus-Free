# UltraPlus-Free

Self-hosted Cloudflare Workers panel — **v1.12.0** (server edition).

Users · VLESS/Trojan · Host pool · Health/Radar · Chain · WARP · Telegram · Backup · Guard

**Not included:** Wizard CLI (deferred).

```bash
npm i
# wrangler.jsonc → KV + D1 ids
npx wrangler d1 migrations apply ultraplus-db
npm run deploy
```

MIT · [docs/API.md](docs/API.md)
