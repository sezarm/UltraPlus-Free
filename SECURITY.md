# Security Policy – UltraPlus-Free

## Principles

- **Self-hosted only.** Every user deploys their own Worker on their own Cloudflare account.
- **No central server.** We do not host, log, or see your traffic or panel data.
- **Admin password is private.** Default is `admin` only for first setup. Change it immediately via `ADMIN_PASSWORD`.
- **Subscription links are credentials.** Treat `/sub/<uuid>` links like passwords. Do not publish them publicly.

## Recommended setup

1. Set a strong `ADMIN_PASSWORD` in Worker environment variables.
2. Enable KV (`ULTRA_KV`) so users persist and you are not forced to re-create them after every deploy.
3. If you enable the Telegram bot, set `TELEGRAM_ADMIN_ID` so only you can control the bot.
4. Do not share the `/admin` URL publicly.

## Reporting issues

Open an issue on the GitHub repository if you find a security problem in the panel code.

## Scope

This project is a **management panel and subscription generator**.  
It is not a full production-grade multi-protocol proxy core. Use it responsibly and in accordance with the laws that apply to you.
