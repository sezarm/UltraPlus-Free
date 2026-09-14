import { getNetworkSettings } from "./settings.js";

export async function handleDoh(request, env) {
  const st = await getNetworkSettings(env);
  const up = st.dohUpstream || "https://1.1.1.1/dns-query";
  const url = new URL(request.url);
  let body;
  if (request.method === "GET") {
    const dns = url.searchParams.get("dns");
    if (!dns) return new Response("missing dns", { status: 400 });
    body = Uint8Array.from(atob(dns.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  } else {
    body = new Uint8Array(await request.arrayBuffer());
  }
  const r = await fetch(up, {
    method: "POST",
    headers: { "Content-Type": "application/dns-message", Accept: "application/dns-message" },
    body,
  });
  return new Response(await r.arrayBuffer(), {
    status: r.status,
    headers: { "Content-Type": "application/dns-message", "Access-Control-Allow-Origin": "*" },
  });
}
