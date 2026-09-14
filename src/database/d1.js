import { DatabaseError } from "../core/errors.js";
export function hasD1(env) { return !!env.DB; }
export async function query(env, sql, binds = []) {
  if (!env.DB) throw new DatabaseError("D1 not bound");
  try {
    const stmt = env.DB.prepare(sql);
    if (binds.length) return stmt.bind(...binds).all();
    return stmt.all();
  } catch (e) { throw new DatabaseError(e.message || "Query failed"); }
}
export async function queryOne(env, sql, binds = []) {
  if (!env.DB) throw new DatabaseError("D1 not bound");
  try {
    const stmt = env.DB.prepare(sql);
    if (binds.length) return stmt.bind(...binds).first();
    return stmt.first();
  } catch (e) { throw new DatabaseError(e.message || "Query failed"); }
}
export async function execute(env, sql, binds = []) {
  if (!env.DB) throw new DatabaseError("D1 not bound");
  try {
    const stmt = env.DB.prepare(sql);
    if (binds.length) return stmt.bind(...binds).run();
    return stmt.run();
  } catch (e) { throw new DatabaseError(e.message || "Execute failed"); }
}
