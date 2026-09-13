/**
 * UltraPlus-Free v0.6.8 - Single File Worker
 * Phase 8.0: Sing-box sub format + reset proxy stats
 * FROM SCRATCH – not copied from other projects
 *
 * NOTE: v0.7.0 wizard auto-deploy is documented in WIZARD.md
 * Full 0.7.0 worker will be restored in next commit if this push succeeds as base.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/wizard") {
      return Response.redirect("https://github.com/sezarm/UltraPlus-Free/blob/main/WIZARD.md", 302);
    }
    if (url.pathname === "/health") {
      return Response.json({ status: "degraded", version: "0.6.8-restore-stub", note: "Full worker restore in progress. See GitHub." });
    }
    return new Response(
      "UltraPlus-Free: temporary stub after deploy glitch. Download full worker.js from GitHub commit history (v0.6.8) or wait for next push.\n" +
      "Wizard docs: https://github.com/sezarm/UltraPlus-Free/blob/main/WIZARD.md\n",
      { headers: { "Content-Type": "text/plain;charset=utf-8" } }
    );
  }
};
