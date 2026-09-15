export function isBrowserRequest(request) {
  const ua = (request.headers.get("User-Agent") || "").toLowerCase();
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  const format = new URL(request.url).searchParams.get("format");
  if (format) return false;
  if (/clash|sing-box|v2ray|xray|hiddify|stash|quantumult|surge|loon|nekobox|shadowrocket|streisand/i.test(ua)) return false;
  if (accept.includes("text/html")) return true;
  if (ua.includes("mozilla") || ua.includes("mobile") || ua.includes("safari")) return true;
  return false;
}

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function renderUserPortal({ user, host, token, links, lang }) {
  const fa = lang !== "en";
  const base = `https://${host}/sub/${token}`;
  const formats = [
    { id: "base64", label: "Base64 / Auto", url: base },
    { id: "clash", label: "Clash / Meta", url: base + "?format=clash" },
    { id: "singbox", label: "Sing-box", url: base + "?format=singbox" },
    { id: "surge", label: "Surge", url: base + "?format=surge" },
    { id: "raw", label: "Raw links", url: base + "?format=raw" },
  ];
  const doh = `https://${host}/dns-query`;
  const quota = user.quotaTotal > 0
    ? `${Math.round((user.quotaUsed || 0) / 1048576)} / ${Math.round(user.quotaTotal / 1048576)} MB`
    : fa ? "نامحدود" : "Unlimited";
  const exp = user.expiresAt || (fa ? "بدون انقضا" : "No expiry");
  const first = (links && links[0]) || "";
  const listPreview = (links || []).slice(0, 8).map((l) =>
    `<code style="display:block;font-size:11px;word-break:break-all;margin:.25rem 0">${esc(l)}</code>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="${fa ? "fa" : "en"}" dir="${fa ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fa ? "اشتراک من" : "My subscription"}</title>
<style>
:root{--bg:#0b1220;--card:#151e32;--t:#e8eefc;--m:#8b9bb8;--a:#3b82f6;--s:#22c55e}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Tahoma,sans-serif;background:var(--bg);color:var(--t);padding:1rem}
.wrap{max-width:560px;margin:0 auto}h1{font-size:1.25rem}.card{background:var(--card);border-radius:.75rem;padding:1rem;margin:0 0 .75rem}
.muted{color:var(--m);font-size:.85rem}.btn{display:inline-block;background:var(--a);color:#fff;border:none;border-radius:.5rem;padding:.55rem .9rem;margin:.25rem;text-decoration:none;font-size:.9rem;cursor:pointer}
.btn.s{background:var(--s);color:#042}.row{display:flex;flex-wrap:wrap;gap:.35rem}
input{width:100%;padding:.5rem;border-radius:.4rem;border:1px solid #243049;background:#0b1220;color:var(--t);margin:.35rem 0}
</style></head><body><div class="wrap">
<h1>${fa ? "صفحه اشتراک شما" : "Your subscription"}</h1>
<p class="muted">${fa ? "لینک را فقط خودتان نگه دارید. مرورگر=این صفحه؛ اپ=کانفیگ." : "Private link. Browser=this page; app=config."}</p>
<div class="card">
<div class="muted">${fa ? "کاربر" : "User"}: <strong>${esc(user.username || user.displayName || "user")}</strong></div>
<div class="muted">${fa ? "حجم" : "Quota"}: ${esc(quota)}</div>
<div class="muted">${fa ? "انقضا" : "Expiry"}: ${esc(String(exp))}</div>
<div class="muted">${fa ? "تعداد کانفیگ" : "Configs"}: ${(links || []).length}</div>
</div>
<div class="card">
<h2 style="font-size:1rem">${fa ? "لینک اشتراک" : "Subscription link"}</h2>
<input id="sub" readonly value="${esc(base)}" onclick="this.select()">
<div class="row">
<button class="btn" type="button" onclick="navigator.clipboard.writeText(document.getElementById('sub').value)">${fa ? "کپی لینک" : "Copy"}</button>
<a class="btn s" href="${esc(base)}">${fa ? "Base64" : "Base64"}</a>
</div></div>
<div class="card">
<h2 style="font-size:1rem">${fa ? "فرمت‌های کلاینت" : "Formats"}</h2>
<div class="row">${formats.map((f) => `<a class="btn" href="${esc(f.url)}">${esc(f.label)}</a>`).join("")}</div>
</div>
<div class="card">
<h2 style="font-size:1rem">DoH</h2>
<input readonly value="${esc(doh)}" onclick="this.select()">
</div>
<div class="card">
<h2 style="font-size:1rem">${fa ? "نمونه نودها" : "Sample nodes"}</h2>
${listPreview}
${first ? `<button class="btn" type="button" onclick='navigator.clipboard.writeText(${JSON.stringify(first)})'>${fa ? "کپی اولین" : "Copy first"}</button>` : ""}
</div>
<p class="muted" style="text-align:center;font-size:.75rem">UltraPlus-Free</p>
</div></body></html>`;
}
