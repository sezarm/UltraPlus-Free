import { getTelegramConfig, isTelegramAdmin } from "./config.js";
import { sendMessage } from "./api.js";
import { handleCommand } from "./commands.js";

export async function handleTelegramWebhook(request, env) {
  const cfg = await getTelegramConfig(env);
  if (!cfg.enabled || !cfg.botToken) return new Response("telegram disabled", { status: 503 });
  let update;
  try { update = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
  const msg = update.message || update.edited_message;
  if (!msg || !msg.text) return new Response("ok");
  const fromId = msg.from && msg.from.id;
  const chatId = msg.chat && msg.chat.id;
  if (!isTelegramAdmin(cfg, fromId)) {
    try { await sendMessage(cfg.botToken, chatId, "Unauthorized"); } catch (_) {}
    return new Response("ok");
  }
  const host = new URL(request.url).hostname;
  try {
    const reply = await handleCommand(env, msg.text, chatId, host);
    await sendMessage(cfg.botToken, chatId, reply);
  } catch (e) {
    try { await sendMessage(cfg.botToken, chatId, "Error: " + (e.message || "fail")); } catch (_) {}
  }
  return new Response("ok");
}
