export function now() {
  return Date.now();
}

export function daysFromNow(days) {
  return Date.now() + days * 86400000;
}

export function formatDate(ts, lang = "en") {
  if (!ts) return lang === "fa" ? "بدون انقضا" : "Never";
  try {
    return new Date(ts).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-GB");
  } catch {
    return String(ts);
  }
}

export function isExpired(expiresAt) {
  return !!(expiresAt && expiresAt > 0 && Date.now() > expiresAt);
}
