# Testing UltraPlus-Free proxy (v0.6.4+)

## Setup

1. Deploy latest `worker.js`
2. Set `ADMIN_PASSWORD`
3. Bind KV as `ULTRA_KV` (recommended)
4. Login `/admin` → Settings → set **WS Path** (example `/` or `/ws`) → Save
5. Users → Add user → copy Sub Link

## Client (example: v2rayNG / similar)

1. Import subscription URL or paste raw VLESS from `?format=raw`
2. Confirm:
   - Protocol: VLESS
   - Network: WebSocket
   - TLS: on
   - Path: **same as panel Settings**
   - UUID: same as user
3. Connect and open a simple HTTPS site

## Check panel

- Dashboard: **Proxy OK / Fail / Auth Deny** counters (reset when Worker isolate restarts)
- `/health` JSON includes `stats`

## Common issues

| Symptom | Check |
|---------|--------|
| Connect fails immediately | Path mismatch, wrong UUID, user disabled/expired |
| Path mismatch | Settings WS Path vs client path |
| Works then drops | Destination blocked, Worker CPU limit, free-plan limits |
| No UDP apps | Expected – TCP only on this core |

## Limits

- TCP only
- No UDP on free Cloudflare Worker
- Alpha core – not a full commercial panel stack
