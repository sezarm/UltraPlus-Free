import { kvGetJson, kvPutJson } from "../storage/kv.js";

export const PROFILES = {
  default: { id: "default", name: "Default", rules: ["GEOIP,IR,DIRECT", "DOMAIN-SUFFIX,ir,DIRECT", "MATCH,PROXY"] },
  privacy: {
    id: "privacy",
    name: "Privacy",
    rules: ["DOMAIN-KEYWORD,adservice,REJECT", "DOMAIN-SUFFIX,doubleclick.net,REJECT", "GEOIP,IR,DIRECT", "MATCH,PROXY"],
  },
  performance: {
    id: "performance",
    name: "Performance",
    rules: ["GEOIP,IR,DIRECT", "IP-CIDR,10.0.0.0/8,DIRECT", "MATCH,PROXY"],
  },
};

export async function getRoutingProfile(env) {
  const id = (await kvGetJson(env, "routing_profile", "default")) || "default";
  return PROFILES[id] || PROFILES.default;
}

export async function setRoutingProfile(env, id) {
  if (!PROFILES[id]) throw new Error("unknown profile");
  await kvPutJson(env, "routing_profile", id);
  return PROFILES[id];
}

export function listRoutingProfiles() {
  return Object.values(PROFILES);
}
