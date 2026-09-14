import { APP_VERSION, APP_NAME } from "../core/constants.js";
import { hasD1 } from "../database/d1.js";
import { isSetupDone } from "../storage/kv.js";
import { getNetworkSettings } from "../network/settings.js";
import { listHosts } from "../network/hosts.js";
import { getTelegramConfig } from "../telegram/config.js";
import { getProxyStats } from "../protocols/session.js";
import { userStats } from "../users/user-service.js";

export async function runDiagnostics(env) {
  const checks = [];
  const push = (name, ok, detail) => checks.push({ name, ok: !!ok, detail: detail || "" });
  push("Worker", true, APP_VERSION);
  push("KV", !!env.ULTRA_KV, env.ULTRA_KV ? "bound" : "missing ULTRA_KV");
  push("D1", hasD1(env), hasD1(env) ? "bound" : "missing DB");
  push("Setup", await isSetupDone(env), "");
  try {
    const st = await getNetworkSettings(env);
    push("Network settings", true, `path=${st.path} vless=${st.enableVless} trojan=${st.enableTrojan}`);
  } catch (e) { push("Network settings", false, e.message); }
  try {
    const hosts = await listHosts(env);
    push("Host pool", hosts.length > 0, `${hosts.length} hosts`);
  } catch (e) { push("Host pool", false, e.message); }
  try {
    const tg = await getTelegramConfig(env);
    push("Telegram", true, `enabled=${tg.enabled} admins=${(tg.adminIds || []).length}`);
  } catch (e) { push("Telegram", false, e.message); }
  try {
    const us = await userStats(env);
    push("Users", true, JSON.stringify(us));
  } catch (e) { push("Users", false, e.message); }
  push("Proxy stats", true, JSON.stringify(getProxyStats()));
  return {
    name: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    healthy: checks.every((c) => c.ok),
    checks,
  };
}
