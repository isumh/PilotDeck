import {
  type CatalogProvider,
} from '../../../shared/catalogProviders';

/**
 * EastYunDesk's first-run wizard: language → connection → workspace.
 *
 * The upstream provider picker is gone: the app ships a single builtin provider
 * (`yna-llm`) so the user only has to supply a key and pass one connection
 * test. When a key is already stored the connection step is skipped, leaving
 * `CONFIGURED_ONBOARDING_STEP_IDS`.
 */
export const ONBOARDING_STEP_IDS = ['language', 'connection', 'workspace'] as const;

export const CONFIGURED_ONBOARDING_STEP_IDS = ['language', 'workspace'] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const CUSTOM_PROVIDER_ID = '__custom__';

/** Must match `BUILTIN_PROVIDER_ID` in ui/server/services/eastyundeskConfig.js. */
export const BUILTIN_PROVIDER_ID = 'yna-llm';
export const BUILTIN_PROVIDER_URL = 'http://ai-gw.ceairyn.com/v1';
export const BUILTIN_PROVIDER_PROTOCOL = 'openai-responses' as const;
export const BUILTIN_MODEL_ID = 'qwen3.8-27b';
export const BUILTIN_AGENT_MODEL = `${BUILTIN_PROVIDER_ID}/${BUILTIN_MODEL_ID}`;

/**
 * The builtin provider is fixed: no catalog entry is offered for it, and the
 * connection step never lets the user switch provider or model.
 */
export const BUILTIN_PROVIDER: CatalogProvider = {
  id: BUILTIN_PROVIDER_ID,
  displayName: 'EastYunDesk AI',
  protocol: BUILTIN_PROVIDER_PROTOCOL,
  defaultUrl: BUILTIN_PROVIDER_URL,
  requiresApiKey: true,
  models: [{ id: BUILTIN_MODEL_ID, displayName: BUILTIN_MODEL_ID }],
};

export const RESERVED_CUSTOM_PROVIDER_IDS = new Set([
  'anthropic',
  'bailian',
  'custom',
  'dashscope',
  'deepseek',
  'gemini',
  'google',
  'kimi',
  'minimax',
  'moonshot',
  'ollama',
  'openai',
  'openai-responses',
  'openrouter',
  'volc_ark',
  'volcengine',
  'zhipu',
]);

export const CUSTOM_PROVIDER: CatalogProvider = {
  id: CUSTOM_PROVIDER_ID,
  displayName: 'Custom',
  protocol: 'openai',
  defaultUrl: '',
  models: [],
};

export const DEFAULT_PROVIDER = CUSTOM_PROVIDER;

export const PLACEHOLDER_API_KEY = 'PLACEHOLDER_RUN_ONBOARDING_TO_REPLACE';
export const MASKED_SECRET = '********';

export const PROVIDER_LOGOS: Record<string, string> = {
  anthropic: '/onboarding/providers/anthropic.svg',
  openai: '/onboarding/providers/openai.svg',
  'openai-responses': '/onboarding/providers/openai.svg',
  dashscope: '/onboarding/providers/bailian-color.svg',
  deepseek: '/onboarding/providers/deepseek-color.svg',
  google: '/onboarding/providers/gemini-color.svg',
  openrouter: '/onboarding/providers/openrouter-color.svg',
  ollama: '/onboarding/providers/ollama.svg',
  minimax: '/onboarding/providers/minimax-color.svg',
  moonshot: '/onboarding/providers/kimi.svg',
  volc_ark: '/onboarding/providers/volcengine-color.svg',
  zhipu: '/onboarding/providers/zhipu-color.svg',
};

export const MAX_ONBOARDING_MODELS = 10;
