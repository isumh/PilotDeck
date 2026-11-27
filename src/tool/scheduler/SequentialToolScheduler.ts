import type { EastYunDeskToolResult } from "../protocol/result.js";
import type { EastYunDeskToolCall, EastYunDeskToolRuntimeContext } from "../protocol/types.js";
import type { ToolRuntime } from "../execution/ToolRuntime.js";
import type { EastYunDeskToolScheduler } from "./ToolScheduler.js";

export class SequentialToolScheduler implements EastYunDeskToolScheduler {
  constructor(private readonly runtime: ToolRuntime) {}

  async executeAll(
    calls: EastYunDeskToolCall[],
    context: EastYunDeskToolRuntimeContext,
  ): Promise<EastYunDeskToolResult[]> {
    const results: EastYunDeskToolResult[] = [];
    for (const call of calls) {
      results.push(await this.runtime.execute(call, context));
    }
    return results;
  }
}
