import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import test from "node:test";
import {
  ensureWritableDirectory,
  isDesktopRuntimeProjectRoot,
  isVirtualProjectRoot,
  resolveRuntimeArtifactFallbackDir,
} from "../../src/eastyun/index.js";

test("isDesktopRuntimeProjectRoot recognizes desktop resources/runtime only in desktop mode", () => {
  const root = join("C:\\Program Files", "EastYunDesk", "resources", "runtime");

  assert.equal(
    isDesktopRuntimeProjectRoot({
      projectRoot: root,
      env: { EASTYUNDESK_DESKTOP: "1" },
    }),
    true,
  );
  assert.equal(
    isDesktopRuntimeProjectRoot({
      projectRoot: root,
      env: {},
    }),
    false,
  );
});

test("isVirtualProjectRoot treats eastyunHome and desktop runtime roots as non-projects", () => {
  const root = mkdtempSync(join(tmpdir(), "eastyundesk-virtual-root-"));
  try {
    const eastyunHome = join(root, "eastyun-home");
    const runtimeRoot = join(root, "Program Files", "EastYunDesk", "resources", "runtime");

    assert.equal(isVirtualProjectRoot({ projectRoot: eastyunHome, eastyunHome }), true);
    assert.equal(
      isVirtualProjectRoot({
        projectRoot: runtimeRoot,
        eastyunHome,
        env: { EASTYUNDESK_DESKTOP: "1" },
      }),
      true,
    );
    assert.equal(
      isVirtualProjectRoot({
        projectRoot: join(root, "repo"),
        eastyunHome,
        env: { EASTYUNDESK_DESKTOP: "1" },
      }),
      false,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("ensureWritableDirectory falls back when preferred directory is not writable", () => {
  const root = mkdtempSync(join(tmpdir(), "eastyundesk-writable-dir-"));
  const lockedParent = join(root, "locked");
  const preferredDir = join(lockedParent, "artifact");
  const fallbackDir = resolveRuntimeArtifactFallbackDir({
    eastyunHome: join(root, "eastyun-home"),
    purpose: "plans",
    key: "chat/id",
  });
  try {
    chmodSync(root, 0o700);
    mkdirSync(lockedParent);
    chmodSync(lockedParent, 0o500);
    const result = ensureWritableDirectory({
      preferredDir,
      fallbackDir,
      purpose: "plans",
    });

    assert.equal(result.usedFallback, true);
    assert.equal(result.dir, resolve(fallbackDir));
    assert.ok(!relative(join(root, "eastyun-home"), result.dir).startsWith(".."));
  } finally {
    chmodSync(root, 0o700);
    try {
      chmodSync(lockedParent, 0o700);
    } catch {
      // The locked parent may not exist if setup failed early.
    }
    rmSync(root, { recursive: true, force: true });
  }
});
