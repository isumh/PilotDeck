import type { EastYunDeskLoadedPlugin } from "../protocol/plugin.js";

export function discoverBuiltinPlugins(plugins: EastYunDeskLoadedPlugin[] = []): EastYunDeskLoadedPlugin[] {
  return plugins.filter((plugin) => plugin.source === "builtin");
}
