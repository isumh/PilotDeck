import type { EastYunDeskHookEvent } from "../protocol/events.js";

export type EastYunDeskHookExecutionEvent =
  | {
      type: "started";
      hookName: string;
      hookEvent: EastYunDeskHookEvent;
    }
  | {
      type: "response";
      hookName: string;
      hookEvent: EastYunDeskHookEvent;
      stdout: string;
      stderr: string;
      exitCode?: number;
      outcome: "success" | "blocking" | "non_blocking_error" | "cancelled" | "timeout";
    };

export type EastYunDeskHookExecutionEventHandler = (event: EastYunDeskHookExecutionEvent) => void;

export class HookExecutionEventBus {
  private handlers = new Set<EastYunDeskHookExecutionEventHandler>();

  subscribe(handler: EastYunDeskHookExecutionEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emit(event: EastYunDeskHookExecutionEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
