Write-Host "UltraPlus-Free helper — npm i ; edit wrangler.jsonc ; npm run deploy"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Error "node required"; exit 1 }
npm install
node scripts/verify.js
