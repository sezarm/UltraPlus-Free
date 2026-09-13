# Changelog – UltraPlus-Free

## v0.6.0 (Phase 7 alpha)

### Added
- **Lightweight VLESS-over-WebSocket core** (written from scratch)
- Uses Cloudflare `sockets` API for TCP outbound
- UUID checked against panel users (enable + expire)
- TCP command only (lean build)

### Notes
- This is an **alpha** core – test carefully on your own Worker
- Not a full BPB/Nova feature set (no fragment stack, no WARP, no multi-protocol suite)
- Panel + sub formats from 0.5.x still included

## v0.5.0
- Sub formats: base64 / raw / clash
- Panel settings: path / remark / sni (KV)

## v0.4.x
- Panel, users, Telegram, toggle, INSTALL
