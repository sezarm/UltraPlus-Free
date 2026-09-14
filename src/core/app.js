import { PATHS, APP_VERSION, APP_NAME } from "./constants.js";
import { matchRoute } from "./router.js";
import { withSecurityHeaders } from "./middleware.js";
import { json, text } from "./response.js";
import { toErrorResponse } from "./errors.js";

export function createApp(handlers) {
  const routes = handlers.routes || [];
  return {
    async handle(request, env, ctx) {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method.toUpperCase();
      const requestId = crypto.randomUUID().slice(0, 8);
      try {
        if (path === PATHS.HEALTH || path === "/health" || path === "/status") {
          return withSecurityHeaders(json({
            status: "ok", version: APP_VERSION, name: APP_NAME,
            timestamp: new Date().toISOString(),
          }));
        }
        const hit = matchRoute(method, path, routes);
        if (hit) {
          const res = await hit.handler({ request, env, ctx, url, params: hit.params, requestId });
          return withSecurityHeaders(res);
        }
        if (handlers.fallback) {
          return withSecurityHeaders(await handlers.fallback({ request, env, url, requestId }));
        }
        return withSecurityHeaders(text(`${APP_NAME} ${APP_VERSION}`, 404));
      } catch (err) {
        const body = toErrorResponse(err, requestId);
        return withSecurityHeaders(json(body, err.status || 500));
      }
    },
  };
}
