# Architecture

Request → security headers → rate limit → router → handler → D1/KV → response.

Entry `src/index.js` is thin. Modules under `src/core`, `src/auth`, `src/database`, `src/storage`, `src/admin`.

Stack: Workers + D1 + KV.
