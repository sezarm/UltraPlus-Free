# UltraPlus-Free – Auto Install Wizard

## Idea

You (or your users) open `/wizard` on a running UltraPlus Worker, paste **your own** Cloudflare Account ID + API Token, and the wizard:

1. Creates a KV namespace
2. Downloads latest `worker.js` from this GitHub repo
3. Uploads it as a new Worker on **your** account
4. Binds `ULTRA_KV` + `ADMIN_PASSWORD`
5. Tries to enable `*.workers.dev`

No Cloudflare email password. Token is **not saved**.

## Token permissions

Create token: [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)

Suggested template: **Edit Cloudflare Workers**, or custom:

- Account · Workers Scripts · Edit
- Account · Workers KV Storage · Edit
- Account · Account Settings · Read (for Account ID context)

## First install (chicken & egg)

1. Manually create one Worker in Cloudflare
2. Paste `worker.js` from this repo → Deploy
3. Open `https://YOUR-WORKER/wizard`
4. Use the form to install more panels / updates

## Security

- Use a **scoped** token; revoke after install if you want
- Prefer strong `ADMIN_PASSWORD`
- Do not share tokens in screenshots

## Not the same as BPB Wizard

Built from scratch (MIT). Uses API Token form, not a copy of BPB GPL code.
