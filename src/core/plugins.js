const registry = [];

export function registerPlugin(plugin) {
  if (!plugin || !plugin.name) throw new Error("plugin needs name");
  if (registry.some((p) => p.name === plugin.name)) return;
  registry.push({
    name: String(plugin.name),
    version: plugin.version || "0.0.0",
    description: plugin.description || "",
  });
}

export function listPlugins() {
  return registry.map((p) => ({ name: p.name, version: p.version, description: p.description }));
}

registerPlugin({ name: "core-status", version: "1.0.0", description: "Built-in status helpers" });
registerPlugin({ name: "sub-formats", version: "1.0.0", description: "base64 / clash / sing-box formatters" });
