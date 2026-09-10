(async () => {
  "use strict";

  delete window.__KNELLWARD_GZIP_B64;

  const parts = Array.from({ length: 25 }, (_, i) =>
    `payload/v012/game-v012-${String(i + 1).padStart(2, "0")}.js`
  );

  for (const src of parts) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`KNELLWARD payload part failed: ${src}`));
      document.head.appendChild(script);
    });
  }

  const b64 = window.__KNELLWARD_GZIP_B64 || "";
  delete window.__KNELLWARD_GZIP_B64;
  if (!b64) throw new Error("KNELLWARD runtime payload missing");

  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  let source = await new Response(stream).text();

  if (typeof window.KNELLWARD_PATCH_SOURCE !== "function") {
    throw new Error("KNELLWARD runtime patch layer missing");
  }
  source = window.KNELLWARD_PATCH_SOURCE(source);
  (0, eval)(source);
})().catch(err => {
  console.error("KNELLWARD bootstrap failed", err);
  document.body.innerHTML = '<pre style="color:#fff;background:#090b10;padding:24px;white-space:pre-wrap">KNELLWARD failed to start.\n\n' + String(err?.message || err) + '</pre>';
});
