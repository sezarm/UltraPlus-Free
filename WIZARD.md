# UltraPlus-Free Wizard

## برای صاحب پروژه (host)

فایل: [`wizard-installer.js`](./wizard-installer.js)  
راهنما: [`HOST-WIZARD.md`](./HOST-WIZARD.md)

1. Deploy `wizard-installer.js` on your Cloudflare
2. Publish the `*.workers.dev` URL in README

## برای کاربر

1. Open the public wizard URL
2. Create Cloudflare API Token (Edit Workers + KV)
3. Paste Account ID + Token
4. Install → panel appears on **your** account

## Panel source (worker.js)

Installer downloads a known-good panel build:

```text
https://raw.githubusercontent.com/sezarm/UltraPlus-Free/af92c99406a321d3078f9bedc52cff97265d97be/worker.js
```
