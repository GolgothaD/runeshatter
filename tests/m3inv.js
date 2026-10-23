const L=require('./m3lib');
(async()=>{const port=L.serve();const b=await L.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.setViewport({width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await pg.goto('http://localhost:'+port+'/',{waitUntil:'load'});await L.W8(500);await pg.tap('[data-mode=zen]');await L.W8(300);
await pg.evaluate(()=>{const N=8;window.T={fails:[],revs:0};window.__rv=s=>{T.revs++;const g=RS.grid;
 // a originally at (s.c2,s.r2), b at (s.c1,s.r1)
 if(g[s.c2][s.r2]!==s.a||g[s.c1][s.r1]!==s.b||s.a.x!==s.c2||s.a.y!==s.r2||s.b.x!==s.c1||s.b.y!==s.r1)T.fails.push(JSON.stringify([s.c1,s.r1,s.c2,s.r2,s.a.x,s.a.y,s.b.x,s.b.y]))};
 window.snap=()=>RS.grid.map((col,c)=>col.map((g,r)=>g?[g.t,g.sp,g.x===c&&g.y===r?1:0,g.st]:null));
 window.idleG=g=>g&&g.st==='idle';
 window.wouldMatch=(c,r,t,ex)=>{const G=RS.grid;const s=(a,b)=>{if(a<0||b<0||a>=N||b>=N)return false;if(a===ex[0]&&b===ex[1])return false;const g=G[a][b];return g&&g.t===t&&g.sp!==3&&(g.st!=='clear')};let h=1;for(let k=c-1;s(k,r);k--)h++;for(let k=c+1;s(k,r);k++)h++;let v=1;for(let k=r-1;s(c,k);k--)v++;for(let k=r+1;s(c,k);k++)v++;return h>=3||v>=3};
 window.invalidPairs=(strict)=>{const G=RS.grid,out=[],used=new Set();const cells=[];for(let c=0;c<N;c++)for(let r=0;r<N;r++)cells.push([c,r]);cells.sort(()=>Math.random()-.5);
  for(const [c,r] of cells){const d=Math.random()<.5?[1,0]:[0,1];const c2=c+d[0],r2=r+d[1];if(c2>=N||r2>=N)continue;const a=G[c][r],b=G[c2][r2];if(!idleG(a)||!idleG(b)||a.sp||b.sp||a.t===b.t)continue;
   if(used.has(c+','+r)||used.has(c2+','+r2))continue;
   if(wouldMatch(c2,r2,a.t,[c,r])||wouldMatch(c,r,b.t,[c2,r2]))continue;
   if(strict){// no non-idle gems near (could fall into place)
     let near=false;for(let dc=-3;dc<=3;dc++)for(let dr=-3;dr<=3;dr++){const q=G[c+dc]&&G[c+dc][r+dr];if(q&&q.st!=='idle')near=true}if(near)continue}
   used.add(c+','+r);used.add(c2+','+r2);out.push([c,r,c2,r2])}return out}});
let done=0,settledOK=0,settledBad=[];
// phase 1: settled boards, batches; full board compare
while(done<300){await pg.waitForFunction(()=>RS.settled(),{timeout:15000});
 const r=await pg.evaluate(()=>{const before=JSON.stringify(snap());const ps=invalidPairs(false).slice(0,10);let n=0;for(const p of ps)if(RS.swap(...p))n++;return {before,n}});
 await pg.waitForFunction(()=>RS.settled(),{timeout:15000});await L.W8(50);
 const after=await pg.evaluate(()=>JSON.stringify(snap()));if(after===r.before)settledOK+=r.n;else settledBad.push(r.n);done+=r.n;if(!r.n)await pg.evaluate(()=>RS.build({}))}
// phase 2: mid-cascade
let mid=0,midDuring=0;
while(mid<200){await pg.waitForFunction(()=>RS.settled(),{timeout:15000});
 await pg.evaluate(()=>{const m=RS.findMoves(RS.grid);if(m.length){const x=m[0];RS.swap(...(Array.isArray(x)?x:[x.c1,x.r1,x.c2,x.r2]))}});
 for(let k=0;k<6;k++){await L.W8(90);const r=await pg.evaluate(()=>{const st=RS.state();const ps=invalidPairs(true).slice(0,4);let n=0;for(const p of ps)if(RS.swap(...p))n++;return {n,busy:st.fall+st.clear+st.swap}});mid+=r.n;if(r.busy)midDuring+=r.n}}
await pg.waitForFunction(()=>RS.settled(),{timeout:15000});
const T=await pg.evaluate(()=>T);
console.log(JSON.stringify({settledSwaps:done,settledOK,settledBad,mid,midDuring,reverts:T.revs,fails:T.fails.slice(0,5),nfail:T.fails.length,errs}));process.exit(0)})();
