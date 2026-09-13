# Compile / Obfuscate UltraPlus-Free

## Idea

| File | Role |
|------|------|
| **worker.source.js** | Readable source – only **you** edit |
| **build.py** | Compiler |
| **worker.js** (compiled) | Deploy to Cloudflare |

## Workflow

1. Edit `worker.source.js`
2. Run `python3 build.py`
3. Deploy generated `worker.js` to Cloudflare

## Secrecy

- Keep source **private** (local or private repo).
- Public users only hit your Worker URL – they do not download source automatically.
- Account owner can still open code in Cloudflare dashboard.
- Obfuscation reduces casual copy/paste of clean source.

## Wizard

Host `wizard-installer.js` only on your account; share the workers.dev link privately.
