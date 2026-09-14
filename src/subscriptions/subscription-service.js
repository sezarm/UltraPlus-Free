import { getUserByToken } from "../users/user-service.js";
import { formatSubscription } from "./formatter.js";
import { NotFoundError, AuthorizationError } from "../core/errors.js";

export async function resolveSubscription(env, token, host, format) {
  const user = await getUserByToken(env, token);
  if (!user) throw new NotFoundError("Subscription not found");
  if (user.status === "disabled") throw new AuthorizationError("User disabled");
  if (user.expired) throw new AuthorizationError("Subscription expired");
  return formatSubscription(user, host, format, "/");
}
