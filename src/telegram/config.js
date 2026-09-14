import { kvGetJson, kvPutJson } from "../storage/kv.js";

const DEFAULT = { enabled: false, botToken: "", adminIds: [] };

export async function getTelegramConfig(env) {
  const stored = await kvGetJson(env, "telegram_config", null);
  const cfg = Object.assign({}, DEFAULT, stored || {});
  if (env.TELEGRAM_BOT_TOKEN) cfg.botToken = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_ADMIN_IDS) {
    cfg.adminIds = String(env.TELEGRAM_ADMIN_IDS).split(",").map((s) => s.trim()).filter(Boolean);
  }
  return cfg;
}

export async function saveTelegramConfig(env, patch) {
  const cur = await getTelegramConfig(env);
  const next = {
    enabled: patch.enabled !== undefined ? !!patch.enabled : cur.enabled,
    botToken: patch.botToken != null ? String(patch.botToken).trim() : cur.botToken,
    adminIds: Array.isArray(patch.adminIds)
      ? patch.adminIds.map(String)
      : typeof patch.adminIds === "string"
        ? patch.adminIds.split(/[\s,]+/).filter(Boolean)
        : cur.adminIds,
  };
  await kvPutJson(env, "telegram_config", next);
  return next;
}

export function isTelegramAdmin(cfg, fromId) {
  if (!fromId) return false;
  const id = String(fromId);
  return (cfg.adminIds || []).some((x) => String(x) === id);
}
