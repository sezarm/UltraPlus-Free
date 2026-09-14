/**
 * UltraPlus-Free v5.1.0
 *
 * IMPORTANT: This placeholder is temporary.
 * Download the FULL minified worker.js (~82KB) from the project chat/artifacts
 * and upload it here via GitHub "Upload file" (Add file → Upload files).
 *
 * Expected size: ~82000 bytes
 * Must contain: export default + cloudflare:sockets + v5.1.0
 *
 * After upload, deploy that same file to Cloudflare Workers.
 */
export default {
  async fetch() {
    return new Response(
      "UltraPlus-Free v5.1.0: replace this worker.js with the full build (Upload file on GitHub). See DEPLOY.md",
      { status: 503, headers: { "Content-Type": "text/plain;charset=utf-8" } }
    );
  }
};
