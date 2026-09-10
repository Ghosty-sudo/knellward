import fs from "node:fs";
import { gunzipSync } from "node:zlib";

export function loadCanonicalSource() {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const paths = [...html.matchAll(/<script src="(payload\/game-gz-[^"]+\.js)"><\/script>/g)].map(m => m[1]);
  if (!paths.length) throw new Error("No payload scripts declared");
  let b64 = "";
  for (const rel of paths) {
    const text = fs.readFileSync(new URL("../" + rel, import.meta.url), "utf8");
    const match = text.match(/\+\'([^\']+)\';/);
    if (!match) throw new Error("Malformed payload file: " + rel);
    b64 += match[1];
  }
  return gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
}
