export async function tgSend(token, method, body) {
  if (!token) throw new Error("no bot token");
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!data.ok) throw new Error(data.description || "telegram api error");
  return data.result;
}

export async function sendMessage(token, chatId, text, extra = {}) {
  return tgSend(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}
