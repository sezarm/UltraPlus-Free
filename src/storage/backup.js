import { listUsers, createUser } from "../users/user-service.js";
import { getNetworkSettings, saveNetworkSettings } from "../network/settings.js";
import { listHosts } from "../network/hosts.js";
import { getRoutingProfile } from "../network/routing.js";
import { getTelegramConfig } from "../telegram/config.js";
import { APP_VERSION } from "../core/constants.js";
import { kvPutJson } from "./kv.js";

export async function exportBackup(env) {
  const users = await listUsers(env, {});
  const settings = await getNetworkSettings(env);
  const hosts = await listHosts(env);
  const routing = await getRoutingProfile(env);
  const tg = await getTelegramConfig(env);
  return {
    version: APP_VERSION,
    created_at: new Date().toISOString(),
    data: {
      users: users.map((u) => ({
        displayName: u.displayName,
        uuid: u.uuid,
        token: u.token,
        status: u.status,
        expiresAt: u.expiresAt,
        quotaTotal: u.quotaTotal,
        notes: u.notes,
      })),
      network: settings,
      hosts,
      routingProfile: routing.id,
      telegram: { enabled: tg.enabled, adminIds: tg.adminIds, botToken: tg.botToken ? "***" : "" },
    },
  };
}

export function validateBackup(obj) {
  if (!obj || typeof obj !== "object") return { ok: false, error: "not object" };
  if (!obj.data || typeof obj.data !== "object") return { ok: false, error: "missing data" };
  return { ok: true, users: (obj.data.users || []).length, version: obj.version };
}

export async function importBackup(env, obj, { replaceUsers = false } = {}) {
  const v = validateBackup(obj);
  if (!v.ok) throw new Error(v.error);
  const data = obj.data;
  if (data.network) await saveNetworkSettings(env, data.network);
  if (data.hosts && Array.isArray(data.hosts)) await kvPutJson(env, "host_pool", data.hosts);
  if (data.routingProfile) await kvPutJson(env, "routing_profile", data.routingProfile);
  if (replaceUsers && Array.isArray(data.users)) {
    for (const u of data.users) {
      try {
        await createUser(env, {
          displayName: u.displayName || "restored",
          days: 0,
          quotaGb: u.quotaTotal ? u.quotaTotal / 1e9 : 0,
          notes: u.notes || "imported",
        });
      } catch (_) {}
    }
  }
  return { imported: true, usersAttempted: replaceUsers ? (data.users || []).length : 0 };
}
