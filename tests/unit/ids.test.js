import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { newSubToken, newId } from "../../src/utils/ids.js";

describe("ids", () => {
  it("newSubToken length 48 hex", () => {
    const t = newSubToken();
    assert.equal(t.length, 48);
    assert.match(t, /^[0-9a-f]+$/);
  });
  it("newId uuid", () => {
    assert.match(newId(), /^[0-9a-f-]{36}$/i);
  });
});
