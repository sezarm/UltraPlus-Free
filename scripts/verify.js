#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";
const root = process.cwd();
const required = [
  "src/index.js",
  "src/telegram/webhook.js",
  "src/telegram/commands.js",
  "src/storage/backup.js",
  "src/admin/diagnostics.js",
  "src/protocols/session.js",
  "src/network/hosts.js",
  "VERSION",
];
let ok = true;
for (const f of required) {
  if (!existsSync(join(root, f))) { console.error("MISSING", f); ok = false; }
  else console.log("OK", f);
}
console.log("VERSION", readFileSync(join(root, "VERSION"), "utf8").trim());
process.exit(ok ? 0 : 1);
