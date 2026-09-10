import fs from 'node:fs';
const required=['index.html','styles.css','game.js','electron/main.cjs','package.json'];
for(const f of required){if(!fs.existsSync(new URL('../'+f,import.meta.url)))throw new Error('Missing '+f)}
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
for(const id of ['game','menu','hud','abilityBar','hpBar','focusBar'])if(!html.includes(`id="${id}"`))throw new Error('Missing DOM id '+id);
for(const marker of ['KNELLWARD_SELFTEST','function newRun','function generateFloor','function victory','function death'])if(!js.includes(marker))throw new Error('Missing game marker '+marker);
console.log('static smoke: PASS');
