import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createPlanFileManager } from "../../../src/tool/builtin/planFile.js";
import { resolveProjectStorageId } from "../../../src/eastyun/index.js";

test("desktop runtime plan files are stored under eastyunHome project artifacts", () => {
  const root = mkdtempSync(join(tmpdir(), "eastyundesk-plan-runtime-"));
  try {
    const eastyunHome = join(root, "eastyun-home");
    const projectRoot = join(root, "Program Files", "EastYunDesk", "resources", "runtime");
    const manager = createPlanFileManager({
      projectRoot,
      eastyunHome,
      env: { EASTYUNDESK_DESKTOP: "1" },
    });

    const planDir = manager.getPlanDirectoryPath();

    assert.equal(
      planDir,
      join(eastyunHome, "projects", resolveProjectStorageId(projectRoot, eastyunHome), "plans"),
    );
    assert.ok(!planDir.includes(join(projectRoot, ".eastyundesk")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("real project plan files stay under the project .eastyundesk directory", () => {
  const root = mkdtempSync(join(tmpdir(), "eastyundesk-plan-project-"));
  try {
    const eastyunHome = join(root, "eastyun-home");
    const projectRoot = join(root, "repo");
    const manager = createPlanFileManager({
      projectRoot,
      eastyunHome,
      env: { EASTYUNDESK_DESKTOP: "1" },
    });

    assert.equal(manager.getPlanDirectoryPath(), join(projectRoot, ".eastyundesk", "plans"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
