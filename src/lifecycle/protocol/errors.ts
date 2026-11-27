export class EastYunDeskLifecycleRuntimeError extends Error {
  readonly name = "EastYunDeskLifecycleRuntimeError";

  constructor(
    readonly code: "hook_blocked" | "hook_failed",
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}
