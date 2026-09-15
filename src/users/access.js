import { listUsers } from "./user-service.js";
import { queryOne, execute, hasD1 } from "../database/d1.js";
import { isExpired } from "../utils/dates.js";

export async function findUserByUuid(env, uuid) {
  if (!uuid) return null;
  const u = String(uuid).toLowerCase();
  if (hasD1(env)) {
    try {
      const row = await queryOne(
        env,
        "SELECT * FROM users WHERE uuid_or_identifier = ? OR lower(uuid_or_identifier) = ? LIMIT 1",
        [uuid, u]
      );
      if (!row) return null;
      return {
        id: row.id,
        uuid: row.uuid_or_identifier,
        status: row.status,
        expiresAt: row.expires_at,
        quotaTotal: row.quota_total || 0,
        quotaUsed: row.quota_used || 0,
        expired: isExpired(row.expires_at),
        active: row.status === "active" && !isExpired(row.expires_at),
      };
    } catch (_) {}
  }
  const users = await listUsers(env, {});
  return users.find((x) => x.uuid && x.uuid.toLowerCase() === u) || null;
}

export function canAccessProxy(user) {
  if (!user) return { ok: false, reason: "auth" };
  if (user.status === "disabled") return { ok: false, reason: "disabled" };
  if (user.expired || isExpired(user.expiresAt)) return { ok: false, reason: "expired" };
  if (user.quotaTotal > 0 && user.quotaUsed >= user.quotaTotal) return { ok: false, reason: "quota" };
  return { ok: true };
}

export async function addQuotaUsed(env, userId, bytes) {
  if (!userId || !bytes || bytes < 0) return;
  const n = Math.floor(bytes);
  if (hasD1(env)) {
    try {
      await execute(env, "UPDATE users SET quota_used = COALESCE(quota_used,0) + ?, updated_at = ? WHERE id = ?", [
        n,
        Date.now(),
        userId,
      ]);
    } catch (_) {}
    return;
  }
  if (!env.ULTRA_KV) return;
  try {
    let list = (await env.ULTRA_KV.get("users_list", "json")) || [];
    list = list.map((u) =>
      u.id === userId ? { ...u, quota_used: (u.quota_used || 0) + n, updated_at: Date.now() } : u
    );
    await env.ULTRA_KV.put("users_list", JSON.stringify(list));
  } catch (_) {}
}

/** Session-local batcher — flush every ~256 KiB to cut D1/KV writes per WS frame */
export function createQuotaAccumulator(env, userId, threshold = 262144) {
  let pending = 0;
  let flushing = null;
  const flush = async () => {
    if (pending <= 0 || !userId) return;
    const n = pending;
    pending = 0;
    await addQuotaUsed(env, userId, n);
  };
  return {
    add(bytes) {
      if (!bytes || bytes < 0) return;
      pending += bytes | 0;
      if (pending >= threshold && !flushing) {
        flushing = flush().finally(() => {
          flushing = null;
        });
      }
    },
    async end() {
      if (flushing) await flushing;
      await flush();
    },
  };
}

export async function resetQuota(env, userId) {
  if (hasD1(env)) {
    await execute(env, "UPDATE users SET quota_used = 0, updated_at = ? WHERE id = ?", [Date.now(), userId]);
    return;
  }
  if (env.ULTRA_KV) {
    let list = (await env.ULTRA_KV.get("users_list", "json")) || [];
    list = list.map((u) => (u.id === userId ? { ...u, quota_used: 0 } : u));
    await env.ULTRA_KV.put("users_list", JSON.stringify(list));
  }
}
