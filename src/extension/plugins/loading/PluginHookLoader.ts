import type { EastYunDeskHooksSettings } from "../../hooks/protocol/settings.js";
import type { EastYunDeskLoadedPlugin } from "../protocol/plugin.js";

export function loadPluginHooks(plugins: EastYunDeskLoadedPlugin[]): EastYunDeskHooksSettings {
  const settings: EastYunDeskHooksSettings = {};
  for (const plugin of plugins) {
    for (const [event, matchers] of Object.entries(plugin.hooksConfig ?? {}) as Array<
      [keyof EastYunDeskHooksSettings, NonNullable<EastYunDeskHooksSettings[keyof EastYunDeskHooksSettings]>]
    >) {
      settings[event] = [
        ...(settings[event] ?? []),
        ...matchers.map((matcher) => ({
          ...matcher,
          pluginName: plugin.name,
          pluginId: `${plugin.name}@${plugin.source}`,
          pluginRoot: plugin.path,
        })),
      ];
    }
  }
  return settings;
}
