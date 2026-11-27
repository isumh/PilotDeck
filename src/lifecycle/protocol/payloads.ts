import type { CanonicalMessage } from "../../model/index.js";
import type { EastYunDeskHookEvent } from "../../extension/hooks/protocol/events.js";
import type { EastYunDeskHookBaseInput } from "../../extension/hooks/protocol/input.js";
import type { EastYunDeskHookEffect, EastYunDeskLifecycleError } from "./effects.js";

export type LifecycleDispatchInput = {
  event: EastYunDeskHookEvent;
  baseInput: EastYunDeskHookBaseInput;
  payload?: Record<string, unknown>;
  matchQuery?: string;
  signal?: AbortSignal;
  env?: NodeJS.ProcessEnv;
};

export type LifecycleDispatchResult = {
  effects: EastYunDeskHookEffect[];
  messages: CanonicalMessage[];
  events: unknown[];
  blockingErrors: EastYunDeskLifecycleError[];
  nonBlockingErrors: EastYunDeskLifecycleError[];
};

export function emptyLifecycleDispatchResult(): LifecycleDispatchResult {
  return {
    effects: [],
    messages: [],
    events: [],
    blockingErrors: [],
    nonBlockingErrors: [],
  };
}
