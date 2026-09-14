import { kvGetJson, kvPutJson } from "../storage/kv.js";
import { saveNetworkSettings } from "./settings.js";

export const RESISTANCE_PRESETS = {
  off: { id: "off", name: "Off", fragment: false, selection: "priority", clashRules: ["GEOIP,IR,DIRECT", "DOMAIN-SUFFIX,ir,DIRECT", "MATCH,PROXY"] },
  domestic: { id: "domestic", name: "Domestic Bypass", fragment: false, selection: "priority", clashRules: ["GEOIP,IR,DIRECT", "DOMAIN-SUFFIX,ir,DIRECT", "IP-CIDR,10.0.0.0/8,DIRECT", "IP-CIDR,192.168.0.0/16,DIRECT", "MATCH,PROXY"] },
  fragment: { id: "fragment", name: "Fragment Mode", fragment: true, selection: "random", clashRules: ["GEOIP,IR,DIRECT", "MATCH,PROXY"] },
  privacy: { id: "privacy", name: "Privacy + Ads block", fragment: false, selection: "priority", clashRules: ["DOMAIN-KEYWORD,adservice,REJECT", "DOMAIN-SUFFIX,doubleclick.net,REJECT", "DOMAIN-SUFFIX,googleadservices.com,REJECT", "GEOIP,IR,DIRECT", "MATCH,PROXY"] },
  balanced: { id: "balanced", name: "Balanced Resistance", fragment: true, selection: "priority", clashRules: ["GEOIP,IR,DIRECT", "DOMAIN-SUFFIX,ir,DIRECT", "DOMAIN-KEYWORD,adservice,REJECT", "MATCH,PROXY"] },
};

export async function getResistancePolicy(env) {
  const id = (await kvGetJson(env, "resistance_policy", "off")) || "off";
  return RESISTANCE_PRESETS[id] || RESISTANCE_PRESETS.off;
}

export async function setResistancePolicy(env, id) {
  const p = RESISTANCE_PRESETS[id];
  if (!p) throw new Error("unknown policy");
  await kvPutJson(env, "resistance_policy", id);
  await saveNetworkSettings(env, { fragment: p.fragment, selection: p.selection });
  return p;
}

export function listResistancePolicies() {
  return Object.values(RESISTANCE_PRESETS);
}
