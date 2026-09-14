import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatWarpConf } from "../../src/network/warp.js";

describe("warp conf", () => {
  it("empty keys comment", () => {
    assert.match(formatWarpConf({ privateKey: "" }), /not configured/i);
  });
  it("renders interface", () => {
    const s = formatWarpConf({
      privateKey: "AAA", publicKey: "BBB", address: "172.16.0.2/32",
      dns: "1.1.1.1", endpoint: "engage.cloudflareclient.com:2408",
      allowedIPs: "0.0.0.0/0", mtu: 1280,
    });
    assert.match(s, /\[Interface\]/
    assert.match(s, /PrivateKey = AAA/);
  });
});
