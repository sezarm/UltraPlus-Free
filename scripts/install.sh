#!/usr/bin/env bash
set -euo pipefail
echo "UltraPlus-Free install helper (not CF OAuth wizard)"
if ! command -v node >/dev/null; then echo "need node"; exit 1; fi
npm install
node scripts/verify.js || true
echo "Configure wrangler.jsonc KV+D1, then: npx wrangler d1 migrations apply ultraplus-db && npm run deploy"
