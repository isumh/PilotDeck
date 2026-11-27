import type { EastYunExtensionPaths } from "../../../eastyun/paths.js";
import { getEastYunExtensionPaths } from "../../../eastyun/paths.js";

export type PluginDirectoryResolverInput = {
  projectRoot: string;
  eastyunHome: string;
};

export function resolvePluginDirectories(input: PluginDirectoryResolverInput): EastYunExtensionPaths {
  return getEastYunExtensionPaths(input.projectRoot, input.eastyunHome);
}
