import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expandMcpConfig } from "./expandPlaceholders.js";

export const MCP_CONFIG_FILE_NAME = "mcp.json";

export type LoadMcpServerConfigResult = {
  servers: Record<string, unknown>;
  diagnostics: { path: string; message: string }[];
};

export function getGlobalMcpConfigFilePath(eastyunHome: string): string {
  return resolve(eastyunHome, MCP_CONFIG_FILE_NAME);
}

export function getProjectMcpConfigFilePath(projectRoot: string): string {
  return resolve(projectRoot, ".eastyundesk", MCP_CONFIG_FILE_NAME);
}

export function loadMcpServerConfig(projectRoot: string, eastyunHome: string): LoadMcpServerConfigResult {
  const diagnostics: LoadMcpServerConfigResult["diagnostics"] = [];
  const global = readMcpConfig(getGlobalMcpConfigFilePath(eastyunHome), diagnostics);
  const project = readMcpConfig(getProjectMcpConfigFilePath(projectRoot), diagnostics);
  const managedPath = process.env.EASTYUNDESK_COMPUTER_USE_MCP_CONFIG;
  const managed = managedPath ? readMcpConfig(managedPath, diagnostics) : undefined;
  const servers = { ...(global?.mcpServers ?? {}), ...(project?.mcpServers ?? {}) };
  if (managedPath) {
    delete servers['eastyundesk-computer-use'];
    const driver = managed?.mcpServers?.['eastyundesk-computer-use'];
    if (isRecord(driver)) servers['eastyundesk-computer-use'] = driver;
  }

  return {
    // Only the desktop host controls this reserved server's executable and enable switch.
    servers,
    diagnostics,
  };
}

function readMcpConfig(
  path: string,
  diagnostics: LoadMcpServerConfigResult["diagnostics"],
): { mcpServers?: Record<string, unknown> } | undefined {
  if (!existsSync(path)) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    diagnostics.push({
      path,
      message: error instanceof Error ? error.message : "Invalid JSON",
    });
    return undefined;
  }

  if (!isRecord(parsed)) {
    diagnostics.push({ path, message: "MCP config root must be an object." });
    return undefined;
  }

  const rawServers = parsed.mcpServers;
  if (rawServers === undefined) {
    return {};
  }
  if (!isRecord(rawServers)) {
    diagnostics.push({ path, message: "mcpServers must be an object." });
    return {};
  }

  return { mcpServers: expandMcpConfig(rawServers) as Record<string, unknown> };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
