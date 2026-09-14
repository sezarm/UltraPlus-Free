import { hasD1, execute } from "../database/d1.js";
import { newId } from "./ids.js";

export async function auditLog(env, action, adminId, metadata = {}) {
  if (!hasD1(env)) return;
  try {
    await execute(
      env,
      "INSERT INTO audit_logs (id, action, admin_id, metadata, created_at) VALUES (?, ?, ?, ?, ?)",
      [newId(), String(action), adminId || null, JSON.stringify(metadata || {}), Date.now()]
    );
  } catch (_) {}
}
