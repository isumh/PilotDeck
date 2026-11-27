import { homedir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { findCanonicalProjectRoot } from "../session/worktree/findCanonicalProjectRoot.js";

export type EastYunPathEnv = Record<string, string | undefined>;

export const DEFAULT_EASTYUN_HOME = "~/.eastyundesk";
export const EASTYUN_CONFIG_FILE_NAME = "eastyundesk.yaml";
export const EASTYUN_PROJECT_DIR_NAME = ".eastyundesk";

/** Keep project-local runtime data untracked, including before Git is initialized. */
export function ensureEastYunProjectGitIgnore(projectRoot: string, createDirectory = true): void {
  const directory = resolve(projectRoot, EASTYUN_PROJECT_DIR_NAME);
  if (!createDirectory && !existsSync(directory)) return;
  try {
    mkdirSync(directory, { recursive: true });
    const ignorePath = resolve(directory, ".gitignore");
    let content = "";
    try { content = readFileSync(ignorePath, "utf8"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    const lastRule = content.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#")).at(-1);
    if (lastRule === "*") return;
    // Append so existing comments and rules remain intact; the final rule ignores
    // this file too. Later session reads do not change its content or timestamps.
    appendFileSync(ignorePath, `${content && !content.endsWith("\n") ? "\n" : ""}# EastYunDesk internal files\n*\n`, "utf8");
  } catch (error) {
    // Session history and Git status remain readable in read-only workspaces.
    if (!["EACCES", "EPERM", "EROFS"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error;
  }
}

export type EastYunExtensionPaths = {
  globalPluginsDir: string;
  globalSkillsDir: string;
  projectPluginsDir: string;
  projectSkillsDir: string;
};

export function resolveEastYunHome(env: EastYunPathEnv = process.env): string {
  return normalizeHomePath(env.EASTYUN_HOME ?? DEFAULT_EASTYUN_HOME);
}

export function getEastYunConfigFilePath(eastyunHome: string): string {
  return resolve(eastyunHome, EASTYUN_CONFIG_FILE_NAME);
}

export function getEastYunProjectConfigFilePath(projectRoot: string): string {
  return resolve(projectRoot, EASTYUN_PROJECT_DIR_NAME, EASTYUN_CONFIG_FILE_NAME);
}

export function getEastYunMemoryRootDir(eastyunHome: string): string {
  return resolve(eastyunHome, "memory");
}

export function getEastYunProjectChatDir(projectRoot: string, eastyunHome: string): string {
  const projectId = resolveProjectStorageId(projectRoot, eastyunHome);
  return resolve(eastyunHome, "projects", projectId, "chats");
}

/**
 * Async variant that first resolves a worktree cwd to its canonical
 * main-repository root (so all worktrees share the same project ID).
 * Use this for all new code. The sync `getEastYunProjectChatDir` keeps
 * the legacy behaviour for callers that cannot await.
 */
export async function getEastYunProjectChatDirAsync(
  projectRoot: string,
  eastyunHome: string,
): Promise<string> {
  const canonical = await findCanonicalProjectRoot(projectRoot);
  const projectId = resolveProjectStorageId(canonical, eastyunHome);
  return resolve(eastyunHome, "projects", projectId, "chats");
}

export function getEastYunExtensionPaths(projectRoot: string, eastyunHome: string): EastYunExtensionPaths {
  return {
    globalPluginsDir: resolve(eastyunHome, "plugins"),
    globalSkillsDir: resolve(eastyunHome, "skills"),
    projectPluginsDir: resolve(projectRoot, EASTYUN_PROJECT_DIR_NAME, "plugins"),
    projectSkillsDir: resolve(projectRoot, EASTYUN_PROJECT_DIR_NAME, "skills"),
  };
}

export function createProjectId(projectRoot: string): string {
  const normalizedRoot = resolve(projectRoot);
  return createLegacyProjectId(normalizedRoot);
}

export function createCollisionResistantProjectId(projectRoot: string): string {
  const normalizedRoot = resolve(projectRoot);
  const legacyId = createLegacyProjectId(normalizedRoot);
  const digest = createHash("sha1").update(normalizedRoot).digest("hex").slice(0, 10);
  return `${legacyId}--${digest}`;
}

/** Resolve the on-disk spelling while preserving the names of missing entries. */
export function resolveProjectIdentityPath(projectRoot: string): string {
  const absolute = resolve(projectRoot);
  try { return realpathSync.native(absolute); }
  catch {
    const parent = dirname(absolute);
    return parent === absolute ? absolute : resolve(resolveProjectIdentityPath(parent), basename(absolute));
  }
}

/**
 * Resolve the on-disk project directory name for a workspace.
 *
 * `.cwd` markers are authoritative because the legacy project ID is lossy:
 * distinct paths (especially paths containing non-ASCII segments) can encode
 * to the same slug. When no valid marker exists, retain the legacy ID for
 * backwards compatibility with unregistered projects.
 */
export function resolveProjectStorageId(projectRoot: string, eastyunHome: string): string {
  return findStoredProjectId(projectRoot, eastyunHome) ?? createProjectId(projectRoot);
}

/**
 * Async variant: resolves canonical (worktree-aware) root before hashing.
 * Two worktrees of the same repo produce the same project ID.
 */
export async function createProjectIdAsync(projectRoot: string): Promise<string> {
  const canonical = await findCanonicalProjectRoot(projectRoot);
  return createProjectId(canonical);
}

function normalizeHomePath(path: string): string {
  if (path === "~") {
    return homedir();
  }

  if (path.startsWith("~/")) {
    return resolve(homedir(), path.slice(2));
  }

  return resolve(path);
}

function createLegacyProjectId(projectRoot: string): string {
  // Normalize to forward slashes so the same physical path produces the same
  // project ID on Windows (\) and Unix (/). Also strip a Windows drive-letter
  // prefix (e.g. "C:") so "C:\Users\foo" slugifies identically to "/Users/foo".
  const normalized = projectRoot.replace(/\\/g, "/").replace(/^[A-Za-z]:/, "");
  return normalized.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

function findStoredProjectId(projectRoot: string, eastyunHome: string): string | null {
  const projectsDir = resolve(eastyunHome, "projects");
  if (!existsSync(projectsDir)) {
    return null;
  }
  const target = normalizeProjectPathForMarkerComparison(projectRoot);
  try {
    for (const entry of readdirSync(projectsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const markerPath = resolve(projectsDir, entry.name, ".cwd");
      let marker: string;
      try {
        marker = readFileSync(markerPath, "utf8").trim();
      } catch {
        continue;
      }
      if (!marker || normalizeProjectPathForMarkerComparison(marker) !== target) {
        continue;
      }
      try {
        if (statSync(marker).isDirectory()) {
          return entry.name;
        }
      } catch {
        continue;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeProjectPathForMarkerComparison(projectRoot: string): string {
  const resolved = resolve(projectRoot);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}
