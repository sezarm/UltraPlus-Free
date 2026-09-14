import { kvGetJson, kvPutJson } from "../storage/kv.js";

export async function getGuardSettings(env) {
  return (await kvGetJson(env, "guard_settings", null)) || {
    maintenance: false,
    maintenanceMessage: "Maintenance",
    banIps: [],
    adminAllowIps: [],
    subTokenGlobal: "",
  };
}

export async function saveGuardSettings(env, patch) {
  const cur = await getGuardSettings(env);
  const next = {
    maintenance: patch.maintenance !== undefined ? !!patch.maintenance : cur.maintenance,
    maintenanceMessage: String(patch.maintenanceMessage ?? cur.maintenanceMessage),
    banIps: Array.isArray(patch.banIps) ? patch.banIps : typeof patch.banIps === "string" ? patch.banIps.split(/[\s,]+/).filter(Boolean) : cur.banIps,
    adminAllowIps: Array.isArray(patch.adminAllowIps) ? patch.adminAllowIps : typeof patch.adminAllowIps === "string" ? patch.adminAllowIps.split(/[\s,]+/).filter(Boolean) : cur.adminAllowIps,
    subTokenGlobal: patch.subTokenGlobal != null ? String(patch.subTokenGlobal).trim() : cur.subTokenGlobal,
  };
  await kvPutJson(env, "guard_settings", next);
  return next;
}

export function isBanned(guard, ip) {
  if (!ip || !guard.banIps || !guard.banIps.length) return false;
  return guard.banIps.includes(ip);
}

export function adminIpAllowed(guard, ip) {
  if (!guard.adminAllowIps || !guard.adminAllowIps.length) return true;
  return guard.adminAllowIps.includes(ip);
}
