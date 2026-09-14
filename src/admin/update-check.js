import { APP_VERSION } from "../core/constants.js";

const DEFAULT_URL = "https://raw.githubusercontent.com/sezarm/UltraPlus-Free/main/version.json";

export function parseVersion(v) {
  const m = String(v || "0").replace(/^v/, "").split("-")[0].split(".").map((x) => parseInt(x, 10) || 0);
  while (m.length < 3) m.push(0);
  return m;
}

export function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

export async function checkForUpdate(env) {
  const url = (env && env.UPDATE_CHECK_URL) || DEFAULT_URL;
  try {
    const r = await fetch(url, { cf: { cacheTtl: 300 } });
    if (!r.ok) return { ok: false, error: "fetch " + r.status, current: APP_VERSION };
    const data = await r.json();
    const remote = data.version || data.tag_name || "";
    return {
      ok: true,
      current: APP_VERSION,
      remote,
      updateAvailable: compareVersions(remote, APP_VERSION) > 0,
      channel: data.channel || "stable",
      notes: data.notes || "",
      url: "https://github.com/sezarm/UltraPlus-Free",
    };
  } catch (e) {
    return { ok: false, error: e.message || "error", current: APP_VERSION };
  }
}
