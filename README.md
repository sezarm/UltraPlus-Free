# UltraPlus-Free v5.1.0

Free Cloudflare Worker panel – **stronger multi-user management than BPB**, with VLESS + Trojan + DoH + Chain + Warp-in-sub.

## Deploy

1. Get **`worker.js`** (full minified build – not a placeholder)
2. Cloudflare Workers → Create → **Paste all** → Save & Deploy
3. Bind KV: `ULTRA_KV`
4. Set `ADMIN_PASSWORD`
5. Open `/admin`

See [DEPLOY.md](./DEPLOY.md)

## Links

- Panel: `/admin`
- Sub: `/sub/<uuid>`
- Client page: `/client/<uuid>`
- Status: `/status` · IP: `/ip` · DoH: `/dns-query`
- Wizard: `/wizard`
- Backup: `/admin/backup`

MIT – each person hosts their own Worker.
