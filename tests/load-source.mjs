import fs from "node:fs";
import vm from "node:vm";
import { gunzipSync } from "node:zlib";

export function loadBaseSource() {
  let b64 = "";
  for (let i = 1; i <= 25; i++) {
    const rel = `../payload/v012/game-v012-${String(i).padStart(2, "0")}.js`;
    const text = fs.readFileSync(new URL(rel, import.meta.url), "utf8");
    const match = text.match(/\+'([^']+)';/);
    if (!match) throw new Error("Malformed runtime payload file: " + rel);
    b64 += match[1];
  }
  return gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
}

export function loadRuntimeSource() {
  const patchText = fs.readFileSync(new URL("../runtime-patches.js", import.meta.url), "utf8");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(patchText, sandbox, { filename: "runtime-patches.js" });
  if (typeof sandbox.KNELLWARD_PATCH_SOURCE !== "function") throw new Error("Runtime patch function missing");
  return sandbox.KNELLWARD_PATCH_SOURCE(loadBaseSource());
}

export const loadCanonicalSource = loadRuntimeSource;
