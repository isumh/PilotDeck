import type { ApiModelListItem } from '../../../shared/modelListApi';
import type { CatalogProvider, CatalogProviderProtocol } from '../../../shared/catalogProviders';
import type { OnboardingStepId } from './constants';
import type { WorkspaceType } from '../../project-creation-wizard/types';

export type { OnboardingStepId };

export type TestStatus = 'idle' | 'testing' | 'success' | 'error' | 'manual';

export type ModelListStatus = 'idle' | 'loading' | 'error';

export type ImageSupportSource = 'catalog' | 'probe' | 'manual';

export type ModelImageSupport = {
  supportsImage: boolean | null;
  source: ImageSupportSource | null;
};

export type ModelTestState = {
  status: TestStatus;
  message: string;
  testId: string;
};

export type LlmSetupController = {
  selectedProvider: CatalogProvider | null;
  modelIds: string[];
  apiKey: string;
  customUrl: string;
  testMessage: string;
  modelTests: Record<string, ModelTestState>;
  saving: boolean;
  apiModels: ApiModelListItem[] | null;
  modelListStatus: ModelListStatus;
  modelListMessage: string;
  customProviderId: string;
  customProviderIdError: string;
  customProtocol: CatalogProviderProtocol;
  isCustomMode: boolean;
  selectedModels: Array<{ id: string; displayName: string }>;
  selectedDefaultUrl: string;
  effectiveUrl: string;
  effectiveModelId: string;
  effectiveModelIds: string[];
  effectiveProtocol: CatalogProviderProtocol;
  effectiveProviderId: string;
  selectedProviderRequiresApiKey: boolean;
  hasEnvironmentApiKeyFallback: boolean;
  apiKeyInputRequired: boolean;
  /** A usable credential is already on disk, so a connection step can be skipped. */
  hasStoredApiKey: boolean;
  /** Every selected model passed a connection test in this wizard session. */
  connectionTestPassed: boolean;
  canFetchModels: boolean;
  canContinue: boolean;
  manualModelIds: string[];
  setModelIds: (value: string[] | ((current: string[]) => string[])) => void;
  selectModelId: (modelId: string) => void;
  deselectModelId: (modelId: string) => void;
  setApiKey: (value: string) => void;
  setCustomUrl: (value: string) => void;
  setCustomProviderId: (value: string) => void;
  setCustomProtocol: (value: CatalogProviderProtocol) => void;
  resetTest: () => void;
  getModelTestState: (modelId: string) => ModelTestState;
  handleProviderSelect: (provider: CatalogProvider) => void;
  handleFetchModels: () => Promise<void>;
  handleTest: (modelId: string) => Promise<void>;
  submitManualImageSupport: (values: Record<string, boolean>) => void;
  cancelManualImageSupport: () => void;
  handleSave: () => Promise<void>;
};

/**
 * The onboarding workspace step only creates a brand-new local workspace. The
 * clone-from-GitHub path (and its token handling) was removed with §5, so the
 * draft carries no GitHub fields.
 */
export type WorkspaceDraft = {
  workspaceType: WorkspaceType;
  workspacePath: string;
};
