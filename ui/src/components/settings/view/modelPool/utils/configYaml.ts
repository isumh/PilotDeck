import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { EastYunDeskConfig } from "../types";

export function safeParseYaml(text: string): EastYunDeskConfig | null {
  try {
    const value = parseYaml(text);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as EastYunDeskConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function configToYamlString(config: EastYunDeskConfig): string {
  return stringifyYaml(config, { indent: 2, lineWidth: 0 });
}
