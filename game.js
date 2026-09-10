(async () => {
  "use strict";
  const b64 = window.__KNELLWARD_GZIP_B64 || "";
  delete window.__KNELLWARD_GZIP_B64;
  if (!b64) throw new Error("KNELLWARD payload missing");
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const source = await new Response(stream).text();
  (0, eval)(source);
})().catch(err => {
  console.error("KNELLWARD bootstrap failed", err);
  document.body.innerHTML = '<pre style="color:#fff;background:#090b10;padding:24px">KNELLWARD failed to start. Please verify the game files.</pre>';
});
