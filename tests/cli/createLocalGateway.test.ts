import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import test from "node:test";
import { resolveBrowserUseOutputDir } from "../../src/cli/createLocalGateway.js";
import { resolveProjectStorageId } from "../../src/eastyun/index.js";
import { sanitizeSessionIdForPath } from "../../src/session/storage/ProjectSessionStorage.js";

test("resolveBrowserUseOutputDir stores browser-use output under eastyun home", () => {
  const root = mkdtempSync(join(tmpdir(), "eastyundesk-browser-use-"));
  try {
    const eastyunHome = join(root, "eastyun-home");
    const projectRoot = join(root, "Program Files", "EastYunDesk", "resources", "runtime");
    const sessionKey = "feishu-chat=oc_fe6d8e3b3960b8575b683b84c2a416d4/general";

    const outputDir = resolveBrowserUseOutputDir({ eastyunHome, projectRoot, sessionKey });

    assert.equal(
      outputDir,
      join(
        eastyunHome,
        "browser_screenshots",
        resolveProjectStorageId(projectRoot, eastyunHome),
        sanitizeSessionIdForPath(sessionKey),
      ),
    );
    assert.ok(!relative(eastyunHome, outputDir).startsWith(".."));
    assert.ok(!outputDir.includes(join(projectRoot, ".eastyundesk")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
