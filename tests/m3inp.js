const L=require('./m3lib');
(async()=>{const port=L.serve();const b=await L.launch();const R={};
for(const mode of ['mouse-drag','mouse-click','touch','keys','pad']){
const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));const mob=mode==='touch';
await pg.setViewport({width:mob?412:1920,height:mob?915:1080,isMobile:mob,hasTouch:mob,deviceScaleFactor:1});
await pg.evaluateOnNewDocument(()=>{const P={id:'Xbox',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),timestamp:0};navigator.getGamepads=()=>[P];window.__press=async(i,ms=90)=>{P.buttons[i]={pressed:true,value:1};await new Promise(r=>setTimeout(r,ms));P.buttons[i]={pressed:false,value:0};await new Promise(r=>setTimeout(r,ms))}});
await pg.goto('http://localhost:'+port+'/',{waitUntil:'load'});await L.W8(400);await pg.evaluate(()=>{RS.start('zen');document.getElementById('ov').classList.remove('show')});await pg.evaluate(()=>{curP=null;paused=false});
await pg.waitForFunction(()=>RS.settled(),{timeout:15000});
const res=[];
for(let k=0;k<6;k++){
 const p=await pg.evaluate(()=>{const N=8,G=RS.grid;const wm=(c,r,t,ex)=>{const s=(a,b)=>a>=0&&b>=0&&a<N&&b<N&&!(a===ex[0]&&b===ex[1])&&G[a][b].t===t;let h=1;for(let k=c-1;s(k,r);k--)h++;for(let k=c+1;s(k,r);k++)h++;let v=1;for(let k=r-1;s(c,k);k--)v++;for(let k=r+1;s(c,k);k++)v++;return h>=3||v>=3};
  for(let i=0;i<500;i++){const c=1+(Math.random()*6|0),r=1+(Math.random()*6|0),d=[[1,0],[0,1],[-1,0],[0,-1]][Math.random()*4|0];const c2=c+d[0],r2=r+d[1];const a=G[c][r],b=G[c2][r2];if(a.t===b.t||a.sp||b.sp)continue;if(wm(c2,r2,a.t,[c,r])||wm(c,r,b.t,[c2,r2]))continue;
  const bb=document.getElementById('board').getBoundingClientRect();window.S0=JSON.stringify(G.map(col=>col.map(g=>[g.t,g.sp])));return {c,r,c2,r2,x:bb.x,y:bb.y,s:bb.width/216}}});
 const P=(c,r)=>[p.x+(24+24*c)*p.s,p.y+(24+24*r)*p.s];const [ax,ay]=P(p.c,p.r),[bx,by]=P(p.c2,p.r2);
 if(mode==='mouse-drag'){await pg.mouse.move(ax,ay);await pg.mouse.down();for(let i=1;i<=6;i++)await pg.mouse.move(ax+(bx-ax)*i/6,ay+(by-ay)*i/6);await pg.mouse.up()}
 if(mode==='mouse-click'){await pg.mouse.click(ax,ay);await L.W8(60);await pg.mouse.click(bx,by)}
 if(mode==='touch'){await pg.touchscreen.touchStart(ax,ay);for(let i=1;i<=6;i++){await pg.touchscreen.touchMove(ax+(bx-ax)*i/6,ay+(by-ay)*i/6)}await pg.touchscreen.touchEnd()}
 if(mode==='keys'||mode==='pad'){await pg.evaluate(p=>{cur.show=true;cur.c=p.c;cur.r=p.r;held=false;sel=null},p);const dk={'1,0':'ArrowRight','-1,0':'ArrowLeft','0,1':'ArrowDown','0,-1':'ArrowUp'}[(p.c2-p.c)+','+(p.r2-p.r)];
  if(mode==='keys'){await pg.keyboard.press('Space');await pg.keyboard.press(dk)}else{const bi={ArrowUp:12,ArrowDown:13,ArrowLeft:14,ArrowRight:15}[dk];await pg.evaluate(()=>__press(0));await pg.evaluate(i=>__press(i),bi)}}
 const accepted=await pg.evaluate(()=>RS.state().swap>0||!RS.settled());
 await L.W8(120);if(k===0)await pg.screenshot({path:'/workspace/qa/match3/inv-'+mode+'.png',clip:{x:p.x,y:p.y,width:216*p.s,height:216*p.s}});
 await pg.waitForFunction(()=>RS.settled(),{timeout:15000});
 res.push(accepted&&await pg.evaluate(()=>JSON.stringify(RS.grid.map(col=>col.map(g=>[g.t,g.sp])))===S0&&RS.grid.every((col,c)=>col.every((g,r)=>g.x===c&&g.y===r))));
}
R[mode]={res,errs};await pg.close()}
console.log(JSON.stringify(R));process.exit(0)})();
