import { listUsers, createUser, setUserStatus, deleteUser, userStats } from "../users/user-service.js";
import { getProxyStats } from "../protocols/session.js";
import { APP_VERSION } from "../core/constants.js";

function helpText() {
  return `<b>UltraPlus-Free Bot</b>
/start — welcome
/status — system
/users — list users
/adduser Name [days] [gb]
/disable &lt;id&gt;
/enable &lt;id&gt;
/delete &lt;id&gt;
/stats
/help`;
}

export async function handleCommand(env, text, chatId, host) {
  const parts = (text || "").trim().split(/\s+/);
  const cmd = (parts[0] || "").split("@")[0].toLowerCase();
  if (cmd === "/start" || cmd === "/help") return helpText();
  if (cmd === "/status") {
    const st = await userStats(env);
    const px = getProxyStats();
    return `<b>Status</b> v${APP_VERSION}
Users: ${st.total} (active ${st.active})
Proxy OK: ${px.ok} | fail: ${px.fail} | active WS: ${px.active}`;
  }
  if (cmd === "/stats") {
    const st = await userStats(env);
    return `total=${st.total} active=${st.active} disabled=${st.disabled} expired=${st.expired}`;
  }
  if (cmd === "/users") {
    const users = await listUsers(env, {});
    if (!users.length) return "No users";
    return users.slice(0, 30).map((u) => `• <code>${u.id.slice(0, 8)}</code> ${u.displayName} [${u.status}]`).join("\n");
  }
  if (cmd === "/adduser") {
    const u = await createUser(env, { displayName: parts[1] || "user", days: parts[2] || "0", quotaGb: parts[3] || "0" });
    const sub = host ? `https://${host}/sub/${u.token}` : u.token;
    return `Created <b>${u.displayName}</b>
UUID: <code>${u.uuid}</code>
Sub: ${sub}`;
  }
  if (cmd === "/disable" && parts[1]) { await setUserStatus(env, parts[1], "disabled"); return "disabled"; }
  if (cmd === "/enable" && parts[1]) { await setUserStatus(env, parts[1], "active"); return "enabled"; }
  if (cmd === "/delete" && parts[1]) { await deleteUser(env, parts[1]); return "deleted"; }
  return "Unknown. /help";
}
