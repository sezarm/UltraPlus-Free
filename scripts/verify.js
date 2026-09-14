#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";
const root = process.cwd();
const required = [
  "src/index.js",
  "src/core/app.js",
  "src/users/user-service.js",
  "src/subscriptions/subscription-service.js",
  "src/admin/dashboard.js",
  "migrations/0001_initial.sql",
  "wrangler.jsonc",
  "VERSION",
];
let ok = true;
for (const f of required) {
  if (!existsSync(join(root, f))) { console.error("MISSING", f); ok = false; }
  else console.log("OK", f);
}
console.log("VERSION", readFileSync(join(root, "VERSION"), "utf8").trim());
process.exit(ok ? 0 : 1);
