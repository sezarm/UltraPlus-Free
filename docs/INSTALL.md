# Install (Phase 1)

1. Create KV → bind `ULTRA_KV`
2. Create D1 `ultraplus-db` → bind `DB`
3. `wrangler d1 migrations apply ultraplus-db`
4. Put IDs in `wrangler.jsonc`
5. `npm i && npm run deploy`
6. Open `/setup` → create admin → `/admin`

Health: `GET /healthz`
