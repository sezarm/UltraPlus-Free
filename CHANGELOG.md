# Changelog – UltraPlus-Free

## v0.4.1 (Released)

### Added
- **Enable / Disable toggle** for users (without deleting)
- Subscription link shown under each user name in the panel
- Better status badges (green = active, red = disabled)
- Improved actions column

### Fixed
- Full worker.js restored and updated

## v0.4.0

### Added
- Single-file `worker.js` ready for direct upload to Cloudflare
- Complete installation guide (`INSTALL.md`) in English + Persian
- Multi-language panel (EN / FA / ZH) with RTL support
- Admin login with cookie session
- User management (Add / Delete / Expire / Traffic)
- Private subscription link per user (`/sub/<uuid>`)
- VLESS link generation + Subscription-Userinfo headers
- Optional KV persistence
- Optional Telegram bot (admin-only: /status /users /help)
- Install Wizard page (`/wizard`)
- Health endpoint (`/health`)

### Important Notes
- Each person deploys their own panel
- Default password is `admin` – must be changed via `ADMIN_PASSWORD`
- Without KV, users are lost on redeploy
