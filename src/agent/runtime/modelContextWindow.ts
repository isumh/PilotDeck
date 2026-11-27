import type { ModelRuntime } from "../../model/index.js";
import type { EastYunAgentModelSelection } from "../../eastyun/config/types.js";

export type ResolveRoutedModelMaxContextTokensInput = {
  modelRuntime: Pick<ModelRuntime, "getCapabilities">;
  agentModel: EastYunAgentModelSelection;
  agentMaxContextTokens?: number;
  provider: string;
  model: string;
};

export function resolveRoutedModelMaxContextTokens(
  input: ResolveRoutedModelMaxContextTokensInput,
): number | undefined {
  if (
    input.agentMaxContextTokens !== undefined &&
    input.provider === input.agentModel.provider &&
    input.model === input.agentModel.model
  ) {
    return input.agentMaxContextTokens;
  }

  try {
    return input.modelRuntime.getCapabilities(input.provider, input.model).maxContextTokens;
  } catch {
    return undefined;
  }
}
