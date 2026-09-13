# Deploy UltraPlus-Free

## What you need

**Only `worker.js`** → paste into Cloudflare Workers → Deploy.

No Python. No Node. No build step required.

## Optional variables (Cloudflare → Worker → Settings → Variables)

| Name | Purpose |
|------|--------|
| `ADMIN_PASSWORD` | Panel login (default `admin`) |
| `ULTRA_KV` | KV binding for persistent users |
| `SUB_TOKEN` | If set, `/sub` and `/client` need `?token=YOUR_TOKEN` |
| `TELEGRAM_BOT_TOKEN` | Bot |
| `TELEGRAM_ADMIN_ID` | Admin chat id |

## Optional obfuscation

`build.py` is **optional** and only for local use if you want a scrambled copy. Cloudflare does not run Python.

## Wizard

`wizard-installer.js` is separate – deploy on your account and share only your private link.
