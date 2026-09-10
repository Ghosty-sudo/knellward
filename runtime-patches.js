(() => {
  "use strict";

  const replaceOnce = (source, needle, replacement, label) => {
    const first = source.indexOf(needle);
    if (first < 0) throw new Error(`KNELLWARD patch target missing: ${label}`);
    if (source.indexOf(needle, first + needle.length) >= 0) throw new Error(`KNELLWARD patch target ambiguous: ${label}`);
    return source.slice(0, first) + replacement + source.slice(first + needle.length);
  };

  const replaceRange = (source, startMarker, endMarker, replacement, label) => {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker, start + startMarker.length);
    if (start < 0 || end < 0) throw new Error(`KNELLWARD patch range missing: ${label}`);
    return source.slice(0, start) + replacement + source.slice(end);
  };

  globalThis.KNELLWARD_PATCH_SOURCE = function patchSource(source) {
    source = replaceOnce(source, 'const V="0.1.0";', 'const V="0.1.4";', 'version');

    source = replaceOnce(source,'for(let i=0;i<attempts&&rooms.length<9;i++){','for(let i=0;i<attempts&&rooms.length<7;i++){','compact floor room count');
    source = replaceOnce(source,'scale=1+(state.floor-1)*.12+(state.mode==="endless"?Math.max(0,state.floor-5)*.04:0)','scale=1+(state.floor-1)*.15+(state.mode==="endless"?Math.max(0,state.floor-5)*.05:0)','enemy scaling');
    source = replaceOnce(source,'rng()<(0.05+state.floor*.015)','rng()<Math.min(.16,.07+state.floor*.02)','elite frequency');

    const killBlock = `function scoreValue(base){return Math.round(base*(hasRelic("fortune")?1.15:1))}\nfunction killEnemy(e){e.dead=true;state.player.kills++;state.score+=scoreValue(e.boss?500:(e.elite?55:20));gainXp(e.xp);if(hasRelic("lifesteal")&&state.player.floorHeal<6){state.player.hp=Math.min(state.player.maxHp,state.player.hp+1);state.player.floorHeal++}if(Math.random()<(hasRelic("fortune")?.18:.11)&&!e.boss){state.player.potions=Math.min(5,state.player.potions+1);showToast("Found a Mourner's Tonic")}\n if(e.boss){state.bossDefeated=true;state.score+=scoreValue(1000);setTimeout(victory,500)} else sfx("kill")}\n`;
    source = replaceRange(source, 'function killEnemy(', 'function gainXp(', killBlock, 'kill scoring');

    const moveBlock = `function playerMove(dx,dy){if(scene!=="game"||!state||state.ended)return "inactive";ensureAudio();const p=state.player,nx=p.x+dx,ny=p.y+dy;if(!inBounds(nx,ny)||state.map[ny][nx]===1){sfx("wall");return "blocked"}const e=enemyAt(nx,ny);if(e){basicAttack(e);const killed=e.dead;if(killed){p.x=nx;p.y=ny;p.stepCount++;if(hasRelic("stepfocus")&&p.stepCount%8===0)p.focus=Math.min(p.maxFocus,p.focus+1)}endTurn();return killed?"kill":"attack"}p.x=nx;p.y=ny;p.stepCount++;if(hasRelic("stepfocus")&&p.stepCount%8===0)p.focus=Math.min(p.maxFocus,p.focus+1);sfx("step");if(state.stairs&&nx===state.stairs.x&&ny===state.stairs.y){descend();return "descend"}endTurn();return "move"}\nfunction waitTurn(){if(scene!=="game"||!state||state.ended)return "inactive";ensureAudio();endTurn();return "wait"}\n`;
    source = replaceRange(source, 'function playerMove(', 'function useAbility(', moveBlock, 'player movement and wait');

    source = replaceRange(source,'function descend()','function showRelicChoice(','function descend(){if(state.mode==="campaign"&&state.floor>=5)return;state.score+=scoreValue(100);state.floor++;state.player.focus=state.player.maxFocus;sfx("stairs");showRelicChoice()}\n','fortune descent score');

    const pacingAI = `function enemyTurn(){const p=state.player;const detectionBase=hasRelic("stealth")?8:10;for(const e of state.enemies){if(e.dead)continue;if(e.boss){bossAct(e);continue}if(e.ai==="slow"){e.slowTick=(e.slowTick+1)%3;if(e.slowTick===0)continue}let d=dist(e,p);const detect=detectionBase+(e.elite?2:0);if(d<=detect)e.alerted=true;if(!e.alerted)continue;if(e.ai==="ranged"){if(d<=4&&clearLine(e.x,e.y,p.x,p.y)){beam(e,p);enemyHit(e,Math.max(1,e.atk-1));continue}moveEnemyToward(e,p);d=dist(e,p);if(d===1)enemyHit(e,Math.max(1,e.atk-1));continue}if(e.ai==="hex"){if(d<=4&&clearLine(e.x,e.y,p.x,p.y)&&Math.random()<.65){beam(e,p);enemyHit(e,Math.max(1,e.atk-1));if(p.focus>0&&Math.random()<.45){p.focus--;floater(p.x,p.y,"-1 Focus","#b2a0df")}continue}moveEnemyToward(e,p);if(dist(e,p)===1)enemyHit(e,e.atk);continue}moveEnemyToward(e,p);if(dist(e,p)===1)enemyHit(e,e.atk);if(e.ai==="skitter"&&Math.random()<.45&&dist(e,p)>1){moveEnemyToward(e,p);if(dist(e,p)===1)enemyHit(e,e.atk)}}}\nfunction moveEnemyToward(e,p){if(dist(e,p)<=1)return;const posKey=(x,y)=>x+","+y,q=[],seen=new Set([posKey(e.x,e.y)]);for(const[nx,ny]of neighbors(e.x,e.y)){if(!(passable(nx,ny)||(nx===p.x&&ny===p.y)))continue;const first={x:nx,y:ny};q.push({x:nx,y:ny,first});seen.add(posKey(nx,ny))}while(q.length){const cur=q.shift();if(cur.x===p.x&&cur.y===p.y){if(!(cur.first.x===p.x&&cur.first.y===p.y)){e.x=cur.first.x;e.y=cur.first.y}return}for(const[nx,ny]of neighbors(cur.x,cur.y)){const k=posKey(nx,ny);if(seen.has(k))continue;if(!(passable(nx,ny)||(nx===p.x&&ny===p.y)))continue;seen.add(k);q.push({x:nx,y:ny,first:cur.first})}}const opts=neighbors(e.x,e.y).filter(([x,y])=>passable(x,y));opts.sort((a,b)=>(Math.abs(a[0]-p.x)+Math.abs(a[1]-p.y))-(Math.abs(b[0]-p.x)+Math.abs(b[1]-p.y)));if(opts.length){e.x=opts[0][0];e.y=opts[0][1]}}\n`;
    source = replaceRange(source, 'function enemyTurn()', 'function enemyHit(', pacingAI, 'enemy pacing');

    const hudBlock = 'function updateHUD(){if(!state)return;const p=state.player;const engaged=state.enemies.filter(e=>!e.dead&&(e.alerted||e.boss)).length;$("floorLabel").textContent=state.mode==="endless"?`Endless Depth ${state.floor}`:`Depth ${floorRoman(state.floor)}`;$("objectiveLabel").textContent=state.mode==="campaign"&&state.floor===5&&!state.bossDefeated?"Silence The Bell Below.":engaged?`${engaged} threat${engaged===1?"":"s"} committed.`:"Find the stairwell.";$("hpBar").style.width=`${clamp(p.hp/p.maxHp*100,0,100)}%`;$("hpText").textContent=`${Math.max(0,p.hp)}/${p.maxHp}${p.shield?` +${p.shield}`:""}`;$("focusBar").style.width=`${clamp(p.focus/p.maxFocus*100,0,100)}%`;$("focusText").textContent=`${p.focus}/${p.maxFocus}`;$("statsText").textContent=`LV ${p.level} · ATK ${p.atk} · DEF ${p.def} · XP ${p.xp}/${p.nextXp}`;$("relicText").textContent=`Relics: ${p.relics.length}`;$("potionText").textContent=`Tonics: ${p.potions}`;$("turnText").textContent=`Turn ${state.turn}`}\n';
    source = replaceRange(source, 'function updateHUD()', 'function addLog(', hudBlock, 'threat HUD');

    source = replaceOnce(source,'WASD or Arrow Keys. Walking into an enemy attacks it. Every successful move or action advances the enemy turn.','WASD or Arrow Keys. Walking into an enemy attacks it. Press Space (or the center mobile button) to wait one turn and make committed enemies come to you. Every successful move or action advances the enemy turn.','tutorial wait text');
    source = replaceOnce(source,'else if(k==="q")usePotion()}','else if(k==="q")usePotion();else if(e.key===" ")waitTurn()}','keyboard wait control');
    source = replaceOnce(source, 'rgba(185,79,77,.43)', 'rgba(185,79,77,.58)', 'boss telegraph contrast');

    const boot = 'applySettings();showTitle();requestAnimationFrame(render);';
    const bootPatch = 'window.KNELLWARD_INPUT={...(window.KNELLWARD_INPUT||{}),move:playerMove,ability:useAbility,tonic:usePotion,pause,wait:waitTurn};if(window.KNELLWARD_TEST_API)Object.assign(window.KNELLWARD_TEST_API,{waitTurn,scoreValue,killEnemy});' + boot;
    source = replaceOnce(source, boot, bootPatch, 'input/test bridge');

    return source;
  };
})();
