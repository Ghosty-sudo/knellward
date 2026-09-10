import fs from "node:fs";
import crypto from "node:crypto";
import { loadBaseSource, loadRuntimeSource } from "./load-source.mjs";

const required=["index.html","styles.css","game.js","runtime-patches.js","mobile-controls.js","electron/main.cjs","package.json","payload/v012/game-v012-01.js","payload/v012/game-v012-25.js"];
for(const f of required){if(!fs.existsSync(new URL("../"+f,import.meta.url)))throw new Error("Missing "+f)}
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const pkg=JSON.parse(fs.readFileSync(new URL("../package.json",import.meta.url),"utf8"));
const base=loadBaseSource();
const js=loadRuntimeSource();
for(const id of ["game","menu","hud","abilityBar","mobileControls","hpBar","focusBar"])if(!html.includes(`id="${id}"`))throw new Error("Missing DOM id "+id);
if(!html.includes('data-mobile-action="wait"'))throw new Error("Missing mobile Wait control");
if(!html.includes('runtime-patches.js')||!html.includes('mobile-controls.js'))throw new Error("Runtime support scripts missing from HTML");
if(html.includes('payload/game-gz-01.js'))throw new Error("Legacy payload is still eagerly loaded");
for(const marker of ["KNELLWARD_SELFTEST","function newRun","function generateFloor","function victory","function death","function waitTurn","function scoreValue(base)","e.alerted=true","rooms.length<7","threat${engaged===1?"])if(!js.includes(marker))throw new Error("Missing runtime marker "+marker);
for(const marker of ["mobile-controls.js","runtime-patches.js","payload/v012/**/*"])if(!pkg.build.files.includes(marker))throw new Error("Desktop package omits "+marker);
if(pkg.version!=="0.1.4")throw new Error("Package version mismatch");
const baseSha=crypto.createHash("sha256").update(base).digest("hex");
const runtimeSha=crypto.createHash("sha256").update(js).digest("hex");
console.log("static smoke: PASS",JSON.stringify({baseSha,runtimeSha,version:pkg.version}));
