import { getUserByToken } from "../users/user-service.js";
import { formatSubscription } from "./formatter.js";
import { NotFoundError, AuthorizationError } from "../core/errors.js";
import { getNetworkSettings } from "../network/settings.js";
import { getEnabledHosts, selectHosts } from "../network/hosts.js";
import { getRoutingProfile } from "../network/routing.js";

export async function resolveSubscription(env, token, host, format) {
  const user = await getUserByToken(env, token);
  if (!user) throw new NotFoundError("Subscription not found");
  if (user.status === "disabled") throw new AuthorizationError("User disabled");
  if (user.expired) throw new AuthorizationError("Subscription expired");
  const st = await getNetworkSettings(env);
  const hosts = await getEnabledHosts(env);
  const selected = selectHosts(hosts, st.selection || "priority", 60);
  const servers = selected.map((h) => h.address);
  const profile = await getRoutingProfile(env);
  return formatSubscription(user, host, format, st, servers, profile.rules);
}
