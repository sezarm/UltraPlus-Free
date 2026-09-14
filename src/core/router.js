export function matchRoute(method, pathname, routes) {
  for (const r of routes) {
    if (r.method !== method && r.method !== "ALL") continue;
    const params = matchPath(r.path, pathname);
    if (params !== null) return { handler: r.handler, params };
  }
  return null;
}
function matchPath(pattern, pathname) {
  if (pattern === pathname) return {};
  const pp = pattern.split("/").filter(Boolean);
  const ap = pathname.split("/").filter(Boolean);
  if (pp.length !== ap.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
    else if (pp[i] !== ap[i]) return null;
  }
  return params;
}
