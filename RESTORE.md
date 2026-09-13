# Worker recovery

If `worker.js` on `main` is a stub, use this **known-good** full panel:

```text
https://raw.githubusercontent.com/sezarm/UltraPlus-Free/af92c99406a321d3078f9bedc52cff97265d97be/worker.js
```

That file is **v0.6.8** (Sing-box, import/export, VLESS core, stats).

## Auto-deploy wizard design (v0.7.0)

See [WIZARD.md](./WIZARD.md).

Flow:

1. User creates Cloudflare **API Token** (Workers + KV edit)
2. Opens `/wizard` on any running UltraPlus
3. Pastes Account ID + Token + worker name + panel password
4. Backend calls Cloudflare API: create KV → upload `worker.js` from GitHub → bind secrets
5. Token is **not stored**

OAuth “login with Cloudflare” like BPB is a larger product; API Token form is the MIT-safe equivalent.
