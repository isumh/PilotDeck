import type { EastYunDeskHooksSettings } from "../../hooks/protocol/settings.js";

export type EastYunDeskPluginManifest = {
  name: string;
  version?: string;
  description?: string;
  commands?: string | string[];
  agents?: string | string[];
  skills?: string | string[];
  hooks?: string | EastYunDeskHooksSettings;
  mcpServers?: Record<string, unknown>;
  lspServers?: Record<string, unknown>;
  outputStyles?: string | string[];
  marketplace?: EastYunDeskMarketplaceReference;
  mcpb?: string;
  settings?: Record<string, unknown>;
};

export type EastYunDeskMarketplaceReference = {
  name: string;
  plugin: string;
  version?: string;
  source?: "marketplace" | "git" | "zip" | "mcpb";
  url?: string;
};
