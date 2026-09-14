# Deploy v5.2.0

1. Download **worker.js** from latest chat artifact (full ~83KB minified)
2. GitHub: Add file → Upload files → overwrite `worker.js` (if repo shows tiny placeholder)
3. Cloudflare Workers → paste entire file → Deploy
4. KV binding name: `ULTRA_KV`
5. Variable: `ADMIN_PASSWORD`
6. Open `/admin`

Verify file contains: `v5.2.0`, `export default`, `cloudflare:sockets`
