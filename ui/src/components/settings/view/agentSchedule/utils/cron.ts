import type { EastYunDeskConfig } from "../../modelPool/types";

export function isCronConfigEnabled(config: EastYunDeskConfig): boolean {
  return config.cron?.enabled !== false;
}
