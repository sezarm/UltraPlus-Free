import { getSession, readSessionId } from "./session.js";
import { AuthenticationError } from "../core/errors.js";
export async function requireAdmin(request, env) {
  const sid = readSessionId(request);
  const session = await getSession(env, sid);
  if (!session || !session.adminId) throw new AuthenticationError();
  return session;
}
export async function optionalAdmin(request, env) {
  try { return await requireAdmin(request, env); } catch { return null; }
}
