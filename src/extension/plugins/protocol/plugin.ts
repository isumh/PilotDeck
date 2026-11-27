import type { EastYunDeskHooksSettings } from "../../hooks/protocol/settings.js";
import type { PromptContribution } from "../../contributions/PromptContribution.js";
import type { RouterContribution } from "../../contributions/RouterContribution.js";
import type { LoadedPluginCommand } from "../loading/PluginCommandLoader.js";
import type { EastYunDeskPluginManifest } from "./manifest.js";

export type EastYunDeskPluginSourceKind = "builtin" | "global" | "project";

export type EastYunDeskLoadedPlugin = {
  name: string;
  path: string;
  source: EastYunDeskPluginSourceKind;
  manifest: EastYunDeskPluginManifest;
  hooksConfig?: EastYunDeskHooksSettings;
  commands?: LoadedPluginCommand[];
  skills?: LoadedPluginCommand[];
  outputStyles?: LoadedPluginCommand[];
  mcpServers?: Record<string, unknown>;
  lspServers?: Record<string, unknown>;
  /**
   * Programmatic contributions are currently only available to builtin or
   * test-injected plugins. Disk-loaded JSON plugins cannot provide functions.
   */
  promptContributions?: PromptContribution[];
  routerContributions?: RouterContribution[];
};
