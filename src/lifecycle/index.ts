export type { EastYunDeskLifecycleHookEvent } from "./protocol/events.js";
export type {
  EastYunDeskHookEffect,
  EastYunDeskHookPermissionBehavior,
  EastYunDeskLifecycleError,
  EastYunDeskPermissionRequestResult,
} from "./protocol/effects.js";
export type { LifecycleDispatchInput, LifecycleDispatchResult } from "./protocol/payloads.js";
export { emptyLifecycleDispatchResult } from "./protocol/payloads.js";
export { EastYunDeskLifecycleRuntimeError } from "./protocol/errors.js";
export { LifecycleRuntime, NullLifecycleRuntime } from "./runtime/LifecycleRuntime.js";
export type { LifecycleObserver } from "./runtime/LifecycleObserver.js";
