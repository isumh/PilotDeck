import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { MatrixChannel } from "../../../../src/adapters/channel/matrix/MatrixChannel.js";

test("MatrixChannel defaults storage under eastyunHome", () => {
  const root = mkdtempSync(join(tmpdir(), "eastyundesk-matrix-storage-"));
  try {
    const eastyunHome = join(root, "eastyun-home");
    const channel = new MatrixChannel({ eastyunHome }) as unknown as { storagePath: string };

    assert.equal(channel.storagePath, join(eastyunHome, "matrix-bot-storage.json"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
