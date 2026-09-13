# Changelog – UltraPlus-Free

## v0.6.2 (Phase 7.2 – hardened core)

### Core stability
- Write queue for orderly TCP writes
- Clean shutdown on close/error
- Immediate VLESS response header after connect
- Header size guard (drop bad early data > 2KB)
- Path match with panel Settings (from 0.6.1)

### Limits
- TCP only
- UDP not on free Cloudflare Worker

## v0.6.1
- WS path must match Settings → WS Path

## v0.6.0
- First lean VLESS-over-WebSocket core

## v0.5.x / 0.4.x
- Panel, formats, Telegram, INSTALL
