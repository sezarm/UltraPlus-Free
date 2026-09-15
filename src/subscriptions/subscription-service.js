import { getUserByToken } from "../users/user-service.js";
import { formatSubscription, buildUserinfo } from "./formatter.js";
import { NotFoundError, AuthorizationError } from "../core/errors.js";
import { getNetworkSettings } from "../network/settings.js";
import { getEnabledHosts, selectHostsAsync } from "../network/hosts.js";
import { getRoutingProfile } from "../network/routing.js";
import { getResistancePolicy } from "../network/resistance.js";
import { getMirrorSettings, subscriptionHeaders } from "./failover.js";
import { renderUserPortal, isBrowserRequest } from "./user-portal.js";

export async function resolveSubscription(env, token, host, format) {
  const user = await getUserByToken(env, token);
  if (!user) throw new NotFoundError("Subscription not found");
  if (user.status === "disabled") throw new AuthorizationError("User disabled");
  if (user.expired) throw new AuthorizationError("Subscription expired");
  const st = await getNetworkSettings(env);
  const hosts = await getEnabledHosts(env);
  const selected = await selectHostsAsync(env, hosts, st.selection || "priority", 60);
  const servers = selected.map((h) => h.address);
  const profile = await getRoutingProfile(env);
  const resistance = await getResistancePolicy(env);
  const rules = resistance.id !== "off" ? resistance.clashRules : profile.rules;
  if (resistance.fragment) st.fragment = true;
  if (st.enableTrojan === undefined) st.enableTrojan = true;
  const result = formatSubscription(user, host, format, st, servers, rules);
  const mirrors = await getMirrorSettings(env);
  result.headers = subscriptionHeaders(mirrors, result.contentType, result.count);
  result.headers["Subscription-Userinfo"] = buildUserinfo(user);
  result.headers["Profile-Update-Interval"] = "6";
  result.mirrors = mirrors;
  result.user = user;
  result.links = result.links || [];
  return result;
}

export { isBrowserRequest, renderUserPortal };
