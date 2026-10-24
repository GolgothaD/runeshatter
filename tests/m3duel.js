const L=require('./m3lib');const OUT='/workspace/qa/match3/v12/';
const VP={cover:{width:412,height:915,deviceScaleFactor:2.2,isMobile:true,hasTouch:true},inner:{width:820,height:910,deviceScaleFactor:2.4,isMobile:true,hasTouch:true},pc:{width:1920,height:1080,deviceScaleFactor:1}};
(async()=>{const port=L.serve(),br=await L.launch();const errs=[];const R={};
 async function page(vp){const p=await br.newPage();await p.setViewport(VP[vp]);p.on('pageerror',e=>errs.push(vp+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(vp+' console: '+m.text())});
  p.on('requestfailed',q=>errs.push('reqfail '+q.url()));p.on('response',r=>{if(r.status()>=400)errs.push('HTTP '+r.status()+' '+r.url())});
  await p.goto(`http://localhost:${port}/index.html`,{waitUntil:'load'});await p.evaluate(()=>localStorage.clear());await p.reload({waitUntil:'load'});await L.W8(800);return p}
 const bot=p=>p.evaluate(()=>{window.__bot=setInterval(()=>{const D=RS.duel.D;if(!D||D.over||!RS.settled()||Math.random()<.4)return;const b=RS.grid.map(c=>c.map(g=>g&&g.st==='idle'?{t:g.t,sp:g.sp}:null));const m=findMoves(b);if(!m.length)return;
   m.sort((a,z)=>{const s=v=>(RS.grid[v[0]][v[1]].sp+RS.grid[v[2]][v[3]].sp);return s(z)-s(a)});const v=m[Math.random()<.6?0:(Math.random()*m.length)|0];trySwap(v[0],v[1],v[2],v[3])},500)});
 const st=p=>p.evaluate(()=>{const D=RS.duel.D;if(!D)return null;let ice=0,cu=0;for(const c of RS.grid)for(const g of c)if(g){ice+=g.ice?1:0;cu+=g.curse?1:0}return {hp:D.hp,me:D.me,sh:Math.round(D.sh),over:D.over,t:+D.t.toFixed(1),cast:D.cast&&D.cast.sp,ctr:D.ctrN,dealt:D.dealt,taken:D.taken,ice,cu,body:document.body.className,panel:document.querySelector('.panel.show')&&document.querySelector('.panel.show').id}});
 // ===== 1. cover: ladder, full WIN vs Pip with real play =====
 let p=await page('cover');await p.screenshot({path:OUT+'cover-menu.png'});
 await p.click('#mDuel');await L.W8(600);await p.screenshot({path:OUT+'cover-ladder.png'});
 await p.click('.lad[data-i="0"]');await L.W8(2500);await p.screenshot({path:OUT+'cover-intro.png'});
 await bot(p);const log=[];let shotT=0,shotC=0,castSeen=new Set();
 for(let i=0;i<400;i++){await L.W8(500);const s=await st(p);if(!s)break;if(s.cast)castSeen.add(s.cast);if(i%10==0)log.push(s);
  if(s.cast&&!shotT){shotT=1;await p.screenshot({path:OUT+'cover-telegraph.png'})}if(s.ice&&!shotC){shotC=1;await p.screenshot({path:OUT+'cover-frozen.png'})}
  if(i===14)await p.screenshot({path:OUT+'cover-midduel.png'});if(s.over)break}
 await L.W8(3000);let s=await st(p);await p.screenshot({path:OUT+'cover-victory.png'});R.coverWin={final:s,casts:[...castSeen],log};
 // ===== 2. cover: forced spells — freeze, curse, shuffle, and frozen-swap rejection =====
 await p.evaluate(()=>{clearInterval(window.__bot);RS.duel.start(6)});await L.W8(3500);
 R.forced={};for(const sp of ['freeze','curse','wall','drain','heal','shuffle','fire']){await p.evaluate(sp=>{RS.duel.set({hp:400,me:300});RS.duel.cast(sp)},sp);await L.W8(800);if(sp==='curse')await p.screenshot({path:OUT+'cover-casting-curse.png'});await L.W8(2400);
   R.forced[sp]=await st(p);if(sp==='curse')await p.screenshot({path:OUT+'cover-cursed.png'})}
 R.frozenSwap=await p.evaluate(()=>{for(let c=0;c<8;c++)for(let r=0;r<8;r++){const g=RS.grid[c][r];if(g&&g.ice&&g.st==='idle'){const c2=c<7?c+1:c-1;const ok=trySwap(c,r,c2,r);return {tried:[c,r,c2,r],accepted:ok}}}return 'no ice'});
 // counter test
 R.counter=await p.evaluate(async()=>{RS.duel.set({hp:800});RS.duel.cast('bolt');const D=RS.duel.D;await new Promise(r=>setTimeout(r,300));const n0=D.ctrN;for(let k=0;k<4;k++){RS.duel.D.cast&&0;}
   // deal damage via real projectiles by simulating scoring
   for(let k=0;k<6;k++)addScore(300,3,3,PAL[0][4]);await new Promise(r=>setTimeout(r,1500));return {before:n0,after:D.ctrN,cast:D.cast&&D.cast.sp}});
 await p.screenshot({path:OUT+'cover-after-counter.png'});
 // ===== 3. cover: full LOSS (idle vs Archon) =====
 await p.evaluate(()=>RS.duel.start(6));const t0=Date.now();
 for(let i=0;i<300;i++){await L.W8(1000);s=await st(p);if(s.over)break}
 R.coverLose={secs:(Date.now()-t0)/1000,final:s};await L.W8(3200);await p.screenshot({path:OUT+'cover-defeat.png'});R.loseP=await st(p);
 R.save=await p.evaluate(()=>JSON.parse(localStorage.getItem('runeshatter')).duel);
 // relayout: rotate cover to landscape live
 await p.evaluate(()=>RS.duel.start(1));await L.W8(2500);await p.setViewport({width:915,height:412,deviceScaleFactor:2.2,isMobile:true,hasTouch:true});await L.W8(800);await p.screenshot({path:OUT+'cover-landscape.png'});
 await p.setViewport(VP.inner);await L.W8(800);await p.screenshot({path:OUT+'cover-to-inner-live.png'});
 // background pause
 R.vis=await p.evaluate(async()=>{const D=RS.duel.D;const m0=D.mp,t0=D.t;document.dispatchEvent(new Event('visibilitychange'));return {t0}});
 await p.close();
 // ===== 4. inner (sq) & pc: win vs Bramble with real play, screenshots =====
 for(const vp of ['inner','pc']){p=await page(vp);await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('runeshatter')||'{}');s.duel={won:3,best:{pip:61,bramble:88,vane:120}};localStorage.setItem('runeshatter',JSON.stringify(s))});await p.reload({waitUntil:'load'});await L.W8(700);
  await p.click('#mDuel');await L.W8(500);await p.screenshot({path:OUT+vp+'-ladder.png'});await p.click('.lad[data-i="3"]');await L.W8(2600);await bot(p);let sh=0;
  for(let i=0;i<600;i++){await L.W8(500);s=await st(p);if(s.cast&&!sh){sh=1;await L.W8(600);await p.screenshot({path:OUT+vp+'-telegraph.png'})}if(i===20)await p.screenshot({path:OUT+vp+'-midduel.png'});if(s.over)break}
  await L.W8(3200);await p.screenshot({path:OUT+vp+'-end.png'});R[vp]=s;await p.close()}
 R.errs=errs;console.log(JSON.stringify(R,null,1));await br.close();process.exit(0)})();
