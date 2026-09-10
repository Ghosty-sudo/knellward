import fs from 'node:fs';
import vm from 'node:vm';
import { loadCanonicalSource } from './load-source.mjs';

class ClassList { constructor(){this.s=new Set()} add(...a){a.forEach(x=>this.s.add(x))} remove(...a){a.forEach(x=>this.s.delete(x))} contains(x){return this.s.has(x)} }
const els=new Map();
function el(id){if(!els.has(id))els.set(id,{id,classList:new ClassList(),style:{},dataset:{},textContent:'',innerHTML:'',value:'0',onclick:null,oninput:null,onchange:null,querySelectorAll:()=>[],querySelector:()=>null});return els.get(id)}
const ctx={imageSmoothingEnabled:false,fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'',save(){},restore(){},translate(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},arc(){},stroke(){},fill(){},fillText(){}};
const canvas=el('game'); canvas.getContext=()=>ctx;
const ids=['menu','hud','abilityBar','toast','dialog','version','floorLabel','objectiveLabel','hpBar','hpText','focusBar','focusText','statsText','relicText','potionText','turnText','potionBtn','app'];
ids.forEach(el);
el('abilityBar').querySelectorAll=()=>[];
const storage=new Map();
storage.set('knellward.meta.v1',JSON.stringify({completed:false,endlessUnlocked:false,bestDepth:0,bestScore:0,tutorialSeen:true,runs:0}));
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const windowObj={__KNELLWARD_TEST__:true,AudioContext:undefined,webkitAudioContext:undefined,addEventListener(){},localStorage};
const documentObj={getElementById:id=>el(id)};
const sandbox={window:windowObj,document:documentObj,localStorage,navigator:{getGamepads:()=>[]},crypto:{randomUUID:()=>Math.random().toString(36).slice(2)},structuredClone:global.structuredClone,Math,Date,JSON,console,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:()=>0,confirm:()=>true};
vm.createContext(sandbox);
const src=loadCanonicalSource();
vm.runInContext(src,sandbox,{filename:'game.js'});
const api=windowObj.KNELLWARD_TEST_API;
if(!api) throw new Error('test API not exposed');
const self=windowObj.KNELLWARD_SELFTEST;
if(!self || self.passed!==self.total) throw new Error('internal self-tests failed');
api.newRun('campaign','normal');
let s=api.getState();
if(!s || s.floor!==1 || !Array.isArray(s.map) || s.map.length!==18) throw new Error('new run failed');
if(s.enemies.length<3) throw new Error('enemy population missing');
if(!s.stairs) throw new Error('stairs missing on floor 1');
const startTurn=s.turn;
// Find a passable neighbor and move once.
const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
let moved=false;
for(const [dx,dy] of dirs){const nx=s.player.x+dx,ny=s.player.y+dy;if(nx>=0&&ny>=0&&nx<32&&ny<18&&s.map[ny][nx]===0&&!s.enemies.some(e=>!e.dead&&e.x===nx&&e.y===ny)){api.playerMove(dx,dy);moved=true;break}}
if(!moved) throw new Error('no passable start neighbor');
s=api.getState();
if(s.turn!==startTurn+1) throw new Error('turn did not advance');
api.useAbility('ward');
s=api.getState();
if(s.player.shield<5) throw new Error('ward failed');
if(!storage.has('knellward.save.v1')) throw new Error('save not written');
// Batch floor generation sanity for campaign floors 1-5.
for(let f=1;f<=5;f++){s.floor=f;api.generateFloor();if(s.map.length!==18||s.map.some(r=>r.length!==32))throw new Error('bad map dimensions at floor '+f);if(f<5&&!s.stairs)throw new Error('missing stairs at floor '+f);if(f===5&&!s.enemies.some(e=>e.boss))throw new Error('boss missing floor 5')}
console.log(JSON.stringify({runtime:'PASS',selftests:`${self.passed}/${self.total}`,turn:s.turn,playerLevel:s.player.level,enemies:s.enemies.length,floor5Boss:s.enemies.some(e=>e.boss),saveWritten:storage.has('knellward.save.v1')},null,2));
process.exit(0);
