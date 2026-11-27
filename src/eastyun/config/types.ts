import type { AlwaysOnConfig } from "../../always-on/config/parseAlwaysOnConfig.js";
import type { CronConfig } from "../../cron/config/parseCronConfig.js";
import type { ModelConfig } from "../../model/protocol/canonical.js";
import type { RouterConfig } from "../../router/config/schema.js";

export type EastYunConfigSourceKind = "default" | "project" | "env";
export type EastYunConfigSourcePhase = "bootstrap" | "merge";
export type EastYunConfigDiagnosticSeverity = "info" | "warning" | "error" | "fatal";
export type EastYunConfigChangeClass =
  | "runtime-live"
  | "next-request"
  | "next-runtime"
  | "restart-required"
  | "invalid";

export type EastYunConfigSource = {
  kind: EastYunConfigSourceKind;
  priority: number;
  loadedAt: Date;
  path?: string;
  contentHash?: string;
  phase?: EastYunConfigSourcePhase;
};

export type EastYunConfigDiagnostic = {
  code: string;
  severity: EastYunConfigDiagnosticSeverity;
  message: string;
  path?: string;
  source?: Pick<EastYunConfigSource, "kind" | "path" | "phase">;
  hint?: string;
  redactedValue?: string;
  recoverable?: boolean;
};

export type EastYunRawConfig = {
  schemaVersion?: unknown;
  runtime?: unknown;
  agent?: unknown;
  model?: unknown;
  extension?: unknown;
  memory?: unknown;
  gateway?: unknown;
  adapters?: unknown;
  router?: unknown;
  alwaysOn?: unknown;
  cron?: unknown;
  tools?: unknown;
  telemetry?: unknown;
  proxy?: unknown;
  webui?: unknown;
};

export type EastYunExtensionConfig = {
  builtinPluginsEnabled: Record<string, boolean>;
  includeHookEvents: boolean;
};

export type EastYunAgentModelSelection = {
  id: string;
  provider: string;
  model: string;
};

export type EastYunAgentConfig = {
  model: EastYunAgentModelSelection;
  /**
   * Override the model catalog's context window size (tokens). When set,
   * auto-compaction thresholds (80% warn / 95% block) are computed against
   * this value instead of the catalog default. Useful for proxy providers
   * or when you want compaction to kick in earlier.
   */
  maxContextTokens?: number;
  /** Override the selected model catalog's output-token cap. */
  maxOutputTokens?: number;
  /** @deprecated Model thinking settings now control reasoning. */
  thinking?: { enabled: boolean };
  subagents?: {
    default?: EastYunAgentModelSelection;
    timeoutMs?: number;
  };
};

/**
 * Re-export of the router's structured config so callers that already depend
 * on `EastYunConfig` keep a single import path. The actual definition lives in
 * `src/router/config/schema.ts`.
 */
export type EastYunRouterConfig = RouterConfig;

export type EastYunMemoryApiType =
  | "openai-responses"
  | "responses"
  | "openai-completions"
  | "anthropic"
  | "google";
export type EastYunMemoryReasoningMode = "answer_first" | "accuracy_first";

export type EastYunMemoryScheduleConfig = {
  reasoningMode?: EastYunMemoryReasoningMode;
  autoIndexIntervalMinutes?: number;
  autoDreamIntervalMinutes?: number;
};

export type EastYunMemoryConfig = {
  enabled: boolean;
  provider: "edgeclaw";
  rootDir?: string;
  captureStrategy: "last_turn" | "full_session";
  includeAssistant: boolean;
  maxMessageChars?: number;
  retrievalTimeoutMs?: number;
  /** "provider/model" string referencing model.providers, e.g. "openai/gpt-4.1-mini" */
  model?: string;
  apiType?: EastYunMemoryApiType;
  schedule?: EastYunMemoryScheduleConfig;
  heartbeatBatchSize?: number;
};

export type EastYunGatewayConfig = {
  port: number;
  bindAddress: "127.0.0.1";
  idleSessionTimeoutMinutes: number;
  idleSweepIntervalSeconds: number;
  memoryDiagnostics: boolean;
  staticAssetsPath?: string;
  /**
   * Maximum number of concurrent per-session MCP instances (e.g. browser-use
   * browser processes).  When the limit is reached, new sessions fall back
   * to the shared project-level MCP runtime.  Default 5.
   */
  maxPerSessionMcpInstances?: number;
};

export type EastYunWebSearchProvider = import("./webSearchProviders.js").WebSearchProvider;
export type EastYunWebSearchCustomAuth = "bearer" | "bodyApiKey" | "queryApiKey" | "headerApiKey" | "none";
export type EastYunWebSearchCustomMethod = "GET" | "POST";

export type EastYunWebSearchCustomProviderConfig = import("./webSearchConfig.js").WebSearchCustomProviderConfig;
export type EastYunWebSearchProviderConfig = import("./webSearchConfig.js").WebSearchProviderConfig;
export type EastYunWebSearchConfig = import("./webSearchConfig.js").WebSearchConfig;

export type EastYunToolsConfig = {
  webSearch?: EastYunWebSearchConfig;
  videoGeneration?: import("./videoGenerationConfig.js").VideoGenerationConfig;
  imageGeneration?: import("./imageGenerationConfig.js").ImageGenerationConfig;
};

export type EastYunProxyConfig = {
  url: string;
  noProxy?: string;
};

export type EastYunPlatformAdapterConfig = {
  enabled: boolean;
  token?: string;
  apiKey?: string;
  webhookUrl?: string;
  extra?: Record<string, unknown>;
};

export type EastYunAdaptersConfig = {
  cli?: {
    autoConnectServer: boolean;
  };
  tui?: {
    autoConnectServer: boolean;
  };
  feishu?: {
    enabled: boolean;
    appId?: string;
    appSecret?: string;
    encryptKey?: string;
    verifyToken?: string;
    defaultSessionLabel: string;
    connectionMode?: "stream" | "webhook";
    domainName?: "feishu" | "lark";
    permissionMode?: "default" | "bypassPermissions";
  };
  weixin?: { enabled: boolean };
  qq?: {
    enabled: boolean;
    appId?: string;
    clientSecret?: string;
    allowGroups?: string[];
    triggerPrefixes?: string[];
    maxMessageLength?: number;
  };
  telegram?: EastYunPlatformAdapterConfig;
  discord?: EastYunPlatformAdapterConfig;
  slack?: EastYunPlatformAdapterConfig;
  matrix?: EastYunPlatformAdapterConfig;
  mattermost?: EastYunPlatformAdapterConfig;
  signal?: EastYunPlatformAdapterConfig;
  whatsapp?: EastYunPlatformAdapterConfig;
  bluebubbles?: EastYunPlatformAdapterConfig;
  dingtalk?: EastYunPlatformAdapterConfig;
  wecom?: EastYunPlatformAdapterConfig;
  wecomCallback?: EastYunPlatformAdapterConfig;
  email?: EastYunPlatformAdapterConfig;
  sms?: EastYunPlatformAdapterConfig;
  homeassistant?: EastYunPlatformAdapterConfig;
  apiServer?: EastYunPlatformAdapterConfig;
  webhook?: EastYunPlatformAdapterConfig;
};

export type EastYunTelemetryConfig = {
  enabled: boolean;
};

export type EastYunConfig = {
  runtime?: { python: { enabled: boolean } };
  agent: EastYunAgentConfig;
  model: ModelConfig;
  extension: EastYunExtensionConfig;
  memory?: EastYunMemoryConfig;
  gateway?: EastYunGatewayConfig;
  adapters?: EastYunAdaptersConfig;
  router?: RouterConfig;
  alwaysOn?: AlwaysOnConfig;
  cron?: CronConfig;
  tools?: EastYunToolsConfig;
  telemetry?: EastYunTelemetryConfig;
  proxy?: EastYunProxyConfig;
};

export type EastYunConfigSnapshot = {
  version: number;
  schemaVersion: number;
  loadedAt: Date;
  contentHash: string;
  sources: EastYunConfigSource[];
  diagnostics: EastYunConfigDiagnostic[];
  config: EastYunConfig;
};

export type EastYunConfigLoadOptions = {
  env?: Record<string, string | undefined>;
  configPath?: string;
  projectRoot?: string;
  version?: number;
};

export type EastYunConfigReloadEvent = {
  previousSnapshot: EastYunConfigSnapshot;
  nextSnapshot: EastYunConfigSnapshot;
  changedPaths: string[];
  changeClasses: EastYunConfigChangeClass[];
};

export class EastYunConfigError extends Error {
  readonly name = "EastYunConfigError";

  constructor(
    readonly code: string,
    message: string,
    readonly diagnostics: EastYunConfigDiagnostic[] = [],
  ) {
    super(message);
  }
}
