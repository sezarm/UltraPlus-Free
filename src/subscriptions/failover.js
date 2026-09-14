import { kvGetJson, kvPutJson } from "../storage/kv.js";

export async function getMirrorSettings(env) {
  return (await kvGetJson(env, "sub_mirrors", null)) || {
    profileWebPageUrl: "",
    supportUrl: "",
    announce: "UltraPlus-Free",
    extraSubPaths: [],
  };
}

export async function saveMirrorSettings(env, patch) {
  const cur = await getMirrorSettings(env);
  const next = {
    profileWebPageUrl: String(patch.profileWebPageUrl ?? cur.profileWebPageUrl).trim(),
    supportUrl: String(patch.supportUrl ?? cur.supportUrl).trim(),
    announce: String(patch.announce ?? cur.announce).trim() || "UltraPlus-Free",
    extraSubPaths: Array.isArray(patch.extraSubPaths)
      ? patch.extraSubPaths
      : typeof patch.extraSubPaths === "string"
        ? patch.extraSubPaths.split("\n").map((s) => s.trim()).filter(Boolean)
        : cur.extraSubPaths,
  };
  await kvPutJson(env, "sub_mirrors", next);
  return next;
}

export function subscriptionHeaders(mirrors, contentType, count) {
  const h = {
    "Content-Type": contentType,
    "Profile-Update-Interval": "12",
    "Cache-Control": "no-store",
    "X-Config-Count": String(count || ""),
  };
  if (mirrors.announce) h["profile-title"] = "base64:" + btoa(unescape(encodeURIComponent(mirrors.announce)));
  if (mirrors.profileWebPageUrl) h["profile-web-page-url"] = mirrors.profileWebPageUrl;
  if (mirrors.supportUrl) h["support-url"] = mirrors.supportUrl;
  return h;
}
