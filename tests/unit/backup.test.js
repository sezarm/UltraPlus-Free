import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateBackup } from "../../src/storage/backup.js";

describe("backup validate", () => {
  it("rejects empty", () => {
    assert.equal(validateBackup(null).ok, false);
  });
  it("accepts shape", () => {
    const r = validateBackup({ version: "1", data: { users: [] } });
    assert.equal(r.ok, true);
  });
});
