export async function handleIpEcho(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const country = request.headers.get("CF-IPCountry") || "";
  return new Response(JSON.stringify({ ip, country }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleLatency(request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("host") || "1.1.1.1";
  if (!/^[a-zA-Z0-9.-]+$/.test(target)) {
    return new Response(JSON.stringify({ error: "bad host" }), { status: 400 });
  }
  const t0 = Date.now();
  try {
    const sock = await import("cloudflare:sockets");
    const c = sock.connect({ hostname: target, port: 443 });
    const w = c.writable.getWriter();
    await Promise.race([
      w.ready,
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
    ]);
    try { w.releaseLock(); } catch (_) {}
    try { c.close(); } catch (_) {}
    return new Response(JSON.stringify({ host: target, ms: Date.now() - t0, ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ host: target, ms: Date.now() - t0, ok: false, error: e.message || "fail" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
