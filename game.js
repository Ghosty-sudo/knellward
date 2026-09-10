(async () => {
  "use strict";

  // Discard the legacy payload assembled by the static HTML. v0.1.2 loads
  // the direct-input-enabled payload below so touch controls call game logic
  // directly instead of relying on synthetic keyboard events.
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
  if (!b64) throw new Error("KNELLWARD v0.1.2 payload missing");

  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const source = await new Response(stream).text();
  (0, eval)(source);
})().catch(err => {
  console.error("KNELLWARD bootstrap failed", err);
  document.body.innerHTML = '<pre style="color:#fff;background:#090b10;padding:24px">KNELLWARD failed to start. Please verify the game files.</pre>';
});
