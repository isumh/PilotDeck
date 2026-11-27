import { existsSync, realpathSync } from "node:fs";
import { dirname, resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { EastYunDeskMcpServerSpec } from "../protocol/types.js";

export const EASTYUNDESK_PROJECT_ROOT_MARKER = "__EASTYUNDESK_PROJECT_ROOT__";
export const EASTYUNDESK_NODE_EXECUTABLE_MARKER = "__EASTYUNDESK_NODE_EXECUTABLE__";
export const EASTYUNDESK_FUNASR_MCP_ENTRYPOINT_MARKER = "__EASTYUNDESK_FUNASR_MCP_ENTRYPOINT__";
export const EASTYUNDESK_FUNASR_RUNTIME_ROOT_MARKER = "__EASTYUNDESK_FUNASR_RUNTIME_ROOT__";
export const EASTYUNDESK_FUNASR_INSTALL_COMMAND_MARKER = "__EASTYUNDESK_FUNASR_INSTALL_COMMAND__";
export const EASTYUNDESK_PLAYWRIGHT_MCP_ENTRYPOINT_MARKER = "__EASTYUNDESK_PLAYWRIGHT_MCP_ENTRYPOINT__";

const MODULE_DIR = (() => {
  try { return resolve(fileURLToPath(import.meta.url), ".."); } catch { return resolve(process.cwd()); }
})();

function findPackageRoot(start: string): string {
  let current = resolve(start);
  while (true) {
    if (existsSync(join(current, "package.json")) && existsSync(join(current, "scripts", "install-asr.mjs"))) return current;
    const parent = dirname(current);
    if (parent === current) return resolve(start);
    current = parent;
  }
}

export function getEastYunDeskInstallCommand(): string {
  const packageRoot = findPackageRoot(MODULE_DIR);
  // Desktop packages ship Node and this installer, but deliberately omit npm.
  const desktopRoot = process.env.EASTYUNDESK_RUNTIME_ROOT;
  // Native realpath expands Windows 8.3 names (e.g. RUNNER~1), unlike the
  // JS sync fallback. relative() also handles Windows casing differences.
  if (desktopRoot && existsSync(desktopRoot) && relative(realpathSync.native(desktopRoot), realpathSync.native(packageRoot)) === "") {
    // The desktop Bash tool uses POSIX quoting, including its bundled Git Bash.
    const quote = (value: string) => `'${value.replaceAll("'", "'\"'\"'")}'`;
    return `${quote(process.execPath)} ${quote(join(packageRoot, "scripts", "install-asr.mjs"))}`;
  }
  return `npm --prefix "${packageRoot}" run install:asr`;
}

function funasrEntrypoint(): string {
  // This relative path is identical in source and in dist, where built-in
  // plugin files are copied next to the compiled extension modules.
  return resolve(MODULE_DIR, "../../extension/plugins/builtin/funasr/funasr-local-mcp.mjs");
}

function playwrightMcpEntrypoint(): string {
  const candidates = [
    process.env.EASTYUNDESK_RUNTIME_ROOT
      ? resolve(process.env.EASTYUNDESK_RUNTIME_ROOT, "node_modules", "@playwright", "mcp", "cli.js")
      : "",
    resolve(MODULE_DIR, "../../../node_modules/@playwright/mcp/cli.js"),
    resolve(MODULE_DIR, "../../../../node_modules/@playwright/mcp/cli.js"),
    resolve(process.cwd(), "node_modules/@playwright/mcp/cli.js"),
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

/** Resolve placeholders used only by the built-in project-scoped FunASR MCP. */
export function patchProjectScopedMcpSpec(
  spec: EastYunDeskMcpServerSpec,
  projectRoot: string,
  eastyunHome: string,
): EastYunDeskMcpServerSpec {
  if (spec.transport !== "stdio") return spec;

  if (spec.id === "browser-use") {
    const replaceBrowserMarkers = (value: string) => value
      .replaceAll(EASTYUNDESK_NODE_EXECUTABLE_MARKER, process.execPath)
      .replaceAll(EASTYUNDESK_PLAYWRIGHT_MCP_ENTRYPOINT_MARKER, playwrightMcpEntrypoint());
    return {
      ...spec,
      command: replaceBrowserMarkers(spec.command),
      cwd: resolve(projectRoot),
      args: spec.args?.map(replaceBrowserMarkers),
    };
  }

  if (spec.id !== "funasr") return spec;

  const replacements: Record<string, string> = {
    [EASTYUNDESK_PROJECT_ROOT_MARKER]: resolve(projectRoot),
    [EASTYUNDESK_NODE_EXECUTABLE_MARKER]: process.execPath,
    [EASTYUNDESK_FUNASR_MCP_ENTRYPOINT_MARKER]: funasrEntrypoint(),
    [EASTYUNDESK_FUNASR_RUNTIME_ROOT_MARKER]: join(resolve(eastyunHome), "funasr"),
    [EASTYUNDESK_FUNASR_INSTALL_COMMAND_MARKER]: getEastYunDeskInstallCommand(),
  };
  const replaceMarkers = (value: string) => Object.entries(replacements)
    .reduce((out, [marker, replacement]) => out.replaceAll(marker, replacement), value);

  return {
    ...spec,
    command: replaceMarkers(spec.command),
    cwd: resolve(projectRoot),
    args: spec.args?.map(replaceMarkers),
  };
}
