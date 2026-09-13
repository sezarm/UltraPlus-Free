# Compile UltraPlus-Free (v2)

## Files

| File | Purpose |
|------|--------|
| `worker.source.js` | Edit this (readable) |
| `build.py` | Stronger obfuscation v2 |
| `worker.js` | Deploy to Cloudflare |

## Commands

```bash
python3 build.py
```

## Features of v2 compiler

- Strip comments + minify
- Rename internal functions to `_0x...`
- Rename internal state variables
- Junk noise at top of file
- Keeps `export default` and CF bindings intact

## Security note

Keep `worker.source.js` private. Deploy only the compiled file.
