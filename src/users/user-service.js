import { query, queryOne, execute, hasD1 } from "../database/d1.js";
import { newId, newSubToken } from "../utils/ids.js";
import { now, daysFromNow, isExpired } from "../utils/dates.js";
import { ValidationError, NotFoundError, DatabaseError } from "../core/errors.js";

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username || null,
    displayName: row.display_name,
    token: row.token,
    uuid: row.uuid_or_identifier,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
    quotaTotal: row.quota_total || 0,
    quotaUsed: row.quota_used || 0,
    dailyLimit: row.daily_limit || 0,
    notes: row.notes || "",
    expired: isExpired(row.expires_at),
    active: row.status === "active" && !isExpired(row.expires_at),
  };
}

export async function listUsers(env, { status, q } = {}) {
  if (!hasD1(env)) {
    if (!env.ULTRA_KV) return [];
    const data = (await env.ULTRA_KV.get("users_list", "json")) || [];
    let list = data.map(mapUser);
    if (status === "active") list = list.filter((u) => u.active);
    if (status === "disabled") list = list.filter((u) => u.status === "disabled");
    if (status === "expired") list = list.filter((u) => u.expired);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(
        (u) =>
          (u.displayName || "").toLowerCase().includes(s) ||
          (u.username || "").toLowerCase().includes(s)
      );
    }
    return list;
  }
  let sql = "SELECT * FROM users WHERE 1=1";
  const binds = [];
  if (status === "active") {
    sql += " AND status = 'active' AND (expires_at IS NULL OR expires_at = 0 OR expires_at > ?)";
    binds.push(Date.now());
  } else if (status === "disabled") {
    sql += " AND status = 'disabled'";
  } else if (status === "expired") {
    sql += " AND expires_at IS NOT NULL AND expires_at > 0 AND expires_at <= ?";
    binds.push(Date.now());
  }
  if (q) {
    sql += " AND (display_name LIKE ? OR username LIKE ?)";
    binds.push("%" + q + "%", "%" + q + "%");
  }
  sql += " ORDER BY created_at DESC LIMIT 500";
  const res = await query(env, sql, binds);
  return (res.results || []).map(mapUser);
}

export async function getUserById(env, id) {
  if (hasD1(env)) {
    const row = await queryOne(env, "SELECT * FROM users WHERE id = ?", [id]);
    return mapUser(row);
  }
  const list = (await env.ULTRA_KV?.get("users_list", "json")) || [];
  return mapUser(list.find((u) => u.id === id));
}

export async function getUserByToken(env, token) {
  if (!token) return null;
  if (hasD1(env)) {
    const row = await queryOne(env, "SELECT * FROM users WHERE token = ?", [token]);
    return mapUser(row);
  }
  const list = (await env.ULTRA_KV?.get("users_list", "json")) || [];
  return mapUser(list.find((u) => u.token === token));
}

export async function createUser(env, input) {
  const displayName = String(input.displayName || input.name || "").trim();
  if (!displayName || displayName.length < 1) throw new ValidationError("displayName required");
  const days = parseInt(input.days || input.expireDays || 0, 10) || 0;
  const quotaGb = parseFloat(input.quotaGb || 0) || 0;
  const id = newId();
  const token = newSubToken();
  const uuid = newId();
  const t = now();
  const expiresAt = daysFromNow(days);
  const quotaTotal = Math.floor(quotaGb * 1024 * 1024 * 1024);
  const row = {
    id,
    username: input.username || null,
    display_name: displayName,
    token,
    uuid_or_identifier: uuid,
    status: "active",
    created_at: t,
    updated_at: t,
    expires_at: expiresAt,
    quota_total: quotaTotal,
    quota_used: 0,
    daily_limit: 0,
    notes: String(input.notes || ""),
    metadata: null,
  };
  if (hasD1(env)) {
    await execute(
      env,
      `INSERT INTO users (id, username, display_name, token, uuid_or_identifier, status, created_at, updated_at, expires_at, quota_total, quota_used, daily_limit, notes, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.username, row.display_name, row.token, row.uuid_or_identifier, row.status, row.created_at, row.updated_at, row.expires_at, row.quota_total, row.quota_used, row.daily_limit, row.notes, row.metadata]
    );
  } else if (env.ULTRA_KV) {
    const list = (await env.ULTRA_KV.get("users_list", "json")) || [];
    list.unshift(row);
    await env.ULTRA_KV.put("users_list", JSON.stringify(list.slice(0, 2000)));
  } else {
    throw new DatabaseError("No D1 or KV");
  }
  return mapUser(row);
}

export async function updateUser(env, id, patch) {
  const user = await getUserById(env, id);
  if (!user) throw new NotFoundError("User not found");
  const displayName = patch.displayName != null ? String(patch.displayName).trim() : user.displayName;
  const status = patch.status || user.status;
  let expiresAt = user.expiresAt;
  if (patch.days != null) {
    const d = parseInt(patch.days, 10) || 0;
    expiresAt = d > 0 ? daysFromNow(d) : null;
  }
  if (patch.extendDays != null) {
    const d = parseInt(patch.extendDays, 10) || 0;
    const base = user.expiresAt && user.expiresAt > Date.now() ? user.expiresAt : Date.now();
    expiresAt = base + d * 86400000;
  }
  let quotaTotal = user.quotaTotal;
  if (patch.quotaGb != null) quotaTotal = Math.floor(parseFloat(patch.quotaGb) * 1024 * 1024 * 1024) || 0;
  const notes = patch.notes != null ? String(patch.notes) : user.notes;
  const t = now();
  if (hasD1(env)) {
    await execute(
      env,
      `UPDATE users SET display_name=?, status=?, expires_at=?, quota_total=?, notes=?, updated_at=? WHERE id=?`,
      [displayName, status, expiresAt, quotaTotal, notes, t, id]
    );
  } else if (env.ULTRA_KV) {
    let list = (await env.ULTRA_KV.get("users_list", "json")) || [];
    list = list.map((u) =>
      u.id === id
        ? { ...u, display_name: displayName, status, expires_at: expiresAt, quota_total: quotaTotal, notes, updated_at: t }
        : u
    );
    await env.ULTRA_KV.put("users_list", JSON.stringify(list));
  }
  return getUserById(env, id);
}

export async function setUserStatus(env, id, status) {
  return updateUser(env, id, { status });
}

export async function deleteUser(env, id) {
  const user = await getUserById(env, id);
  if (!user) throw new NotFoundError("User not found");
  if (hasD1(env)) {
    await execute(env, "DELETE FROM users WHERE id = ?", [id]);
  } else if (env.ULTRA_KV) {
    let list = (await env.ULTRA_KV.get("users_list", "json")) || [];
    list = list.filter((u) => u.id !== id);
    await env.ULTRA_KV.put("users_list", JSON.stringify(list));
  }
  return true;
}

export async function regenerateToken(env, id) {
  const user = await getUserById(env, id);
  if (!user) throw new NotFoundError("User not found");
  const token = newSubToken();
  const t = now();
  if (hasD1(env)) {
    await execute(env, "UPDATE users SET token=?, updated_at=? WHERE id=?", [token, t, id]);
  } else if (env.ULTRA_KV) {
    let list = (await env.ULTRA_KV.get("users_list", "json")) || [];
    list = list.map((u) => (u.id === id ? { ...u, token, updated_at: t } : u));
    await env.ULTRA_KV.put("users_list", JSON.stringify(list));
  }
  return getUserById(env, id);
}

export async function userStats(env) {
  const list = await listUsers(env, {});
  return {
    total: list.length,
    active: list.filter((u) => u.active).length,
    disabled: list.filter((u) => u.status === "disabled").length,
    expired: list.filter((u) => u.expired).length,
  };
}
