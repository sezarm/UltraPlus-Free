/**
 * UltraPlus-Free – Installer Wizard (host this on YOUR Cloudflare)
 * Deploy once → share https://YOUR-WIZARD.workers.dev
 * Users paste their Account ID + API Token → panel installs on THEIR account.
 * MIT – from scratch (not a copy of BPB Wizard)
 */
const SOURCE_WORKER =
  "https://raw.githubusercontent.com/sezarm/UltraPlus-Free/af92c99406a321d3078f9bedc52cff97265d97be/worker.js";
const SOURCE_FALLBACK =
  "https://raw.githubusercontent.com/sezarm/UltraPlus-Free/af92c99406a321d3078f9bedc52cff97265d97be/worker.js";

function page(lang) {
  const fa = lang === "fa";
  const dir = fa ? "rtl" : "ltr";
  const t = fa
    ? {
        title: "نصب‌کننده UltraPlus-Free",
        h1: "نصب خودکار پنل روی Cloudflare شما",
        sub: "توکن فقط برای همین نصب استفاده می‌شود و ذخیره نمی‌شود.",
        steps:
          "<ol><li>برو به Cloudflare → <b>My Profile → API Tokens → Create Token</b></li>" +
          "<li>قالب <b>Edit Cloudflare Workers</b> (یا Custom: Workers Scripts Edit + KV Edit)</li>" +
          "<li><b>Account ID</b> را از داشبورد کپی کن</li>" +
          "<li>اینجا وارد کن و نصب بزن</li></ol>",
        acc: "Account ID",
        tok: "API Token",
        name: "نام Worker",
        pass: "رمز پنل (ADMIN_PASSWORD)",
        kv: "ساخت KV و اتصال ULTRA_KV",
        btn: "نصب روی حساب من",
        note: "بعد از نصب، توکن را در Cloudflare حذف (Revoke) کن اگر دیگر لازم نیست.",
        foot: "منبع: GitHub UltraPlus-Free · MIT",
      }
    : {
        title: "UltraPlus-Free Installer",
        h1: "Auto-install panel on YOUR Cloudflare",
        sub: "Token is used only for this install and is never stored.",
        steps:
          "<ol><li>Cloudflare → <b>My Profile → API Tokens → Create Token</b></li>" +
          "<li>Template <b>Edit Cloudflare Workers</b> (or Custom: Scripts Edit + KV Edit)</li>" +
          "<li>Copy <b>Account ID</b> from the dashboard</li>" +
          "<li>Paste below and install</li></ol>",
        acc: "Account ID",
        tok: "API Token",
        name: "Worker name",
        pass: "Panel password (ADMIN_PASSWORD)",
        kv: "Create KV and bind ULTRA_KV",
        btn: "Install on my account",
        note: "After install, revoke the token in Cloudflare if you no longer need it.",
        foot: "Source: GitHub UltraPlus-Free · MIT",
      };
  return `<!DOCTYPE html>
<html lang="${fa ? "fa" : "en"}" dir="${dir}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t.title}</title>
<style>
:root{--p:#0ea5e9;--bg:#0f172a;--c:#1e293b;--t:#f1f5f9;--b:#334155;--ok:#10b981;--w:#f59e0b}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh;padding:1.25rem}
.wrap{max-width:640px;margin:0 auto}
.card{background:var(--c);border:1px solid var(--b);border-radius:1rem;padding:1.5rem}
h1{font-size:1.35rem;margin-bottom:.4rem}
.sub{opacity:.8;margin-bottom:1rem;font-size:.95rem}
ol{margin:.75rem 0 1rem 1.2rem;line-height:1.75;font-size:.92rem}
label{display:block;font-size:.85rem;margin:.5rem 0 .25rem;opacity:.9}
input[type=text],input[type=password]{width:100%;padding:.7rem;border-radius:.5rem;border:1px solid var(--b);background:#0f172a;color:var(--t)}
.chk{display:flex;align-items:center;gap:.5rem;margin:1rem 0;font-size:.9rem}
button{width:100%;padding:.9rem;border:0;border-radius:.55rem;background:var(--p);color:#fff;font-weight:700;font-size:1rem;cursor:pointer}
button:disabled{opacity:.55;cursor:wait}
.note{margin-top:1rem;padding:.85rem;background:#0f172a;border-left:4px solid var(--w);border-radius:.5rem;font-size:.85rem;line-height:1.5}
#out{display:none;margin-top:1rem;padding:1rem;background:#020617;border-radius:.5rem;font-family:ui-monospace,monospace;font-size:.78rem;white-space:pre-wrap;max-height:320px;overflow:auto}
.langs{margin-top:1rem;text-align:center}
.langs a{color:var(--p);margin:0 .5rem;text-decoration:none}
.ok a{color:var(--ok)}
footer{margin-top:1.25rem;text-align:center;opacity:.6;font-size:.8rem}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<h1>${t.h1}</h1>
<p class="sub">${t.sub}</p>
${t.steps}
<form id="f">
<label>${t.acc}</label>
<input type="text" name="account_id" required autocomplete="off" placeholder="32-character account id">
<label>${t.tok}</label>
<input type="password" name="api_token" required autocomplete="off">
<label>${t.name}</label>
<input type="text" name="worker_name" value="ultraplus-free" required pattern="[a-z0-9\\-]{1,63}">
<label>${t.pass}</label>
<input type="password" name="admin_password" value="admin" required>
<label class="chk"><input type="checkbox" name="create_kv" checked> ${t.kv}</label>
<button type="submit" id="btn">${t.btn}</button>
</form>
<div class="note">${t.note}</div>
<pre id="out"></pre>
<div class="langs"><a href="?lang=fa">فارسی</a><a href="?lang=en">English</a></div>
</div>
<footer>${t.foot}</footer>
</div>
<script>
document.getElementById("f").onsubmit=async(e)=>{
  e.preventDefault();
  const out=document.getElementById("out");
  const btn=document.getElementById("btn");
  btn.disabled=true; out.style.display="block"; out.textContent="Installing…";
  try{
    const r=await fetch("/install",{method:"POST",body:new FormData(e.target)});
    const j=await r.json();
    out.textContent=JSON.stringify(j,null,2);
    if(j.ok&&j.url){ out.innerHTML="<span class=ok>OK</span>\\n"+out.textContent+"\\n\\n<a href=\\""+j.url+"\\" target=_blank>"+j.url+"</a>"; }
  }catch(err){ out.textContent=String(err); }
  btn.disabled=false;
};
</script>
</body></html>`;
}

async function cfApi(token, method, path, body, asJson) {
  const headers = { Authorization: "Bearer " + token };
  let b = body;
  if (asJson && body != null) {
    headers["Content-Type"] = "application/json";
    b = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch("https://api.cloudflare.com/client/v4" + path, {
    method: method,
    headers: headers,
    body: b,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.success !== false, status: res.status, data };
}

async function fetchScript() {
  for (const url of [SOURCE_WORKER, SOURCE_FALLBACK]) {
    try {
      const r = await fetch(url, { cf: { cacheTtl: 60 } });
      if (r.ok) {
        const text = await r.text();
        if (text.includes("export default") && text.length > 5000) return { ok: true, text, url };
      }
    } catch (e) {}
  }
  return { ok: false, error: "Could not download worker.js from GitHub" };
}

async function install(form) {
  const accountId = ((form.get("account_id") || "") + "").trim();
  const token = ((form.get("api_token") || "") + "").trim();
  let workerName = ((form.get("worker_name") || "ultraplus-free") + "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .slice(0, 63);
  if (!workerName) workerName = "ultraplus-free";
  const adminPass = ((form.get("admin_password") || "admin") + "").trim() || "admin";
  const createKv = form.get("create_kv") === "on" || form.get("create_kv") === "true";
  if (!accountId || accountId.length < 16) return { ok: false, error: "Invalid account_id" };
  if (!token || token.length < 20) return { ok: false, error: "Invalid api_token" };

  const log = [];
  let kvId = null;

  if (createKv) {
    const kv = await cfApi(
      token,
      "POST",
      "/accounts/" + accountId + "/storage/kv/namespaces",
      { title: "ULTRA_KV_" + workerName },
      true
    );
    log.push({ step: "create_kv", ok: kv.ok, errors: kv.data && kv.data.errors });
    if (kv.ok && kv.data && kv.data.result) kvId = kv.data.result.id;
    else return { ok: false, error: "KV create failed – check token (Workers KV Edit)", log, cf: kv.data };
  }

  const script = await fetchScript();
  if (!script.ok) return { ok: false, error: script.error, log };
  log.push({ step: "fetch_script", ok: true, from: script.url, bytes: script.text.length });

  const bindings = [{ type: "secret_text", name: "ADMIN_PASSWORD", text: adminPass }];
  if (kvId) bindings.push({ type: "kv_namespace", name: "ULTRA_KV", namespace_id: kvId });

  const metadata = {
    main_module: "worker.js",
    bindings,
    compatibility_date: "2024-09-23",
  };

  const boundary = "----UltraPlusWizard" + Date.now();
  const body =
    "--" +
    boundary +
    "\r\nContent-Disposition: form-data; name=\"metadata\"; filename=\"metadata.json\"\r\nContent-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    "\r\n--" +
    boundary +
    "\r\nContent-Disposition: form-data; name=\"worker.js\"; filename=\"worker.js\"\r\nContent-Type: application/javascript+module\r\n\r\n" +
    script.text +
    "\r\n--" +
    boundary +
    "--\r\n";

  const up = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/workers/scripts/" + workerName,
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "multipart/form-data; boundary=" + boundary,
      },
      body,
    }
  );
  const upData = await up.json().catch(() => ({}));
  log.push({
    step: "upload_worker",
    ok: up.ok && upData.success !== false,
    status: up.status,
    errors: upData.errors,
  });
  if (!(up.ok && upData.success !== false)) {
    return { ok: false, error: "Worker upload failed – check token (Workers Scripts Edit)", log, cf: upData };
  }

  await cfApi(
    token,
    "POST",
    "/accounts/" + accountId + "/workers/scripts/" + workerName + "/subdomain",
    { enabled: true },
    true
  );

  let workersDev = null;
  const subGet = await cfApi(token, "GET", "/accounts/" + accountId + "/workers/subdomain", null, false);
  if (subGet.ok && subGet.data && subGet.data.result && subGet.data.result.subdomain) {
    workersDev = "https://" + workerName + "." + subGet.data.result.subdomain + ".workers.dev";
  }

  return {
    ok: true,
    worker: workerName,
    kv_id: kvId,
    url: workersDev || "Open Cloudflare Dashboard → Workers → " + workerName,
    admin_path: "/admin",
    note: "Token was NOT stored. Login with the panel password you set.",
    log,
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const lang = url.searchParams.get("lang") === "en" ? "en" : "fa";

    if (url.pathname === "/install" && request.method === "POST") {
      try {
        const form = await request.formData();
        const result = await install(form);
        return Response.json(result, { status: result.ok ? 200 : 400 });
      } catch (e) {
        return Response.json({ ok: false, error: String(e) }, { status: 500 });
      }
    }

    if (url.pathname === "/health") {
      return Response.json({
        status: "ok",
        service: "UltraPlus-Free-Installer-Wizard",
        version: "1.0.0",
        source: SOURCE_WORKER,
      });
    }

    return new Response(page(lang), {
      headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "no-store" },
    });
  },
};
