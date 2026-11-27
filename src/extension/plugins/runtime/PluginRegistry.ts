import type { EastYunDeskLoadedPlugin } from "../protocol/plugin.js";

export class PluginRegistry {
  private readonly plugins = new Map<string, EastYunDeskLoadedPlugin>();

  replaceAll(plugins: EastYunDeskLoadedPlugin[]): void {
    this.plugins.clear();
    for (const plugin of plugins) {
      this.plugins.set(`${plugin.name}@${plugin.source}`, plugin);
    }
  }

  list(): EastYunDeskLoadedPlugin[] {
    return [...this.plugins.values()];
  }
}
