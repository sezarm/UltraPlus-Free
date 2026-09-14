import { query, queryOne, execute, hasD1 } from "../database/d1.js";
import { hashPassword } from "./password.js";
import { ValidationError, NotFoundError } from "../core/errors.js";
import { newId } from "../utils/ids.js";

export async function listAdmins(env) {
  if (hasD1(env)) {
    try {
      const res = await query(env, "SELECT id, username, created_at, updated_at FROM admins ORDER BY created_at ASC");
      return (res.results || []).map((r) => ({ id: r.id, username: r.username, createdAt: r.created_at, updatedAt: r.updated_at }));
    } catch { return []; }
  }
  if (env.ULTRA_KV) {
    const a = await env.ULTRA_KV.get("admin", "json");
    if (!a) return [];
    const extra = (await env.ULTRA_KV.get("admins_extra", "json")) || [];
    return [{ id: a.id, username: a.username, createdAt: a.created_at }, ...extra.map((x) => ({ id: x.id, username: x.username, createdAt: x.created_at }))];
  }
  return [];
}

export async function addAdmin(env, username, password) {
  username = String(username || "").trim();
  if (username.length < 3) throw new ValidationError("username too short");
  if (!password || password.length < 8) throw new ValidationError("password min 8");
  const hash = await hashPassword(password);
  const id = newId();
  const now = Date.now();
  if (hasD1(env)) {
    const exists = await queryOne(env, "SELECT id FROM admins WHERE username = ?", [username]);
    if (exists) throw new ValidationError("username taken");
    await execute(env, "INSERT INTO admins (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [id, username, hash, now, now]);
    return { id, username };
  }
  if (env.ULTRA_KV) {
    const extra = (await env.ULTRA_KV.get("admins_extra", "json")) || [];
    if (extra.some((x) => x.username === username)) throw new ValidationError("username taken");
    const primary = await env.ULTRA_KV.get("admin", "json");
    if (primary && primary.username === username) throw new ValidationError("username taken");
    extra.push({ id, username, password_hash: hash, created_at: now });
    await env.ULTRA_KV.put("admins_extra", JSON.stringify(extra));
    return { id, username };
  }
  throw new ValidationError("no storage");
}

export async function deleteAdmin(env, id, currentAdminId) {
  if (id === currentAdminId) throw new ValidationError("cannot delete yourself");
  if (hasD1(env)) {
    const row = await queryOne(env, "SELECT id FROM admins WHERE id = ?", [id]);
    if (!row) throw new NotFoundError("admin not found");
    const all = await query(env, "SELECT id FROM admins");
    if ((all.results || []).length <= 1) throw new ValidationError("cannot delete last admin");
    await execute(env, "DELETE FROM admins WHERE id = ?", [id]);
    return true;
  }
  if (env.ULTRA_KV) {
    const primary = await env.ULTRA_KV.get("admin", "json");
    if (primary && primary.id === id) throw new ValidationError("cannot delete primary admin");
    let extra = (await env.ULTRA_KV.get("admins_extra", "json")) || [];
    extra = extra.filter((x) => x.id !== id);
    await env.ULTRA_KV.put("admins_extra", JSON.stringify(extra));
    return true;
  }
  return false;
}

export async function findAdminByUsername(env, username) {
  if (hasD1(env)) return queryOne(env, "SELECT * FROM admins WHERE username = ?", [username]);
  if (env.ULTRA_KV) {
    const a = await env.ULTRA_KV.get("admin", "json");
    if (a && a.username === username) return a;
    const extra = (await env.ULTRA_KV.get("admins_extra", "json")) || [];
    return extra.find((x) => x.username === username) || null;
  }
  return null;
}
