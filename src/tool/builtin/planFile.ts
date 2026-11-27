import { mkdirSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import {
  ensureWritableDirectory,
  ensureEastYunProjectGitIgnore,
  isVirtualProjectRoot,
  EASTYUN_PROJECT_DIR_NAME,
  resolveEastYunHomeProjectArtifactDir,
  resolveRuntimeArtifactFallbackDir,
} from "../../eastyun/index.js";

export type PlanFileManager = {
  getPlanDirectoryPath(): string;
  resolvePlanFilePath(filePath: string, cwd: string): string | undefined;
  readPlanFile(filePath: string, cwd: string): string | undefined;
};

export function createPlanFileManager(options: {
  projectRoot: string;
  eastyunHome: string;
  env?: Record<string, string | undefined>;
}): PlanFileManager {
  const virtualProject = isVirtualProjectRoot({
    projectRoot: options.projectRoot,
    eastyunHome: options.eastyunHome,
    env: options.env,
  });
  const preferredPlanDir = virtualProject
    ? resolveEastYunHomeProjectArtifactDir({
        eastyunHome: options.eastyunHome,
        projectRoot: options.projectRoot,
        artifact: "plans",
      })
    : resolve(options.projectRoot, EASTYUN_PROJECT_DIR_NAME, "plans");
  const fallbackPlanDir = resolveRuntimeArtifactFallbackDir({
    eastyunHome: options.eastyunHome,
    purpose: "plans",
  });
  let resolvedPlanDir: string | undefined;

  function getPlanDirectoryPath(): string {
    if (!virtualProject) ensureEastYunProjectGitIgnore(options.projectRoot);
    resolvedPlanDir ??= virtualProject
      ? ensureWritableDirectory({
          preferredDir: preferredPlanDir,
          fallbackDir: fallbackPlanDir,
          purpose: "plans",
        }).dir
      : preferredPlanDir;
    mkdirSync(resolvedPlanDir, { recursive: true });
    return resolvedPlanDir;
  }

  function resolvePlanFilePath(filePath: string, cwd: string): string | undefined {
    if (!filePath.trim()) return undefined;
    const planDir = getPlanDirectoryPath();
    const absolutePath = resolve(isAbsolute(filePath) ? filePath : resolve(cwd, filePath));
    const relativeToPlanDir = relative(planDir, absolutePath);
    if (
      isAbsolute(relativeToPlanDir)
      || relativeToPlanDir.startsWith("..")
      || relativeToPlanDir.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)
      || relativeToPlanDir === ""
    ) {
      return undefined;
    }
    if (!absolutePath.toLowerCase().endsWith(".md")) {
      return undefined;
    }
    return absolutePath;
  }

  function readPlanFile(filePath: string, cwd: string): string | undefined {
    const absolutePath = resolvePlanFilePath(filePath, cwd);
    if (!absolutePath) {
      return undefined;
    }
    try {
      const content = readFileSync(absolutePath, "utf8");
      return content.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  return { getPlanDirectoryPath, resolvePlanFilePath, readPlanFile };
}
