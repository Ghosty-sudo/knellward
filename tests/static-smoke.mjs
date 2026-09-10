import fs from "node:fs";
import crypto from "node:crypto";
import { loadCanonicalSource } from "./load-source.mjs";

const required=["index.html","styles.css","game.js","electron/main.cjs","package.json"];
for(const f of required){if(!fs.existsSync(new URL("../"+f,import.meta.url)))throw new Error("Missing "+f)}
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const js=loadCanonicalSource();
for(const id of ["game","menu","hud","abilityBar","hpBar","focusBar"])if(!html.includes(`id="${id}"`))throw new Error("Missing DOM id "+id);
for(const marker of ["KNELLWARD_SELFTEST","function newRun","function generateFloor","function victory","function death"])if(!js.includes(marker))throw new Error("Missing game marker "+marker);
const sha=crypto.createHash("sha256").update(js).digest("hex");
if(sha!=="3c874ddb59b63e87b62674be27337b15d5b0bfa0e0b2e758ef36615b56dcc813")throw new Error("Canonical source hash mismatch: "+sha);
console.log("static smoke: PASS",sha);
