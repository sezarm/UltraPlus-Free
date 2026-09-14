export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=utf-8", "Cache-Control": "no-store", ...extraHeaders },
  });
}
export function html(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "no-store", ...extraHeaders },
  });
}
export function text(body, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/plain;charset=utf-8" } });
}
export function redirect(location, status = 302, extraHeaders = {}) {
  return new Response(null, { status, headers: { Location: location, ...extraHeaders } });
}
export function ok(data) { return json({ success: true, data }); }
export function fail(code, message, status = 400) {
  return json({ success: false, error: { code, message } }, status);
}
