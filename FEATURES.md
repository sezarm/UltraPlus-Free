# Feature checklist (v5.2.0)

## Panel
- [x] Login / logout (cookie)
- [x] Multi-language EN / FA / ZH
- [x] Dashboard stats + CF colo + log
- [x] Users: add, batch, edit, toggle, delete, dup, reset UUID, reset all UUID
- [x] Enable/disable all, cleanup expired, set all traffic
- [x] Export / import users JSON
- [x] Full backup JSON
- [x] Settings (path, SNI, FP, fragment, maintenance, ban, admin IP, chain, warp…)
- [x] Configs help page
- [x] Wizard page
- [x] API `/admin/api/users` and `/admin/api/stats`

## Proxy core
- [x] VLESS over WebSocket + TLS (client)
- [x] Trojan over WebSocket (password = UUID, SHA224)
- [x] Path check, concurrent limits, auth fail ban
- [x] Chain SOCKS5 / HTTP CONNECT

## Subscription
- [x] base64, raw, clash, sing-box, xray
- [x] Extra hosts + proxy IP
- [x] Optional Warp outbound in clash/sing-box (user key)
- [x] Routing rules (LAN, IR, ads, QUIC)
- [x] Client page `/client/:uuid`
- [x] SUB_TOKEN protection

## Extras
- [x] DoH `/dns-query`
- [x] `/ip` `/status` `/health` `/tools/latency`
- [x] Telegram bot POST `/telegram` + Test button
- [x] Optional KV `ULTRA_KV`

## Not claimed
- Full Warp Pro ISP noise like BPB
- Huge geosite databases
- One-click OAuth Wizard to Cloudflare account
