import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createDialogProjectRegistry } from "../../src/gateway/dialog/projectRegistry.js";

const testRoot = join(tmpdir(), "eastyundesk-dialog-project-registry");

test("dialog project registry accepts General and registered projects", async () => {
  const eastyunHome = join(testRoot, "home");
  const registeredProject = join(testRoot, "workspace", "project");
  const registry = createDialogProjectRegistry({
    eastyunHome,
    listProjects: async () => [{ projectKey: registeredProject }],
  });

  assert.equal(await registry.resolveProjectKey(join(eastyunHome, ".")), eastyunHome);
  assert.equal(await registry.resolveProjectKey(registeredProject), registeredProject);
  assert.deepEqual(await registry.listProjectKeys(), [eastyunHome, registeredProject]);
});

test("dialog project registry keeps unknown paths outside the allowed boundary", async () => {
  const eastyunHome = join(testRoot, "home");
  const unknownProject = join(testRoot, "workspace", "unknown");
  const registry = createDialogProjectRegistry({
    eastyunHome,
    listProjects: async () => [{ projectKey: join(testRoot, "workspace", "project") }],
  });

  for (const projectKey of [join(eastyunHome, "sessions"), unknownProject]) {
    await assert.rejects(
      registry.resolveProjectKey(projectKey),
      (error: unknown) => (
        (error as { code?: string }).code === "PROJECT_NOT_FOUND"
        && (error as Error).message === `Unknown projectKey: ${projectKey}`
      ),
    );
  }
});

test("dialog project registry lists normalized projects only once", async () => {
  const eastyunHome = join(testRoot, "home");
  const registeredProject = join(testRoot, "workspace", "project");
  const registry = createDialogProjectRegistry({
    eastyunHome,
    listProjects: async () => [
      { projectKey: eastyunHome },
      { projectKey: registeredProject },
      { projectKey: join(registeredProject, ".") },
    ],
  });

  assert.deepEqual(await registry.listProjectKeys(), [eastyunHome, registeredProject]);
});
