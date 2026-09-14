# Install UltraPlus-Free (Phone or PC)

Version **5.2.0** — no terminal, no Python, no VPS.

## Need

1. Free [Cloudflare](https://dash.cloudflare.com) account
2. Full `worker.js` from this repo (~80KB)
3. ~10 minutes

## 1. Download

Open **worker.js** → Download. Size must be ~80KB (not a few lines).

## 2. Create Worker

1. [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create Worker**
3. Name it → **Deploy**
4. **Edit code** → delete all → paste full `worker.js`
5. **Save and Deploy**

Panel: `https://NAME.XXXX.workers.dev/admin`

## 3. KV (keep users)

1. **KV** → Create namespace
2. Worker **Settings → Bindings → KV**
3. Variable name: **`ULTRA_KV`** (exact)
4. Save

## 4. Password

**Variables**: `ADMIN_PASSWORD` = your password  
Default if empty: `admin`

Optional: `SUB_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_ID`

## 5. Use

Login `/admin` → **Users** → add → copy `/sub/UUID` into your client.

Formats: `?format=clash|singbox|xray|raw`

## Telegram (optional)

Set webhook to `https://YOUR_WORKER/telegram`

## Public tools

`/status` `/ip` `/dns-query` `/wizard` `/client/UUID`

## Backup

Dashboard → Full backup JSON

MIT — each person hosts their own Worker.
