/**
 * UltraPlus-Free v5.2.0
 *
 * این فایل روی API گیت‌هاب به‌خاطر حجم (~83KB) کامل push نمی‌شود.
 * فایل کامل را از چت/آرتیفکت دانلود کن و با دکمه Upload file جای این بگذار.
 *
 * آموزش نصب با گوشی (بدون ترمینال): INSTALL-FA.md
 *
 * بعد از Upload باید داخل فایل باشد: v5.2.0 + export default + cloudflare:sockets
 */
export default {
  async fetch() {
    return new Response(
      "UltraPlus-Free v5.2.0 — فایل worker کامل نیست. INSTALL-FA.md را بخوان و worker.js کامل (~83KB) را Upload کن.",
      { status: 503, headers: { "Content-Type": "text/plain;charset=utf-8" } }
    );
  }
};
