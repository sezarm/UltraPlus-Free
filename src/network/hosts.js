/**
 * Host pool — CF-style edge addresses for multi-config subscriptions
 */
import { kvGetJson, kvPutJson } from "../storage/kv.js";
import { newId } from "../utils/ids.js";

export const SEED_HOSTS = [
  "104.16.132.229", "104.16.133.229", "104.17.144.22", "104.17.145.22",
  "104.18.2.2", "104.18.3.2", "104.21.32.1", "104.21.48.1",
  "104.24.0.1", "104.24.1.1", "172.67.0.1", "172.67.128.1",
  "162.159.36.1", "162.159.46.1", "188.114.96.1", "188.114.97.1",
  "www.cloudflare.com", "cdnjs.cloudflare.com", "www.visa.com",
  "www.samsung.com", "www.microsoft.com", "1.1.1.1", "1.0.0.1",
];

function mapHost(h) {
  return {
    id: h.id,
    address: h.address,
    label: h.label || h.address,
    enabled: h.enabled !== false,
    priority: h.priority ?? 100,
    notes: h.notes || "",
  };
}

export async function listHosts(env) {
  let list = await kvGetJson(env, "host_pool", null);
  if (!list || !list.length) {
    list = SEED_HOSTS.map((address, i) => ({
      id: newId(),
      address,
      label: address,
      enabled: true,
      priority: i + 1,
      notes: "seed",
    }));
    await kvPutJson(env, "host_pool", list);
  }
  return list.map(mapHost).sort((a, b) => a.priority - b.priority);
}

export async function getEnabledHosts(env) {
  return (await listHosts(env)).filter((h) => h.enabled);
}

export async function addHost(env, { address, label, priority, notes }) {
  const addr = String(address || "").trim();
  if (!addr) throw new Error("address required");
  const list = await listHosts(env);
  if (list.some((h) => h.address === addr)) throw new Error("duplicate host");
  const row = {
    id: newId(),
    address: addr,
    label: String(label || addr).trim(),
    enabled: true,
    priority: parseInt(priority, 10) || list.length + 1,
    notes: String(notes || ""),
  };
  list.push(row);
  await kvPutJson(env, "host_pool", list);
  return mapHost(row);
}

export async function updateHost(env, id, patch) {
  let list = await listHosts(env);
  const idx = list.findIndex((h) => h.id === id);
  if (idx < 0) throw new Error("host not found");
  list[idx] = {
    ...list[idx],
    label: patch.label != null ? String(patch.label) : list[idx].label,
    enabled: patch.enabled !== undefined ? !!patch.enabled : list[idx].enabled,
    priority: patch.priority != null ? parseInt(patch.priority, 10) || list[idx].priority : list[idx].priority,
    notes: patch.notes != null ? String(patch.notes) : list[idx].notes,
  };
  await kvPutJson(env, "host_pool", list);
  return mapHost(list[idx]);
}

export async function deleteHost(env, id) {
  let list = await listHosts(env);
  list = list.filter((h) => h.id !== id);
  await kvPutJson(env, "host_pool", list);
  return true;
}

export async function resetHostPool(env) {
  await kvPutJson(env, "host_pool", null);
  return listHosts(env);
}

export function selectHosts(hosts, strategy, limit = 80) {
  const enabled = hosts.filter((h) => h.enabled);
  if (!enabled.length) return [];
  if (strategy === "random") {
    const shuffled = [...enabled].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }
  return [...enabled].sort((a, b) => a.priority - b.priority).slice(0, limit);
}
