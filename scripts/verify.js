#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";
const root = process.cwd();
const required = [
  "src/index.js",
  "src/core/app.js",
  "src/core/router.js",
  "src/auth/password.js",
  "src/auth/session.js",
  "src/database/d1.js",
  "src/storage/kv.js",
  "migrations/0001_initial.sql",
  "wrangler.jsonc",
  "package.json",
  "VERSION",
];
let ok = true;
for (const f of required) {
  if (!existsSync(join(root, f))) {
    console.error("MISSING", f);
    ok = false;
  } else console.log("OK", f);
}
console.log("VERSION", readFileSync(join(root, "VERSION"), "utf8").trim());
process.exit(ok ? 0 : 1);
