import type {
  EastYunDeskToolAvailability,
  EastYunDeskToolAvailabilityContext,
  EastYunDeskToolDefinition,
} from "../protocol/types.js";
import { ToolRegistry, type ToolUnavailableDiagnostic } from "./ToolRegistry.js";

export type EastYunDeskUnavailableToolDiagnostic = {
  toolName: string;
  code: Exclude<EastYunDeskToolAvailability, { ok: true }>["code"];
  reason: string;
};

export type FilterAvailableToolsResult = {
  registry: ToolRegistry;
  unavailable: EastYunDeskUnavailableToolDiagnostic[];
};

export async function filterAvailableTools(
  registry: ToolRegistry,
  context: EastYunDeskToolAvailabilityContext,
): Promise<FilterAvailableToolsResult> {
  const filtered = new ToolRegistry();
  const unavailable: EastYunDeskUnavailableToolDiagnostic[] = [];
  for (const { diagnostic, aliases } of registry.listUnavailableEntries()) {
    filtered.markUnavailable(diagnostic, aliases);
    unavailable.push(diagnostic);
  }
  const checkCache = new Map<
    NonNullable<EastYunDeskToolDefinition["checkAvailability"]>,
    Promise<EastYunDeskToolAvailability>
  >();

  for (const tool of registry.list()) {
    const availability = await resolveToolAvailability(tool, context, checkCache);
    if (availability.ok) {
      filtered.register(tool);
      continue;
    }

    const diagnostic: EastYunDeskUnavailableToolDiagnostic = {
      toolName: tool.name,
      code: availability.code,
      reason: availability.reason,
    };
    unavailable.push(diagnostic);
    const marked: ToolUnavailableDiagnostic = diagnostic;
    filtered.markUnavailable(marked, tool.aliases);
  }

  return { registry: filtered, unavailable };
}

async function resolveToolAvailability(
  tool: EastYunDeskToolDefinition,
  context: EastYunDeskToolAvailabilityContext,
  cache: Map<NonNullable<EastYunDeskToolDefinition["checkAvailability"]>, Promise<EastYunDeskToolAvailability>>,
): Promise<EastYunDeskToolAvailability> {
  const check = tool.checkAvailability;
  if (!check) {
    return { ok: true };
  }

  let promise = cache.get(check);
  if (!promise) {
    promise = Promise.resolve()
      .then(() => check(context))
      .catch((error): EastYunDeskToolAvailability => ({
        ok: false,
        code: "failed_check",
        reason: error instanceof Error ? error.message : String(error),
      }));
    cache.set(check, promise);
  }

  return promise;
}
