# UltraPlus-Free – Phase Roadmap

## Done

### Phase 1 – Foundation
- Project structure, MIT license, multi-language base
- Admin login, basic users, `/sub` endpoint

### Phase 2 – Panel strength
- Expire + traffic limits
- Enable/Disable toggle
- Sub link display under each user
- Optional KV + Telegram skeleton

### Phase 3 – Docs & packaging
- Single-file `worker.js`
- `INSTALL.md` (EN + FA)
- Strong README, SECURITY.md, version.json, CHANGELOG

## Current

### Phase 4 – Bot + stability (in progress)
- Stronger Telegram commands (`/add`, `/toggle`, `/del`)
- Keep `worker.js` and `src/index.ts` in sync
- Safer error messages

## Next

### Phase 5 – Subscription formats
- Plain text multi-line configs
- Optional simple Clash Meta snippet
- Clear client import notes in panel

### Phase 6 – Panel settings
- Editable path / remark template in panel (stored in KV)
- Health & usage summary on dashboard

### Phase 7 – Proxy core (careful, staged)
- Only after panel is solid
- Lightweight WebSocket path handling
- Avoid Cloudflare 1011 by keeping code lean

## Principles

1. Self-hosted only – each person owns their panel and password
2. No copy-paste of other projects’ code
3. Phase by phase – no broken half-features
4. Docs in EN + FA at every major step
