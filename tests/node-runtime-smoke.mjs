import vm from 'node:vm';
import { loadRuntimeSource } from './load-source.mjs';

class ClassList { constructor(){this.s=new Set()} add(...a){a.forEach(x=>this.s.add(x))} remove(...a){a.forEach(x=>this.s.delete(x))} contains(x){return this.s.has(x)} }
const els=new Map();
function el(id){if(!els.has(id))els.set(id,{id,classList:new ClassList(),style:{},dataset:{},textContent:'',innerHTML:'',value:'0',onclick:null,oninput:null,onchange:null,querySelectorAll:()=>[],querySelector:()=>null});return els.get(id)}
const ctx={imageSmoothingEnabled:false,fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'',save(){},restore(){},translate(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},arc(){},stroke(){},fill(){},fillText(){}};
const canvas=el('game'); canvas.getContext=()=>ctx;
const ids=['menu','hud','abilityBar','toast','dialog','version','floorLabel','objectiveLabel','hpBar','hpText','focusBar','focusText','statsText','relicText','potionText','turnText','potionBtn','waitBtn','app'];
ids.forEach(el);
el('abilityBar').querySelectorAll=()=>[];
const storage=new Map();
storage.set('knellward.meta.v1',JSON.stringify({completed:false,endlessUnlocked:false,bestDepth:0,bestScore:0,tutorialSeen:true,runs:0}));
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const windowObj={__KNELLWARD_TEST__:true,AudioContext:undefined,webkitAudioContext:undefined,addEventListener(){},localStorage};
const documentObj={getElementById:id=>el(id)};
const sandbox={window:windowObj,document:documentObj,localStorage,navigator:{getGamepads:()=>[]},crypto:{randomUUID:()=>Math.random().toString(36).slice(2)},structuredClone:global.structuredClone,Math,Date,JSON,console,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:()=>0,confirm:()=>true};
vm.createContext(sandbox);
const src=loadRuntimeSource();
vm.runInContext(src,sandbox,{filename:'game-runtime.js'});
const api=windowObj.KNELLWARD_TEST_API;
if(!api) throw new Error('test API not exposed');
const self=windowObj.KNELLWARD_SELFTEST;
if(!self || self.passed!==self.total) throw new Error('internal self-tests failed');
for(const fn of ['move','ability','tonic','pause','wait'])if(typeof windowObj.KNELLWARD_INPUT?.[fn]!=='function')throw new Error('missing direct input '+fn);
api.newRun('campaign','normal');
let s=api.getState();
if(!s || s.floor!==1 || !Array.isArray(s.map) || s.map.length!==18) throw new Error('new run failed');
if(s.enemies.length<3) throw new Error('enemy population missing');
if(!s.stairs) throw new Error('stairs missing on floor 1');
const waitX=s.player.x,waitY=s.player.y,waitTurn=s.turn;
api.waitTurn();
s=api.getState();
if(s.turn!==waitTurn+1||s.player.x!==waitX||s.player.y!==waitY)throw new Error('wait action failed');

const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
let target=null;
for(const [dx,dy] of dirs){const nx=s.player.x+dx,ny=s.player.y+dy;if(nx>=0&&ny>=0&&nx<32&&ny<18&&s.map[ny][nx]===0){target={dx,dy,nx,ny};break}}
if(!target)throw new Error('no adjacent floor tile for follow-through test');
s.enemies=[{id:'qa-foe',type:'thrall',name:'QA Thrall',x:target.nx,y:target.ny,hp:1,maxHp:1,atk:1,def:0,xp:1,color:'#fff',ai:'chase',elite:false,slowTick:0,dead:false}];
s.player.atk=99;
api.playerMove(target.dx,target.dy);
s=api.getState();
if(s.player.x!==target.nx||s.player.y!==target.ny)throw new Error('kill follow-through failed');

s.player.relics.push({id:'mourner_coin',name:"Mourner's Coin",tag:'fortune'});
if(api.scoreValue?.(100)!==115)throw new Error('fortune score multiplier failed');

api.useAbility('ward');
s=api.getState();
if(s.player.shield<5) throw new Error('ward failed');
if(!storage.has('knellward.save.v1')) throw new Error('save not written');

function reachable(map,start,goal){const q=[start],seen=new Set([start.x+','+start.y]);while(q.length){const cur=q.shift();if(cur.x===goal.x&&cur.y===goal.y)return true;for(const [dx,dy] of dirs){const x=cur.x+dx,y=cur.y+dy,k=x+','+y;if(x<0||y<0||y>=map.length||x>=map[0].length||map[y][x]!==0||seen.has(k))continue;seen.add(k);q.push({x,y})}}return false}
let reachability=0;
for(let seed=1;seed<=250;seed++){
  s.seed=seed;
  for(let f=1;f<=5;f++){
    s.floor=f;api.generateFloor();
    if(s.map.length!==18||s.map.some(r=>r.length!==32))throw new Error('bad map dimensions at floor '+f);
    const goal=f<5?s.stairs:s.enemies.find(e=>e.boss);
    if(!goal)throw new Error('missing goal at floor '+f);
    if(!reachable(s.map,{x:s.player.x,y:s.player.y},{x:goal.x,y:goal.y}))throw new Error(`unreachable floor seed ${seed} depth ${f}`);
    reachability++;
  }
}
console.log(JSON.stringify({runtime:'PASS',selftests:`${self.passed}/${self.total}`,wait:'PASS',followThrough:'PASS',fortuneScore:'PASS',reachability:`${reachability}/${reachability}`},null,2));
process.exit(0);
