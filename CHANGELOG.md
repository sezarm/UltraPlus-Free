# Changelog – UltraPlus-Free

## v0.4.1 (In progress)

### Planned / In progress
- Toggle Enable/Disable user without deleting
- Better subscription link display

## v0.4.0

### Added
- Single-file `worker.js` ready for direct upload to Cloudflare
- Complete installation guide (`INSTALL.md`) in English + Persian
- Multi-language panel (EN / FA / ZH) with RTL support
- Admin login with cookie session
- User management:
  - Add / Delete users
  - Expire date (days)
  - Traffic limit (GB)
- Private subscription link per user (`/sub/<uuid>`)
- VLESS link generation + Subscription-Userinfo headers
- Optional KV persistence
- Optional Telegram bot (admin-only commands: /status /users /help)
- Install Wizard page (`/wizard`)
- Health endpoint (`/health`)

### Important Notes
- Each person deploys their own panel
- Default password is `admin` – must be changed via `ADMIN_PASSWORD`
- Without KV, users are lost on redeploy
