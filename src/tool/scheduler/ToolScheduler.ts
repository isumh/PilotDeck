import type { EastYunDeskToolResult } from "../protocol/result.js";
import type { EastYunDeskToolCall, EastYunDeskToolRuntimeContext } from "../protocol/types.js";

export type EastYunDeskToolScheduler = {
  executeAll(calls: EastYunDeskToolCall[], context: EastYunDeskToolRuntimeContext): Promise<EastYunDeskToolResult[]>;
};
