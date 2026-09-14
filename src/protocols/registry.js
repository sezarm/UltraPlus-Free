import { parseVless } from "./vless.js";
import { parseTrojan } from "./trojan.js";
import { handleProxySession, getProxyStats } from "./session.js";

export const ProtocolRegistry = {
  vless: { parse: parseVless, name: "VLESS" },
  trojan: { parse: parseTrojan, name: "Trojan" },
  handleSession: handleProxySession,
  getStats: getProxyStats,
};
