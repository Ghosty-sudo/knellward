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
  let source = await new Response(stream).text();

  // v0.1.3 pacing pass: enemies that engage stay engaged, ranged/hex units
  // close into a tighter fight, Bell Husks act more often, and pursuit uses
  // shortest-path routing so players spend less time chasing enemies around walls.
  const pacingStart = source.indexOf("function enemyTurn()");
  const pacingEnd = source.indexOf("function enemyHit(", pacingStart);
  if (pacingStart < 0 || pacingEnd < 0) throw new Error("KNELLWARD pacing patch target missing");

  const pacingAI = `function enemyTurn(){const p=state.player;const detectionBase=hasRelic("stealth")?8:10;for(const e of state.enemies){if(e.dead)continue;if(e.boss){bossAct(e);continue}if(e.ai==="slow"){e.slowTick=(e.slowTick+1)%3;if(e.slowTick===0)continue}let d=dist(e,p);const detect=detectionBase+(e.elite?2:0);if(d<=detect)e.alerted=true;if(!e.alerted)continue;if(e.ai==="ranged"){if(d<=4&&clearLine(e.x,e.y,p.x,p.y)){enemyHit(e,Math.max(1,e.atk-1));continue}moveEnemyToward(e,p);d=dist(e,p);if(d===1)enemyHit(e,Math.max(1,e.atk-1));continue}if(e.ai==="hex"){if(d<=4&&clearLine(e.x,e.y,p.x,p.y)&&Math.random()<.65){enemyHit(e,Math.max(1,e.atk-1));if(p.focus>0&&Math.random()<.45){p.focus--;floater(p.x,p.y,"-1 Focus","#b2a0df")}continue}moveEnemyToward(e,p);if(dist(e,p)===1)enemyHit(e,e.atk);continue}moveEnemyToward(e,p);if(dist(e,p)===1)enemyHit(e,e.atk);if(e.ai==="skitter"&&Math.random()<.45&&dist(e,p)>1){moveEnemyToward(e,p);if(dist(e,p)===1)enemyHit(e,e.atk)}}}
function moveEnemyToward(e,p){if(dist(e,p)<=1)return;const key=(x,y)=>x+","+y,q=[],seen=new Set([key(e.x,e.y)]);for(const[nx,ny]of neighbors(e.x,e.y)){if(!(passable(nx,ny)||(nx===p.x&&ny===p.y)))continue;const first={x:nx,y:ny};q.push({x:nx,y:ny,first});seen.add(key(nx,ny))}while(q.length){const cur=q.shift();if(cur.x===p.x&&cur.y===p.y){if(!(cur.first.x===p.x&&cur.first.y===p.y)){e.x=cur.first.x;e.y=cur.first.y}return}for(const[nx,ny]of neighbors(cur.x,cur.y)){const k=key(nx,ny);if(seen.has(k))continue;if(!(passable(nx,ny)||(nx===p.x&&ny===p.y)))continue;seen.add(k);q.push({x:nx,y:ny,first:cur.first})}}const opts=neighbors(e.x,e.y).filter(([x,y])=>passable(x,y));opts.sort((a,b)=>(Math.abs(a[0]-p.x)+Math.abs(a[1]-p.y))-(Math.abs(b[0]-p.x)+Math.abs(b[1]-p.y)));if(opts.length){e.x=opts[0][0];e.y=opts[0][1]}}
`;

  source = source.slice(0, pacingStart) + pacingAI + source.slice(pacingEnd);
  (0, eval)(source);
})().catch(err => {
  console.error("KNELLWARD bootstrap failed", err);
  document.body.innerHTML = '<pre style="color:#fff;background:#090b10;padding:24px">KNELLWARD failed to start. Please verify the game files.</pre>';
});
