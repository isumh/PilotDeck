export {
  EASTYUNDESK_HOOK_EVENTS,
  EASTYUNDESK_NOT_APPLICABLE_LEGACY_HOOK_EVENTS,
  isEastYunDeskHookEvent,
  type EastYunDeskHookEvent,
  type EastYunDeskNotApplicableLegacyHookEvent,
} from "./hooks/protocol/events.js";
export type { EastYunDeskHookBaseInput, EastYunDeskHookInput } from "./hooks/protocol/input.js";
export { createHookInput, toLegacyHookInput } from "./hooks/protocol/input.js";
export type {
  EastYunDeskHookAsyncOutput,
  EastYunDeskHookOutput,
  EastYunDeskHookSpecificOutput,
  EastYunDeskHookSyncOutput,
  EastYunDeskPermissionHookDecision,
} from "./hooks/protocol/output.js";
export type { EastYunDeskHookCommand, EastYunDeskHookMatcher, EastYunDeskHooksSettings } from "./hooks/protocol/settings.js";
export { parseHooksConfig, type ParseHooksConfigResult } from "./hooks/config/parseHooksConfig.js";
export { matchHookMatcher } from "./hooks/config/matchHook.js";
export { matchHookCondition } from "./hooks/config/matchHookCondition.js";
export { parseHookOutput } from "./hooks/execution/parseHookOutput.js";
export {
  CommandHookExecutor,
  EASTYUNDESK_HOOK_TIMEOUT_MS,
  EASTYUNDESK_SESSION_END_HOOK_TIMEOUT_MS,
  type CommandHookExecutionOptions,
  type CommandHookExecutionResult,
} from "./hooks/execution/CommandHookExecutor.js";
export { PromptHookExecutor, type PromptHookEvaluator } from "./hooks/execution/PromptHookExecutor.js";
export { HttpHookExecutor, type HttpHookFetch } from "./hooks/execution/HttpHookExecutor.js";
export { AgentHookExecutor, type AgentHookRunner } from "./hooks/execution/AgentHookExecutor.js";
export { CallbackHookExecutor, type CallbackHookHandler } from "./hooks/execution/CallbackHookExecutor.js";
export { HookRuntime, type HookRuntimeRunInput, type HookRuntimeRunResult } from "./hooks/execution/HookRuntime.js";
export { AsyncHookRegistry, type AsyncHookResponse, type PendingAsyncHook } from "./hooks/execution/AsyncHookRegistry.js";
export { HookExecutionEventBus, type EastYunDeskHookExecutionEvent } from "./hooks/events/HookExecutionEventBus.js";

export type { EastYunDeskPluginManifest } from "./plugins/protocol/manifest.js";
export type { EastYunDeskMarketplaceReference } from "./plugins/protocol/manifest.js";
export type { EastYunDeskLoadedPlugin, EastYunDeskPluginSourceKind } from "./plugins/protocol/plugin.js";
export { resolveMarketplaceReference, type EastYunDeskMarketplaceResolution, type EastYunDeskPluginMarketplaceStatus } from "./plugins/protocol/marketplace.js";
export { parsePluginManifest } from "./plugins/config/parsePluginManifest.js";
export { validateMarketplaceName } from "./plugins/config/validateMarketplaceName.js";
export { validatePluginSourcePath } from "./plugins/config/validatePluginSource.js";
export { resolvePluginDirectories } from "./plugins/discovery/PluginDirectoryResolver.js";
export { discoverPluginPaths, type DiscoveredPluginPath } from "./plugins/discovery/discoverLocalPlugins.js";
export { discoverBuiltinPlugins } from "./plugins/discovery/discoverBuiltinPlugins.js";
export { loadPluginFromPath } from "./plugins/loading/PluginLoader.js";
export { loadPluginHooks } from "./plugins/loading/PluginHookLoader.js";
export { getPluginCommandName, loadPluginCommands, type LoadedPluginCommand } from "./plugins/loading/PluginCommandLoader.js";
export {
  PluginRuntime,
  type PluginRuntimeOptions,
  type PluginRefreshResult,
  type EastYunDeskMcpInstructionEntry,
  type EastYunDeskMcpServerStaticSpec,
} from "./plugins/runtime/PluginRuntime.js";
export {
  MAX_MCP_INSTRUCTION_LENGTH,
  truncateMcpInstructionString,
} from "./plugins/runtime/truncateMcpString.js";
export { PluginRegistry } from "./plugins/runtime/PluginRegistry.js";
export { defaultPluginReloadPolicy, type PluginReloadPolicy } from "./plugins/runtime/PluginReloadPolicy.js";

export type { CommandContribution } from "./contributions/CommandContribution.js";
export type { HookContribution } from "./contributions/HookContribution.js";
export type { ToolContribution } from "./contributions/ToolContribution.js";
export type { PromptContribution } from "./contributions/PromptContribution.js";
export type { PluginPromptContributions, PluginCommandContribution, PluginSkillContribution, PluginMcpInstruction } from "./plugins/protocol/promptContributions.js";
export type { McpContribution } from "./contributions/McpContribution.js";
export type { PermissionRuleContribution } from "./contributions/PermissionRuleContribution.js";
export type { RouterContribution } from "./contributions/RouterContribution.js";
