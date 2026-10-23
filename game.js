'use strict';
// ===== Runeshatter =====
const N=8,CS=24,M=12,W=N*CS+M*2;
const $=id=>document.getElementById(id);
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const bay=(x,y)=>BAYER[(y&3)*4+(x&3)];
const rnd=(a,b)=>a+Math.random()*(b-a);
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const NAMES=['Fire','Ice','Arcane','Nature','Storm','Shadow','Light'];
const PAL=[
 ['#3a0a12','#8c1a1a','#d8402a','#ff8a3a','#ffe08a'],
 ['#0a2240','#1d5f9e','#3fa9e8','#9fe4ff','#f0fdff'],
 ['#2c0838','#7a1d8c','#c43fd4','#f08cf0','#ffe0ff'],
 ['#0b2a12','#1f6b2a','#3fb043','#9ae86a','#eaffc0'],
 ['#3a2a05','#8a6a10','#e0b81c','#ffe85a','#fffbd0'],
 ['#08081a','#24224a','#46428a','#8078d0','#d6d0ff'],
 ['#3a3026','#8a7c6a','#d6cfc0','#fff6e0','#ffffff']];
const AB=Math.abs,SQ=Math.sqrt;
const SHAPES=[
 (x,y)=>Math.max(AB(x),AB(y),(AB(x)+AB(y))/1.414)/.86,
 (x,y)=>(AB(x)*1.25+AB(y))/.98,
 (x,y)=>Math.max(AB(x),AB(x)*.5+AB(y)*.866)/.86,
 (x,y)=>SQ(x*x+y*y)/.86,
 (x,y)=>{y-=.17;return Math.max(y,-.866*x-.5*y,.866*x-.5*y)/.5},
 (x,y)=>Math.max(AB(x),AB(y),(AB(x)+AB(y))*.74)/.8,
 (x,y)=>Math.min((SQ(AB(x))+SQ(AB(y)))/1.0,SQ(x*x+y*y)/.62)];
const GLYPH=[
 ['..#..','.#.#.','.#.#.','#...#','.###.'],
 ['..#..','#.#.#','.###.','#.#.#','..#..'],
 ['.###.','#...#','#.#.#','#...#','.###.'],
 ['..#..','.###.','#.#.#','..#..','..#..'],
 ['...#.','..#..','.###.','..#..','.#...'],
 ['#...#','.#.#.','..#..','.#.#.','#...#'],
 ['..#..','..#..','#####','..#..','..#..']];
const L3=(()=>{const v=[-.45,-.62,.64],l=Math.hypot(...v);return v.map(a=>a/l)})();
function gemSprite(t,white){
 const c=mk(CS,CS),x=c.getContext('2d'),im=x.createImageData(CS,CS),d=im.data,F=SHAPES[t],P=PAL[t].map(hex);
 const nx=p=>(p+.5-12)/11,ins=(px,py)=>px>=0&&py>=0&&px<CS&&py<CS&&F(nx(px),nx(py))<1;
 for(let py=0;py<CS;py++)for(let px=0;px<CS;px++){
  const X=nx(px),Y=nx(py),o=(py*CS+px)*4;
  if(!ins(px,py)){if(ins(px-1,py-1)&&!white){d[o+3]=110}continue}
  const f=F(X,Y);let b;
  if(f<.52&&t!==3){b=.6+(-X-Y)*.25}
  else{const e=.02,gx=F(X+e,Y)-F(X-e,Y),gy=F(X,Y+e)-F(X,Y-e);let a=Math.atan2(gy,gx);a=Math.round(a/(Math.PI/4))*(Math.PI/4);
   const k=t===3?Math.min(.95,f*.9):.72,n=[Math.cos(a)*k,Math.sin(a)*k,SQ(1-k*k)];b=n[0]*L3[0]+n[1]*L3[1]+n[2]*L3[2];b=b*.8+.18}
  let i=Math.floor(b*4+bay(px,py)*.9-.2);i=Math.max(1,Math.min(4,i));
  const gx=px-10,gy=py-10;if(f<.52&&gx>=0&&gy>=0&&gx<5&&gy<5&&GLYPH[t][gy][gx]==='#')i=i>2?1:4;
  if(!ins(px-1,py)||!ins(px+1,py)||!ins(px,py-1)||!ins(px,py+1))i=0;
  let col=P[i];if((X+.4)**2+(Y+.42)**2<.016&&i)col=[255,255,255];
  if(white)col=[255,255,255];
  d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255}
 x.putImageData(im,0,0);return c}
function glowSprite(t,colr){
 const c=mk(CS+8,CS+8),x=c.getContext('2d'),F=SHAPES[t];x.fillStyle=colr;
 const ins=(px,py)=>{const X=(px+.5-12)/11,Y=(py+.5-12)/11;return F(X,Y)<1};
 for(let py=-4;py<CS+4;py++)for(let px=-4;px<CS+4;px++){if(ins(px,py))continue;let near=9;
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(ins(px+dx,py+dy))near=Math.min(near,Math.max(AB(dx),AB(dy)));
  if(near<=1||(near<=2&&bay(px,py)<.6)||(near===3&&bay(px,py)<.25))x.fillRect(px+4,py+4,1,1)}
 return c}
function orbFrames(){const fr=[];for(let k=0;k<16;k++){const c=mk(CS,CS),x=c.getContext('2d'),im=x.createImageData(CS,CS),d=im.data;
 for(let py=0;py<CS;py++)for(let px=0;px<CS;px++){const X=px+.5-12,Y=py+.5-12,r=Math.hypot(X,Y);if(r>10.5)continue;const o=(py*CS+px)*4;
  let col;if(r>9.6)col=[40,8,60];else{const a=Math.atan2(Y,X);const h=((a/(2*Math.PI))*360+k*22.5+r*28+720)%360;
   const sh=Math.hypot(X+3.5,Y+3.5);let l=.62-r*.025+(sh<3?.25:0);l+=(bay(px,py)-.5)*.12;l=Math.round(l*6)/6;col=hsl(h,1,Math.min(.95,l));
   if(r<2.2)col=[255,255,255];}
  d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255}
 x.putImageData(im,0,0);fr.push(c)}return fr}
function hsl(h,s,l){h/=360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return [f(0),f(8),f(4)]}
const SPR=PAL.map((_,t)=>gemSprite(t)),WSPR=PAL.map((_,t)=>gemSprite(t,true));
const GLOW={f:PAL.map((_,t)=>glowSprite(t,'#ff9a2a')),s:PAL.map((_,t)=>glowSprite(t,'#ffffff')),n:PAL.map((_,t)=>glowSprite(t,'#9fe8ff'))};
const ORB=orbFrames(),ORBG=glowSprite(3,'#ff7bff');
const DITH=[];for(let k=0;k<=16;k++){const c=mk(W,W),x=c.getContext('2d');x.fillStyle='#fff';for(let y=0;y<W;y++)for(let X=0;X<W;X++)if(bay(X,y)<k/16)x.fillRect(X,y,1,1);DITH.push(c)}
// pixel font 3x5
const FONT={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','+':'000010111010000','x':'000101010101000'};
function ptext(ctx,s,x,y,col,sc){sc=sc||1;const w=s.length*4*sc-sc;x=Math.round(x-w/2);y=Math.round(y);
 ctx.fillStyle='#000';for(let p=0;p<2;p++){for(let i=0;i<s.length;i++){const g=FONT[s[i]];if(!g)continue;for(let k=0;k<15;k++)if(g[k]==='1'){const gx=x+(i*4+k%3)*sc,gy=y+((k/3)|0)*sc;if(p===0){ctx.fillRect(gx-1,gy-1,sc+2,sc+2)}else ctx.fillRect(gx,gy,sc,sc)}}ctx.fillStyle=col}}

// ===== settings & save =====
const SK='runeshatter';let SAVE={};try{SAVE=JSON.parse(localStorage.getItem(SK)||'{}')}catch(e){}
SAVE.best=SAVE.best||{classic:0,zen:0,lightning:0};SAVE.lvl=SAVE.lvl||{classic:0,zen:0};SAVE.set=Object.assign({snd:1,mus:1,shake:1},SAVE.set||{});
const persist=()=>{try{localStorage.setItem(SK,JSON.stringify(SAVE))}catch(e){}};

// ===== audio =====
let AC=null,MG,SG,MUG;
function audio(){if(AC){if(AC.state==='suspended')AC.resume();return}try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
 MG=AC.createGain();MG.gain.value=.8;MG.connect(AC.destination);SG=AC.createGain();SG.gain.value=SAVE.set.snd?.55:0;SG.connect(MG);MUG=AC.createGain();MUG.gain.value=SAVE.set.mus?.22:0;MUG.connect(MG);startMusic()}
function tone(f,dur,type,vol,dest,when,slide){if(!AC)return;const t=(when||AC.currentTime),o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.2,t+.005);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(dest||SG);o.start(t);o.stop(t+dur+.02)}
let NB=null;function noise(dur,vol,fq,q,slide){if(!AC)return;if(!NB){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(fq||800,t);if(slide)f.frequency.exponentialRampToValueAtTime(slide,t+dur);f.Q.value=q||1;
 g.gain.setValueAtTime(vol||.3,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(SG);s.start(t);s.stop(t+dur)}
const SCALE=[0,2,3,5,7,8,10];const nf=n=>220*Math.pow(2,n/12);
const SFX={
 swap(){tone(660,.06,'square',.08);tone(990,.05,'square',.05,null,AC&&AC.currentTime+.03)},
 bad(){tone(200,.12,'square',.09,null,null,120)},
 match(ch){if(!AC)return;const b=Math.min(ch,10);const s=SCALE[b%7]+12*Math.floor(b/7);const t=AC.currentTime;tone(nf(s+12),.18,'triangle',.18,null,t);tone(nf(s+19),.16,'square',.05,null,t+.04);tone(nf(s+24),.25,'sine',.08,null,t+.07)},
 land(){tone(120,.03,'triangle',.05)},
 make(){if(!AC)return;const t=AC.currentTime;[0,4,7,12,16].forEach((n,i)=>tone(nf(n+12),.25,'square',.06,null,t+i*.04))},
 boom(){noise(.5,.5,600,.7,90);tone(110,.35,'sawtooth',.12,null,null,40)},
 beam(){noise(.45,.3,2400,2,300);tone(1200,.3,'square',.06,null,null,200)},
 zap(){noise(.12,.25,4000,3,1500);tone(rnd(900,1600),.08,'sawtooth',.05,null,null,300)},
 nova(){noise(1.1,.6,300,.5,60);tone(55,.9,'sawtooth',.15,null,null,30);if(AC){const t=AC.currentTime;[0,7,12,19,24].forEach((n,i)=>tone(nf(n),.6,'triangle',.08,null,t+i*.06))}},
 level(){if(!AC)return;const t=AC.currentTime;[0,3,7,12,15,19,24].forEach((n,i)=>tone(nf(n+12),.35,'square',.07,null,t+i*.07));tone(nf(0),1.2,'triangle',.15,null,t)},
 shuffle(){if(!AC)return;const t=AC.currentTime;for(let i=0;i<8;i++)tone(nf(24-i*2),.08,'square',.05,null,t+i*.03)},
 tick(){tone(1400,.03,'square',.05)}};
function sfx(n,a){if(!AC||!SAVE.set.snd)return;try{SFX[n](a)}catch(e){}}
let musT=0,musStep=0;const CH=[[0,3,7],[-4,0,3],[-2,2,5],[-5,-2,2]];
function startMusic(){musT=AC.currentTime+.1;setInterval(()=>{if(!AC)return;while(musT<AC.currentTime+.4){const bar=Math.floor(musStep/16)%4,st=musStep%16,ch=CH[bar];
 if(st===0){ch.forEach(n=>{const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=nf(n-12);g.gain.setValueAtTime(0,musT);g.gain.linearRampToValueAtTime(.12,musT+.6);g.gain.linearRampToValueAtTime(0,musT+3.1);o.connect(g);g.connect(MUG);o.start(musT);o.stop(musT+3.2)})}
 if(st%2===0){const n=ch[(st/2)%3]+(st%8<4?12:24);tone(nf(n),.35,'sine',.09,MUG,musT)}
 if(st===6||st===14)tone(nf(ch[0]+31),.5,'triangle',.03,MUG,musT);
 musT+=.2;musStep++}},120)}

// ===== board state =====
let grid,G,gid=1,now=0;
const FX=[],PT=[];
function newGem(t,y,sp){return {t,sp:sp||0,st:'fall',x:0,y,vy:0,ct:0,id:gid++,mv:0,born:now,pulse:0,sq:0}}
function cellTypeOk(b,c,r,t){return !((c>=2&&b[c-1][r]===t&&b[c-2][r]===t)||(r>=2&&b[c][r-1]===t&&b[c][r-2]===t))}
function freshTypes(){for(let tries=0;tries<200;tries++){const b=[];for(let c=0;c<N;c++){b.push([]);for(let r=0;r<N;r++){let t,k=0;do{t=(Math.random()*7)|0}while(!cellTypeOk(b,c,r,t)&&++k<30);b[c][r]=t}}
 if(findMoves(b.map(col=>col.map(t=>({t,sp:0})))).length>=3)return b}}
function startGame(mode,load){
 G={mode,score:0,level:1,prog:0,chain:0,time:60,over:false,idle:0,hint:null,shake:0,lastAct:0,settledFor:0,made:0,best:0,biggest:0};
 grid=[];const tb=load?null:freshTypes();
 for(let c=0;c<N;c++){grid.push([]);for(let r=0;r<N;r++){const t=load?load.b[c][r]:tb[c][r];const g=newGem(t%10,r-N-1-c*.35-(N-r)*.2,(t/10)|0);g.x=c;g.st='fall';grid[c].push(g)}}
 if(load){G.score=load.score;G.level=load.level;G.prog=load.prog}
 sel=null;FX.length=0;PT.length=0;setBg(G.level);$('bar').classList.toggle('time',mode==='lightning');hud();hideOv();paused=false;audio();
}
const need=L=>1500+L*900;
function isSettled(){if(SW.length)return false;for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c][r];if(!g||g.st!=='idle')return false}return !FX.some(f=>f.block)}
const SW=[];// active swaps
function at(c,r){return c>=0&&r>=0&&c<N&&r<N?grid[c][r]:null}
function idle(g){return g&&g.st==='idle'}
function lineAt(c,r,t){// would gem type t at (c,r) match with idle neighbours
 const same=(cc,rr)=>{const g=at(cc,rr);return idle(g)&&g.sp!==3&&g.t===t};
 let h=1;for(let k=c-1;same(k,r);k--)h++;for(let k=c+1;same(k,r);k++)h++;
 let v=1;for(let k=r-1;same(c,k);k--)v++;for(let k=r+1;same(c,k);k++)v++;return h>=3||v>=3}
function trySwap(c1,r1,c2,r2){
 if(!G||G.over||paused)return false;const a=at(c1,r1),b=at(c2,r2);if(!idle(a)||!idle(b))return false;if(AB(c1-c2)+AB(r1-r2)!==1)return false;
 grid[c1][r1]=b;grid[c2][r2]=a;a.st=b.st='swap';SW.push({a,b,c1,r1,c2,r2,t:0,back:false});sfx('swap');G.idle=0;G.hint=null;G.lastAct=now;return true}
function endSwap(s){const {a,b}=s;a.x=s.c2;a.y=s.r2;b.x=s.c1;b.y=s.r1;
 if(s.back){a.st=b.st='idle';return}
 a.st=b.st='idle';a.mv=b.mv=now+1;
 if(a.sp===3||b.sp===3||(a.sp&&b.sp)){comboSpell(a,s.c2,s.r2,b,s.c1,s.r1);return}
 if(lineAt(s.c2,s.r2,a.t)||lineAt(s.c1,s.r1,b.t)){if(G.chain<1)G.chain=0;return}
 grid[s.c1][s.r1]=a;grid[s.c2][s.r2]=b;a.st=b.st='swap';SW.push({a:b,b:a,c1:s.c2,r1:s.r2,c2:s.c1,r2:s.r1,t:0,back:true,ac:s.c2});sfx('bad')}
// ===== effects =====
const cx=c=>M+c*CS+CS/2,cy=r=>M+r*CS+CS/2;
function burst(x,y,ramp,n,sp,opt){opt=opt||{};for(let i=0;i<n;i++){const a=Math.random()*6.283,v=rnd(sp*.3,sp);PT.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(opt.up||0),l:0,m:rnd(.35,.8)*(opt.life||1),ramp,s:Math.random()<(opt.big||.25)?(Math.random()<.3?3:2):1,g:opt.g==null?120:opt.g,dr:opt.dr||.96})}}
function shards(g,c,r){const ramp=[...PAL[g.t]].reverse();burst(cx(c),cy(r),['#ffffff',...ramp],14,70,{big:.4});FX.push({k:'ring',x:cx(c),y:cy(r),r:3,vr:70,l:0,m:.22,col:PAL[g.t][4]})}
function shake(v){if(SAVE.set.shake)G.shake=Math.max(G.shake,v)}
function flash(m,col,dens){FX.push({k:'flash',l:0,m,col:col||'#fff',d:dens||1})}
function hit(c,r,delay,src){const g=at(c,r);if(!g||g.st==='clear'||g.st==='swap')return 0;g.st='clear';g.ct=delay;g.cause=src||1;return 1}
const FIRE=['#ffffff','#fff2a0','#ffc030','#ff7a1a','#d02a10','#5a0e08'];
function detonate(g,c,r){const x=cx(c),y=cy(r);
 if(g.sp===1){sfx('boom');shake(4);flash(.12,'#ffb050',.6);burst(x,y,FIRE,70,140,{big:.5,g:40});FX.push({k:'ring',x,y,r:4,vr:180,l:0,m:.3,col:'#ffd060',w:2});FX.push({k:'fire',x,y,R:34,l:0,m:.45});
  for(let dc=-1;dc<=1;dc++)for(let dr=-1;dr<=1;dr++)if(dc||dr)hit(c+dc,r+dr,.06+(AB(dc)+AB(dr))*.03,2)}
 else if(g.sp===2){sfx('beam');shake(3);beams(c,r,0,PAL[g.t][3])}
 else if(g.sp===4){sfx('nova');shake(9);flash(.4,'#ffffff',1);for(let k=-1;k<=1;k++)beams(c+k,r+k,k?1:0,'#bff4ff',true);FX.push({k:'ring',x,y,r:4,vr:260,l:0,m:.5,col:'#ffffff',w:3});FX.push({k:'ring',x,y,r:2,vr:160,l:0,m:.6,col:'#9fe8ff',w:2});burst(x,y,['#ffffff','#e0fbff','#9fe8ff','#5aa8ff','#3a4aff','#1a1050'],140,200,{big:.5,g:20})}
 else if(g.sp===3){const ts=[];for(let cc=0;cc<N;cc++)for(let rr=0;rr<N;rr++){const q=grid[cc][rr];if(q&&q.st==='idle'&&q.sp!==3)ts.push(q.t)}orbStrike(c,r,ts.length?ts[(Math.random()*ts.length)|0]:0,0)}}
function beams(c,r,dl,col,big){if(r>=0&&r<N){FX.push({k:'beam',h:1,at:cy(r),l:-dl*.05,m:.45,col,w:big?7:5});for(let cc=0;cc<N;cc++)hit(cc,r,.04+AB(cc-c)*.035,2)}
 if(c>=0&&c<N){FX.push({k:'beam',h:0,at:cx(c),l:-dl*.05,m:.45,col,w:big?7:5});for(let rr=0;rr<N;rr++)hit(c,rr,.04+AB(rr-r)*.035,2)}
 burst(cx(Math.max(0,Math.min(7,c))),cy(Math.max(0,Math.min(7,r))),['#ffffff','#ffffff',col,col,'#4a2a8a'],40,160,{g:0,big:.3})}
function orbStrike(c,r,t,makeSp){const x=cx(c),y=cy(r);sfx('zap');shake(5);flash(.15,'#d07bff',.5);FX.push({k:'ring',x,y,r:3,vr:220,l:0,m:.45,col:'#ff9bff',w:2});burst(x,y,['#ffffff','#ffd0ff','#ff7bff','#a040ff','#4a10a0'],60,120,{g:0});
 const list=[];for(let cc=0;cc<N;cc++)for(let rr=0;rr<N;rr++){const q=grid[cc][rr];if(q&&q.t===t&&q.sp!==3&&q.st!=='clear'&&q.st!=='swap')list.push([cc,rr,q])}
 list.sort((p,q)=>Math.hypot(p[0]-c,p[1]-r)-Math.hypot(q[0]-c,q[1]-r));
 list.forEach(([cc,rr,q],i)=>{const d=.12+i*.055;if(makeSp&&!q.sp){q.sp=makeSp;q.pulse=1}FX.push({k:'arc',x1:x,y1:y,c:cc,r:rr,l:-i*.055,m:.45+(makeSp?.25:0),col:PAL[t][3],seed:Math.random()*1e4});hit(cc,rr,d+(makeSp?.3:0),3);setTimeout(()=>sfx('zap'),i*55)});
 const me=at(c,r);if(me&&me.sp===3&&me.st!=='clear'){me.sp=0;hit(c,r,.05+list.length*.055,3)}}
function comboSpell(a,ca,ra,b,cb,rb){// a moved to (ca,ra)
 G.chain=Math.max(G.chain,1);const sa=a.sp,sb=b.sp,x=cx(ca),y=cy(ra);
 if(sa===3&&sb===3){sfx('nova');shake(12);flash(.7,'#ffffff',1);a.sp=b.sp=0;FX.push({k:'ring',x,y,r:4,vr:300,l:0,m:.7,col:'#ff9bff',w:3});
  for(let c=0;c<N;c++)for(let r=0;r<N;r++){const d=Math.hypot(c-ca,r-ra);const q=grid[c][r];if(q&&q.sp)q.sp=0;hit(c,r,.1+d*.07,4);if(Math.random()<.5)FX.push({k:'arc',x1:x,y1:y,c,r,l:-d*.07,m:.4,col:hsl(c*40+r*20,1,.7).reduce((s,v)=>s+v.toString(16).padStart(2,'0'),'#'),seed:Math.random()*1e4})}
  addScore(5000,ca,ra);banner('ARCANE CATACLYSM');return}
 if(sa===3||sb===3){const orb=sa===3?a:b,o=sa===3?[ca,ra]:[cb,rb],oth=sa===3?b:a,oc=sa===3?[cb,rb]:[ca,ra];orb.sp=0;
  if(oth.sp){const ms=oth.sp;oth.sp=0;banner(['','FLAME STORM','STAR STORM','','NOVA STORM'][ms]);orbStrike(o[0],o[1],oth.t,ms===4?2:ms);hit(oc[0],oc[1],.1,3);hit(o[0],o[1],.08,3)}
  else{orbStrike(o[0],o[1],oth.t,0);hit(o[0],o[1],.05,3)}return}
 // two non-orb specials
 const s=[sa,sb].sort().join('');a.sp=b.sp=0;hit(ca,ra,.02,2);hit(cb,rb,.04,2);
 if(s==='11'){sfx('boom');sfx('boom');shake(8);flash(.25,'#ffb050',.8);burst(x,y,FIRE,140,200,{big:.6,g:30});FX.push({k:'ring',x,y,r:4,vr:240,l:0,m:.4,col:'#ffd060',w:3});FX.push({k:'fire',x,y,R:62,l:0,m:.6});
  for(let dc=-2;dc<=2;dc++)for(let dr=-2;dr<=2;dr++)hit(ca+dc,ra+dr,.05+Math.max(AB(dc),AB(dr))*.05,2);banner('INFERNO');}
 else if(s==='22'){sfx('beam');shake(6);beams(ca,ra,0,PAL[a.t][3]);beams(cb,rb,1,PAL[b.t][3]);banner('CROSSFIRE')}
 else if(s==='12'){sfx('beam');sfx('boom');shake(8);for(let k=-1;k<=1;k++)beams(ca+k,ra+k,AB(k),'#ffb040',true);flash(.2,'#ffb050',.7);banner('BLAZING CROSS')}
 else {sfx('nova');shake(12);flash(.6,'#fff',1);for(let k=-2;k<=2;k++)beams(ca+k,ra+k,AB(k),'#bff4ff',true);FX.push({k:'ring',x,y,r:4,vr:300,l:0,m:.6,col:'#fff',w:3});burst(x,y,['#ffffff','#e0fbff','#9fe8ff','#5aa8ff','#3a4aff'],200,220,{g:10});banner('SUPERNOVA BURST')}}
// ===== matching =====
function findGroups(){const T=(c,r)=>{const g=grid[c][r];return idle(g)&&g.sp!==3?g.t:-1};
 const runs=[];for(let r=0;r<N;r++){let s=0;for(let c=1;c<=N;c++){if(c<N&&T(c,r)>=0&&T(c,r)===T(s,r))continue;if(c-s>=3&&T(s,r)>=0)runs.push({h:1,cells:Array.from({length:c-s},(_,i)=>[s+i,r])});s=c}}
 for(let c=0;c<N;c++){let s=0;for(let r=1;r<=N;r++){if(r<N&&T(c,r)>=0&&T(c,r)===T(c,s))continue;if(r-s>=3&&T(c,s)>=0)runs.push({h:0,cells:Array.from({length:r-s},(_,i)=>[c,s+i])});s=r}}
 const par=runs.map((_,i)=>i),fd=i=>par[i]===i?i:(par[i]=fd(par[i]));const own={};
 runs.forEach((ru,i)=>ru.cells.forEach(([c,r])=>{const k=c*8+r;if(own[k]!=null)par[fd(i)]=fd(own[k]);else own[k]=i}));
 const gs={};runs.forEach((ru,i)=>{const k=fd(i);(gs[k]=gs[k]||{runs:[],cells:new Map()}).runs.push(ru);ru.cells.forEach(([c,r])=>gs[k].cells.set(c*8+r,[c,r]))});return Object.values(gs)}
function resolveMatches(){const gs=findGroups();if(!gs.length)return;
 for(const gr of gs){const cells=[...gr.cells.values()],ml=Math.max(...gr.runs.map(r=>r.cells.length)),hv=gr.runs.some(r=>r.h)&&gr.runs.some(r=>!r.h);
  let sp=ml>=6||(hv&&gr.cells.size>=6)?4:ml>=5?3:hv?2:ml>=4?1:0;G.chain++;const t=grid[cells[0][0]][cells[0][1]].t;
  let spawn=null;if(sp){const cand=cells.map(([c,r])=>({c,r,g:grid[c][r]})).filter(o=>!o.g.sp).sort((p,q)=>q.g.mv-p.g.mv);if(cand.length)spawn=cand[0]}
  for(const [c,r] of cells){const g=grid[c][r];if(spawn&&spawn.c===c&&spawn.r===r)continue;g.st='clear';g.ct=.14;g.cause=1;if(spawn){g.toward=[spawn.c,spawn.r]}}
  if(spawn){const g=spawn.g;g.sp=sp;g.pulse=1;g.mv=0;sfx('make');G.made++;SAVE.forged=(SAVE.forged||0)+1;FX.push({k:'ring',x:cx(spawn.c),y:cy(spawn.r),r:2,vr:90,l:0,m:.35,col:sp===3?'#ff9bff':'#ffffff',w:2});burst(cx(spawn.c),cy(spawn.r),['#ffffff',...[...PAL[t]].reverse()],24,60,{g:0});
   if(G.mode==='lightning'){G.time=Math.min(99,G.time+3);popTxt(cx(spawn.c),cy(spawn.r)-12,'+3','#ffd060')}
   if(sp===3)banner('ARCANE ORB');else if(sp===4)banner('SUPERNOVA');}
  const base=[0,150,300,700,1200][sp]+cells.length*20;const cx0=cells.reduce((s,c)=>s+c[0],0)/cells.length,cy0=cells.reduce((s,c)=>s+c[1],0)/cells.length;
  addScore(base*Math.max(1,G.chain),cx0,cy0,PAL[t][4]);sfx('match',G.chain);
  if(G.chain>=3)showCombo(G.chain)}}
function addScore(p,c,r,col){G.score+=p*(G.mode==='lightning'?1:1);G.prog+=p;popTxt(cx(c),cy(r)-4,String(p),col||'#ffffff');
 if(G.mode!=='lightning'&&G.prog>=need(G.level)){G.prog-=need(G.level);G.level++;levelUp()}hud()}
function popTxt(x,y,s,col){FX.push({k:'txt',x,y,s,col,l:0,m:.9})}
// ===== update =====
let sel=null,paused=true;
function update(dt){now+=dt;if(!G)return;
 // swaps
 for(let i=SW.length-1;i>=0;i--){const s=SW[i];s.t+=dt/.16;const e=Math.min(1,s.t),k=e<.5?2*e*e:1-(-2*e+2)**2/2;
  s.a.x=s.c1+(s.c2-s.c1)*k;s.a.y=s.r1+(s.r2-s.r1)*k;s.b.x=s.c2+(s.c1-s.c2)*k;s.b.y=s.r2+(s.r1-s.r2)*k;if(s.t>=1){SW.splice(i,1);endSwap(s)}}
 // clears
 for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c][r];if(!g)continue;if(g.pulse>0)g.pulse=Math.max(0,g.pulse-dt*2.5);if(g.sq>0)g.sq=Math.max(0,g.sq-dt*6);
  if(g.st==='clear'){g.ct-=dt;if(g.ct<=0){grid[c][r]=null;shards(g,c,r);if(g.cause>1)addScoreQuiet(30*Math.max(1,G.chain));if(g.sp){const s=g.sp;detonate(g,c,r);g.sp=0;void s}}}}
 // gravity
 for(let c=0;c<N;c++){for(let pass=0;pass<N;pass++){let moved=false;for(let r=N-1;r>=1;r--){if(!grid[c][r]){const g=grid[c][r-1];if(g&&(g.st==='idle'||g.st==='fall')){grid[c][r]=g;grid[c][r-1]=null;g.st='fall';moved=true}}}
   if(!grid[c][0]){let top=0;for(let r=0;r<N;r++){const g=grid[c][r];if(g)top=Math.min(top,g.y)}const g=newGem(pick(c),Math.min(-1,top-1.05));g.x=c;g.vy=3;grid[c][0]=g;moved=true}if(!moved)break}}
 // falling
 for(let c=0;c<N;c++)for(let r=N-1;r>=0;r--){const g=grid[c][r];if(!g||g.st!=='fall')continue;g.vy=Math.min(16,g.vy+38*dt);g.y+=g.vy*dt;const b=at(c,r+1);if(b&&b.y-1<g.y)g.y=b.y-1;g.x=c;
  if(g.y>=r){g.y=r;g.st='idle';g.mv=now;if(g.vy>6)g.sq=1;g.vy=0;if(Math.random()<.3)sfx('land')}}
 resolveMatches();
 // settle bookkeeping
 const st=isSettled();if(st){G.settledFor+=dt;if(G.settledFor>.25&&G.chain){if(G.chain>=6)banner(G.chain>=10?'UNSTOPPABLE!':'MAGNIFICENT!');G.chain=0}
  G.idle+=dt;if(G.settledFor>.3&&!G.checked){G.checked=1;const mv=findMoves(grid.map(col=>col.map(g=>({t:g.t,sp:g.sp}))));G.moves=mv;if(!mv.length){if(G.mode==='classic')gameOver('Out of Moves');else reshuffle()}}
  if(G.idle>(G.mode==='zen'?5:9)&&!G.hint&&G.moves&&G.moves.length)G.hint=G.moves[(Math.random()*G.moves.length)|0]}
 else{G.settledFor=0;G.checked=0;G.hint=null;G.idle=0}
 if(G.mode==='lightning'&&!G.over){const p=G.time;G.time-=dt;if(Math.ceil(G.time)!==Math.ceil(p)&&G.time<10)sfx('tick');if(G.time<=0){G.time=0;gameOver("Time's Up")}hud()}
 if(G.shake>0)G.shake=Math.max(0,G.shake-dt*30);
 // particles
 for(let i=PT.length-1;i>=0;i--){const p=PT[i];p.l+=dt;if(p.l>=p.m){PT.splice(i,1);continue}p.vy+=p.g*dt;p.vx*=p.dr;p.vy*=p.dr;p.x+=p.vx*dt;p.y+=p.vy*dt}
 if(PT.length>2500)PT.splice(0,PT.length-2500);
 for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.l+=dt;if(f.l>=f.m)FX.splice(i,1)}
 // ambient particles from specials
 for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c][r];if(!g||!g.sp||g.y<0)continue;const x=M+g.x*CS+12,y=M+g.y*CS+12;
  if((g.sp===1||g.sp===4)&&Math.random()<dt*22)PT.push({x:x+rnd(-8,8),y:y+rnd(0,6),vx:rnd(-6,6),vy:rnd(-30,-14),l:0,m:rnd(.3,.6),ramp:g.sp===4?['#ffffff','#bff4ff','#5aa8ff','#2a3a9a']:FIRE.slice(1),s:1,g:-10,dr:1});
  if(g.sp===3&&Math.random()<dt*10){const a=Math.random()*6.28;PT.push({x:x+Math.cos(a)*12,y:y+Math.sin(a)*12,vx:-Math.cos(a)*14,vy:-Math.sin(a)*14,l:0,m:.6,ramp:['#ffffff','#ff9bff','#a040ff'],s:1,g:0,dr:1})}}}
function addScoreQuiet(p){G.score+=p;G.prog+=p;if(G.mode!=='lightning'&&G.prog>=need(G.level)){G.prog-=need(G.level);G.level++;levelUp()}hud()}
function pick(c){// avoid too-easy instant matches sometimes
 return (Math.random()*7)|0}
function findMoves(b){const mv=[],T=(c,r)=>b[c]&&b[c][r]?b[c][r]:null;
 const runOK=(c,r,t,gr)=>{if(t<0)return false;const s=(cc,rr)=>{const q=gr(cc,rr);return q&&q.sp!==3&&q.t===t};let h=1;for(let k=c-1;s(k,r);k--)h++;for(let k=c+1;s(k,r);k++)h++;let v=1;for(let k=r-1;s(c,k);k--)v++;for(let k=r+1;s(c,k);k++)v++;return h>=3||v>=3};
 for(let c=0;c<N;c++)for(let r=0;r<N;r++)for(const [dc,dr] of [[1,0],[0,1]]){const c2=c+dc,r2=r+dr;if(c2>=N||r2>=N)continue;const a=T(c,r),q=T(c2,r2);if(!a||!q)continue;
  if(a.sp===3||q.sp===3||(a.sp&&q.sp)){mv.push([c,r,c2,r2]);continue}
  const gr=(cc,rr)=>cc===c&&rr===r?q:cc===c2&&rr===r2?a:T(cc,rr);if(runOK(c,r,q.t,gr)||runOK(c2,r2,a.t,gr))mv.push([c,r,c2,r2])}
 return mv}
function reshuffle(){sfx('shuffle');banner('RESHUFFLE');const tb=freshTypes();const sps=[];for(let c=0;c<N;c++)for(let r=0;r<N;r++)if(grid[c][r].sp)sps.push(grid[c][r].sp);
 for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c][r];g.t=tb[c][r];g.sp=0;g.pulse=1;burst(cx(c),cy(r),['#fff',...[...PAL[g.t]].reverse()],3,40,{g:0})}
 sps.forEach(s=>{const c=(Math.random()*8)|0,r=(Math.random()*8)|0;if(!grid[c][r].sp)grid[c][r].sp=s});flash(.3,'#c07bff',.5);G.checked=0}
function levelUp(){sfx('level');banner('LEVEL '+G.level);flash(.4,'#ffe08a',.35);shake(4);for(let i=0;i<6;i++)burst(rnd(30,186),rnd(30,186),['#ffffff','#fff2a0','#ffd060','#c07bff','#5a2aa0'],30,120,{g:20});setBg(G.level);
 if(G.mode!=='lightning'){SAVE.lvl[G.mode]=Math.max(SAVE.lvl[G.mode]||0,G.level);persist()}}
function gameOver(t){if(G.over)return;G.over=true;SAVE.best[G.mode]=Math.max(SAVE.best[G.mode]||0,G.score);if(G.mode!=='lightning')SAVE['save_'+G.mode]=null;persist();
 setTimeout(()=>{$('oT').textContent=t;$('oS').textContent='Score: '+G.score.toLocaleString()+(G.mode!=='lightning'?'  ·  Level '+G.level:'');$('oB').textContent='Best: '+SAVE.best[G.mode].toLocaleString();showP('pOver')},900)}
function saveGame(){if(!G||G.over||G.mode==='lightning')return;const b=grid.map(col=>col.map(g=>g?(g.t+10*(g.st==='clear'?0:g.sp)):(Math.random()*7|0)));
 SAVE['save_'+G.mode]={b,score:G.score,level:G.level,prog:G.prog};SAVE.best[G.mode]=Math.max(SAVE.best[G.mode]||0,G.score);persist()}
// ===== render =====
const BC=$('board'),bx=BC.getContext('2d');bx.imageSmoothingEnabled=false;
const FRAME=(()=>{const c=mk(W,W),x=c.getContext('2d');
 x.fillStyle='#2a160a';x.fillRect(0,0,W,W);x.fillStyle='#5e3d1a';x.fillRect(2,2,W-4,W-4);x.fillStyle='#b8893a';x.fillRect(4,4,W-8,W-8);x.fillStyle='#ffe08a';x.fillRect(5,5,W-10,1);x.fillRect(5,5,1,W-10);x.fillStyle='#6a4214';x.fillRect(6,6,W-12,W-12);x.fillStyle='#1a0c05';x.fillRect(M-2,M-2,N*CS+4,N*CS+4);
 for(let c=0;c<N;c++)for(let r=0;r<N;r++){x.fillStyle=(c+r)%2?'#1c1230':'#251840';x.fillRect(M+c*CS,M+r*CS,CS,CS)}
 x.globalAlpha=.25;x.strokeStyle='#8a5cff';for(const rad of [90,70]){for(let a=0;a<6.283;a+=.02){const px=Math.round(W/2+Math.cos(a)*rad),py=Math.round(W/2+Math.sin(a)*rad);if(bay(px,py)<.7){x.fillStyle='#8a5cff';x.fillRect(px,py,1,1)}}}
 for(let k=0;k<6;k++){const a1=k*Math.PI/3,a2=a1+Math.PI*2/3;for(let s=0;s<=1;s+=.005){const px=Math.round(W/2+90*((1-s)*Math.cos(a1)+s*Math.cos(a2))),py=Math.round(W/2+90*((1-s)*Math.sin(a1)+s*Math.sin(a2)));x.fillRect(px,py,1,1)}}
 x.globalAlpha=1;for(const [px,py] of [[1,1],[W-11,1],[1,W-11],[W-11,W-11]]){x.fillStyle='#ffe08a';x.fillRect(px+2,px===1?py+2:py+2,6,6);x.fillStyle='#7b3cff';x.fillRect(px+4,py+4,2,2);x.fillStyle='#2a160a';x.fillRect(px+3,py+3,1,1)}
 return c})();
function line(x0,y0,x1,y1){x0|=0;y0|=0;x1|=0;y1|=0;const dx=AB(x1-x0),dy=-AB(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy,n=0;while(n++<600){bx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function srand(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
let cur={c:3,r:3,show:false},held=false;
function render(){const t=now;bx.setTransform(1,0,0,1,0,0);bx.globalAlpha=1;bx.globalCompositeOperation='source-over';bx.drawImage(FRAME,0,0);if(!G)return;
 bx.save();bx.beginPath();bx.rect(M,M,N*CS,N*CS);bx.clip();
 // hint
 if(G.hint){const [c1,r1,c2,r2]=G.hint;const a=(Math.sin(t*8)+1)/2;bx.fillStyle='#ffe08a';bx.globalAlpha=.3+a*.4;for(const [c,r] of [[c1,r1],[c2,r2]])bx.fillRect(M+c*CS+1,M+r*CS+1,CS-2,CS-2);bx.globalAlpha=1}
 // gems
 for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c][r];if(!g||g.y<-1)continue;let x=Math.round(M+g.x*CS),y=Math.round(M+g.y*CS);
  if(g.st==='clear'){const k=Math.max(0,g.ct);if(g.toward&&k<.14){const p=1-k/.14;x=Math.round(x+(g.toward[0]-c)*CS*p*.5);y=Math.round(y+(g.toward[1]-r)*CS*p*.5)}bx.drawImage(g.ct<.1?WSPR[g.t]:SPR[g.t],x,y);if(g.ct<.1){bx.globalAlpha=.6;bx.drawImage(GLOW.s[g.t],x-4,y-4);bx.globalAlpha=1}continue}
  if(g.sq>0){const s=Math.round(g.sq*2);bx.drawImage(SPR[g.t],x-s,y+s*2,CS+s*2,CS-s*2);continue}
  const sp=g.sp;
  if(sp===1){bx.globalAlpha=.55+.45*Math.sin(t*10+g.id);bx.drawImage(GLOW.f[g.t],x-4,y-4);bx.globalAlpha=1}
  if(sp===4){bx.globalAlpha=.6+.4*Math.sin(t*14);bx.drawImage(GLOW.n[g.t],x-4,y-4);bx.globalAlpha=1}
  if(sp===3){bx.globalAlpha=.5+.5*Math.sin(t*6);bx.drawImage(ORBG,x-4,y-4);bx.globalAlpha=1;bx.drawImage(ORB[((t*14)|0)%16],x,y)}
  else bx.drawImage(SPR[g.t],x,y);
  if(sp===2||sp===4){const L=6+Math.round(3*Math.sin(t*9+g.id)),cxp=x+12,cyp=y+12,diag=((t*3)|0)%2;bx.fillStyle='#ffffff';
   for(let i=2;i<L;i++){if(diag){bx.fillRect(cxp+i-1,cyp+i-1,1,1);bx.fillRect(cxp-i,cyp-i,1,1);bx.fillRect(cxp+i-1,cyp-i,1,1);bx.fillRect(cxp-i,cyp+i-1,1,1)}else{bx.fillRect(cxp+i-1,cyp-1,1,2);bx.fillRect(cxp-i,cyp-1,1,2);bx.fillRect(cxp-1,cyp+i-1,2,1);bx.fillRect(cxp-1,cyp-i,2,1)}}
   bx.fillRect(cxp-2,cyp-2,4,4);if(sp===4){bx.fillStyle='#bff4ff';bx.fillRect(cxp-3,cyp-1,6,2);bx.fillRect(cxp-1,cyp-3,2,6)}}
  if(sp===1){const f=((t*12)|0)%3;bx.fillStyle='#ffe08a';bx.fillRect(x+11,y+9-f,2,2);bx.fillStyle='#ff7a1a';bx.fillRect(x+10,y+11,4,3)}
  if(g.pulse>0){bx.globalAlpha=g.pulse;bx.drawImage(WSPR[g.t],x,y);bx.globalAlpha=1}}
 // selection & cursor
 const corner=(c,r,col,o)=>{const x=M+c*CS,y=M+r*CS;bx.fillStyle=col;for(const [px,py,sx,sy] of [[x-o,y-o,1,1],[x+CS-1+o,y-o,-1,1],[x-o,y+CS-1+o,1,-1],[x+CS-1+o,y+CS-1+o,-1,-1]]){bx.fillRect(Math.min(px,px+sx*4),py,5,1);bx.fillRect(px,Math.min(py,py+sy*4),1,5)}};
 if(sel){const o=((t*6)|0)%2;corner(sel.c,sel.r,'#ffffff',o-1);bx.globalAlpha=.18;bx.fillStyle='#fff';bx.fillRect(M+sel.c*CS,M+sel.r*CS,CS,CS);bx.globalAlpha=1}
 if(cur.show){corner(cur.c,cur.r,held?'#ffe08a':'#7bf0ff',0);if(held){bx.fillStyle='#ffe08a';const x=M+cur.c*CS+11,y=M+cur.r*CS;bx.fillRect(x,y-1,2,1);bx.fillRect(x,y+CS,2,1);bx.fillRect(M+cur.c*CS-1,y+11,1,2);bx.fillRect(M+cur.c*CS+CS,y+11,1,2)}}
 bx.restore();
 // fx
 bx.globalCompositeOperation='lighter';
 for(const f of FX){if(f.l<0)continue;const p=f.l/f.m;
  if(f.k==='fire'){const e=1-(1-p)*(1-p),r=f.R*(.25+.75*e),x0=Math.round(f.x),y0=Math.round(f.y),ri=Math.ceil(r);
   for(let yy=-ri;yy<=ri;yy++)for(let xx=-ri;xx<=ri;xx++){const d=Math.hypot(xx,yy)/r;if(d>=1)continue;const px=x0+xx,py=y0+yy,n=Math.sin(xx*.7+now*20)*Math.cos(yy*.6-now*17)*.18;
    let h=(1-d)*(1.25-p*1.3)+n+(d>.75?(.2-p*.2):0);if(h<bay(px,py)*.35)continue;const k=Math.max(0,Math.min(5,Math.floor(5-h*5-bay(px,py)*.8)));bx.fillStyle=FIRE[k];bx.fillRect(px,py,1,1)}}
  else if(f.k==='glow'){const r=f.r*(.6+p*.6);bx.globalAlpha=(1-p)*.5;bx.fillStyle=f.col;for(let k=0;k<4;k++){const rr=r*(1-k*.22);bx.fillRect(Math.round(f.x-rr),Math.round(f.y-rr*.7),Math.round(rr*2),Math.round(rr*1.4));bx.fillRect(Math.round(f.x-rr*.7),Math.round(f.y-rr),Math.round(rr*1.4),Math.round(rr*2))}bx.globalAlpha=1}
  else if(f.k==='ring'){const r=f.r+f.vr*f.l,th=1-p,w=f.w||1;bx.fillStyle=f.col;const st=Math.max(12,r*6);for(let i=0;i<st;i++){const a=i/st*6.283;for(let k=0;k<w;k++){const px=Math.round(f.x+Math.cos(a)*(r-k)),py=Math.round(f.y+Math.sin(a)*(r-k));if(bay(px,py)<th)bx.fillRect(px,py,1,1)}}}
  else if(f.k==='beam'){const w=Math.max(1,Math.round(f.w*(1-p*p))),core=p<.7?2:1;
   for(let k=-w-2;k<=w+2;k++){const d=AB(k);const dens=d<core?1:d<=w?1-(d-core)/(w-core+1)*.6:(.35*(1-p));bx.fillStyle=d<core?'#ffffff':f.col;
    if(f.h){const y=Math.round(f.at+k);if(dens>=1)bx.fillRect(M,y,N*CS,1);else for(let x=M;x<M+N*CS;x++)if(bay(x,y)<dens)bx.fillRect(x,y,1,1)}
    else{const x=Math.round(f.at+k);if(dens>=1)bx.fillRect(x,M,1,N*CS);else for(let y=M;y<M+N*CS;y++)if(bay(x,y)<dens)bx.fillRect(x,y,1,1)}}
   bx.fillStyle='#ffffff';for(let i=0;i<6;i++){const s=Math.random()*N*CS+M;if(f.h)bx.fillRect(s|0,(f.at+rnd(-w,w))|0,2,1);else bx.fillRect((f.at+rnd(-w,w))|0,s|0,1,2)}}
  else if(f.k==='arc'){const x2=cx(f.c),y2=cy(f.r),R=srand(((f.seed+((now*30)|0))|0)+1),pts=[[f.x1,f.y1]],n=Math.max(3,Math.round(Math.hypot(x2-f.x1,y2-f.y1)/8));
   for(let i=1;i<n;i++){const s=i/n;pts.push([f.x1+(x2-f.x1)*s+(R()-.5)*9,f.y1+(y2-f.y1)*s+(R()-.5)*9])}pts.push([x2,y2]);
   const fade=1-p;for(const [col,o] of [[f.col,1],[f.col,-1],['#ffffff',0]]){bx.fillStyle=col;bx.globalAlpha=o?fade*.8:fade;for(let i=0;i<pts.length-1;i++)line(pts[i][0]+o,pts[i][1],pts[i+1][0]+o,pts[i+1][1])}
   bx.globalAlpha=1;if(p<.3){bx.fillStyle='#ffffff';bx.fillRect(Math.round(x2)-2,Math.round(y2)-2,4,4)}}
  else if(f.k==='flash'){const lev=Math.round((1-p)*16*f.d);if(lev>0){bx.globalAlpha=.85;bx.drawImage(DITH[Math.min(16,lev)],0,0);bx.globalAlpha=(1-p)*.25;bx.fillStyle=f.col;bx.fillRect(0,0,W,W);bx.globalAlpha=1}}}
 for(const p of PT){const k=Math.min(p.ramp.length-1,Math.floor(p.l/p.m*p.ramp.length));bx.fillStyle=p.ramp[k];bx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)}
 bx.globalCompositeOperation='source-over';
 for(const f of FX)if(f.k==='txt'){const p=f.l/f.m;if(p<.85||((now*20)|0)%2)ptext(bx,f.s,f.x,f.y-p*14,f.col,+f.s>=1000?2:1)}
 // shake offset applied via css
 const s=G.shake>0?Math.round(rnd(-1,1)*Math.min(4,G.shake*.5)):0,s2=G.shake>0?Math.round(rnd(-1,1)*Math.min(4,G.shake*.5)):0;BC.style.transform=s||s2?`translate(${s*scale}px,${s2*scale}px)`:'none'}
// ===== background =====
const BG=$('bg'),gx=BG.getContext('2d');let bgImg=null,stars=[],motes=[];
function setBg(level){const w=Math.ceil(innerWidth/3),h=Math.ceil(innerHeight/3);BG.width=w;BG.height=h;const im=gx.createImageData(w,h),d=im.data;
 const hues=[[270,200],[220,300],[160,260],[330,250],[20,280],[190,120],[290,30]][(level-1)%7];
 const R=srand(level*7919+3),P=[];for(let i=0;i<64;i++)P.push(R());const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,h=(a,b)=>P[(a*7+b*13)&63],s=t=>t*t*(3-2*t);return h(xi,yi)*(1-s(xf))*(1-s(yf))+h(xi+1,yi)*s(xf)*(1-s(yf))+h(xi,yi+1)*(1-s(xf))*s(yf)+h(xi+1,yi+1)*s(xf)*s(yf)};
 const fb=(x,y)=>{let v=0,a=.5;for(let o=0;o<5;o++){v+=vn(x,y)*a;x*=2;y*=2;a*=.5}return v};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w*4,v=y/h*4;const n1=fb(u,v),n2=fb(u+5.2,v+1.3);let l=Math.pow(n1,2.2)*.5;l=Math.floor((l+bay(x,y)*.06)*14)/14;
  const c1=hsl(hues[0],.7,.05+l*.5),c2=hsl(hues[1],.8,Math.pow(n2,3)*.35);const o=(y*w+x)*4;d[o]=Math.min(255,c1[0]+c2[0]);d[o+1]=Math.min(255,c1[1]+c2[1]);d[o+2]=Math.min(255,c1[2]+c2[2]);d[o+3]=255}
 gx.putImageData(im,0,0);bgImg=mk(w,h);bgImg.getContext('2d').drawImage(BG,0,0);stars=Array.from({length:Math.round(w*h/180)},()=>({x:(Math.random()*w)|0,y:(Math.random()*h)|0,p:Math.random()*6,b:Math.random()<.15}));
 motes=Array.from({length:24},()=>({x:Math.random()*w,y:Math.random()*h,v:rnd(3,9),g:(Math.random()*7)|0}))}
let bgT=0;function renderBg(dt){bgT+=dt;if(bgT<1/30)return;const t=now;bgT=0;if(!bgImg)return;gx.drawImage(bgImg,0,0);const w=BG.width,h=BG.height;
 for(const s of stars){const v=(Math.sin(t*2+s.p)+1)/2;if(v<.25)continue;gx.fillStyle=v>.85?'#ffffff':'#a99cd8';gx.fillRect(s.x,s.y,1,1);if(s.b&&v>.8){gx.fillStyle='#8f84c0';gx.fillRect(s.x-1,s.y,3,1);gx.fillRect(s.x,s.y-1,1,3)}}
 gx.globalAlpha=.35;for(const m of motes){m.y-=m.v*.033;if(m.y<-6){m.y=h+4;m.x=Math.random()*w}const gl=GLYPH[m.g];gx.fillStyle=PAL[m.g][3];for(let yy=0;yy<5;yy++)for(let xx=0;xx<5;xx++)if(gl[yy][xx]==='#')gx.fillRect((m.x+xx+Math.sin(t+m.v)*3)|0,(m.y+yy)|0,1,1)}gx.globalAlpha=1}
// ===== layout =====
let scale=1;
function layout(){const port=innerHeight>innerWidth*1.1;document.body.classList.toggle('port',port);const dpr=devicePixelRatio||1;
 let avail;if(port){const top=$('side').offsetHeight+30,bot=90;avail=Math.min(innerWidth-8,innerHeight-top-bot)}else avail=Math.min(innerWidth-330,innerHeight-30);
 let s=Math.floor(avail*dpr/W);if(s<1)s=1;let css=W*s/dpr;if(css<avail*.8){css=avail}// fallback fractional when integer too small
 BC.style.width=BC.style.height=css+'px';scale=css/W;if(G)setBg(G.level);else setBg(1)}
addEventListener('resize',layout);
// ===== hud / ui =====
function hud(){if(!G)return;$('score').textContent=G.score.toLocaleString();const lt=G.mode==='lightning';$('lvlL').textContent=lt?'Time':'Level';$('lvl').textContent=lt?Math.ceil(G.time)+'s':G.level;
 $('bar').style.width=(lt?Math.min(1,G.time/60):Math.min(1,G.prog/need(G.level)))*100+'%';$('modeL').textContent=({classic:'Classic',zen:'Zen',lightning:'Lightning'})[G.mode]+' · Best '+Math.max(SAVE.best[G.mode]||0,G.score).toLocaleString()}
let comboT=0;function showCombo(n){const e=$('combo');e.textContent='Cascade ×'+n;e.style.opacity=1;e.style.fontSize=Math.min(52,28+n*2)+'px';clearTimeout(comboT);comboT=setTimeout(()=>e.style.opacity=0,700)}
function banner(s){const e=$('combo');e.textContent=s;e.style.opacity=1;e.style.fontSize='34px';clearTimeout(comboT);comboT=setTimeout(()=>e.style.opacity=0,1100)}
let curP=null,focusI=0;
function showP(id){$('ov').classList.add('show');document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('show',p.id===id));curP=id;focusI=0;paused=true;refreshMenu();setFocus()}
function hideOv(){$('ov').classList.remove('show');curP=null;paused=false}
function btns(){return curP?[...$(curP).querySelectorAll('.btn')].filter(b=>b.offsetParent):[]}
function setFocus(){const b=btns();b.forEach((x,i)=>x.classList.toggle('f',i===focusI&&padMode))}
let backTo='pMenu';
function refreshMenu(){const sv=SAVE.save_classic||SAVE.save_zen;const mc=$('mCont');mc.style.display=sv?'block':'none';if(sv){const m=SAVE.save_classic?'classic':'zen';mc.dataset.m=m;$('mContS').textContent=(m==='classic'?'Classic':'Zen')+' · Level '+sv.level+' · '+sv.score.toLocaleString()}
 $('sSnd').textContent='Sound: '+(SAVE.set.snd?'On':'Off');$('sMus').textContent='Music: '+(SAVE.set.mus?'On':'Off');$('sShake').textContent='Screen shake: '+(SAVE.set.shake?'On':'Off');
 $('bSnd').classList.toggle('off',!SAVE.set.snd);$('bMus').classList.toggle('off',!SAVE.set.mus);
 $('sTab').innerHTML=['classic','zen','lightning'].map(m=>`<tr><td>${m[0].toUpperCase()+m.slice(1)}${SAVE.lvl[m]?' <small>(best level '+SAVE.lvl[m]+')</small>':''}</td><td>${(SAVE.best[m]||0).toLocaleString()}</td></tr>`).join('')+`<tr><td>Power-ups forged (total)</td><td>${(SAVE.forged||0).toLocaleString()}</td></tr>`}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{audio();const m=b.dataset.mode;SAVE['save_'+m]=null;startGame(m)});
$('mCont').onclick=()=>{audio();const m=$('mCont').dataset.m;startGame(m,SAVE['save_'+m])};
$('mHelp').onclick=()=>{backTo='pMenu';showP('pHelpP')};$('mScores').onclick=()=>{backTo='pMenu';showP('pScores')};$('mSet').onclick=()=>{backTo='pMenu';showP('pSetP')};
$('pRes').onclick=()=>hideOv();$('pHelp').onclick=()=>{backTo='pPause';showP('pHelpP')};$('pSet').onclick=()=>{backTo='pPause';showP('pSetP')};
$('pQuit').onclick=()=>{saveGame();if(G&&G.mode==='lightning')SAVE.best.lightning=Math.max(SAVE.best.lightning,G.score);persist();G=null;showP('pMenu')};
$('oAgain').onclick=()=>startGame(G.mode);$('oMenu').onclick=()=>{G=null;showP('pMenu')};
document.querySelectorAll('.back').forEach(b=>b.onclick=()=>showP(G&&backTo==='pPause'?'pPause':'pMenu'));
const togS=()=>{SAVE.set.snd^=1;if(SG)SG.gain.value=SAVE.set.snd?.55:0;persist();refreshMenu();setFocus()},togM=()=>{audio();SAVE.set.mus^=1;if(MUG)MUG.gain.value=SAVE.set.mus?.22:0;persist();refreshMenu();setFocus()};
$('sSnd').onclick=togS;$('sMus').onclick=togM;$('sShake').onclick=()=>{SAVE.set.shake^=1;persist();refreshMenu();setFocus()};$('sReset').onclick=()=>{if(confirm('Reset all records?')){SAVE.best={classic:0,zen:0,lightning:0};SAVE.lvl={classic:0,zen:0};SAVE.forged=0;persist();refreshMenu()}};
$('bSnd').onclick=()=>{audio();togS()};$('bMus').onclick=togM;$('bMenu').onclick=()=>pause();$('bHint').onclick=()=>showHint();
function pause(){if(!G||G.over)return;if(curP)return;saveGame();showP('pPause')}
function showHint(){if(!G||paused)return;if(G.moves&&G.moves.length&&isSettled())G.hint=G.moves[(Math.random()*G.moves.length)|0];else{const mv=findMoves(grid.map(col=>col.map(g=>g&&g.st==='idle'?{t:g.t,sp:g.sp}:null)));if(mv.length)G.hint=mv[0]}}
addEventListener('visibilitychange',()=>{if(document.hidden){saveGame();if(G&&!G.over&&!curP)showP('pPause')}});
// ===== input: pointer =====
let drag=null;let padMode=false;
function cellAt(e){const r=BC.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*W,py=(e.clientY-r.top)/r.height*W;return {c:Math.floor((px-M)/CS),r:Math.floor((py-M)/CS),px,py}}
BC.addEventListener('pointerdown',e=>{audio();if(!G||paused)return;padMode=false;cur.show=false;const p=cellAt(e);if(p.c<0||p.r<0||p.c>=N||p.r>=N)return;BC.setPointerCapture(e.pointerId);
 if(sel&&AB(sel.c-p.c)+AB(sel.r-p.r)===1){if(trySwap(sel.c,sel.r,p.c,p.r)){sel=null;drag=null;return}}
 drag={c:p.c,r:p.r,px:p.px,py:p.py,done:false};const g=at(p.c,p.r);if(sel&&sel.c===p.c&&sel.r===p.r){drag.desel=1}sel={c:p.c,r:p.r};void g});
BC.addEventListener('pointermove',e=>{if(!drag||drag.done)return;const p=cellAt(e),dx=p.px-drag.px,dy=p.py-drag.py;if(Math.max(AB(dx),AB(dy))>CS*.38){const [dc,dr]=AB(dx)>AB(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];drag.done=true;const c2=drag.c+dc,r2=drag.r+dr;if(c2>=0&&r2>=0&&c2<N&&r2<N)trySwap(drag.c,drag.r,c2,r2);sel=null}});
BC.addEventListener('pointerup',e=>{if(drag&&drag.desel&&!drag.done)sel=null;drag=null});
// ===== keyboard =====
const DIRS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]};
addEventListener('keydown',e=>{audio();const d=DIRS[e.code];if(curP){if(d){e.preventDefault();padMode=true;navMenu(d)}else if(e.code==='Enter'||e.code==='Space'){e.preventDefault();const b=btns()[focusI];if(b&&padMode)b.click();else if(b){padMode=true;setFocus()}}else if(e.code==='Escape'){menuBack()}return}
 if(!G)return;if(d){e.preventDefault();gameDir(d)}else if(e.code==='Space'||e.code==='Enter'){e.preventDefault();gameA()}else if(e.code==='Escape'||e.code==='KeyP'){if(held||sel){held=false;sel=null}else pause()}else if(e.code==='KeyH')showHint();else if(e.code==='KeyM')togM()});
function navMenu(d){const b=btns();if(!b.length)return;if(!b[focusI]||!b[focusI].classList.contains('f')){setFocus()}focusI=(focusI+(d[1]||d[0])+b.length)%b.length;setFocus()}
function menuBack(){if(curP==='pPause')hideOv();else if(curP==='pHelpP'||curP==='pScores'||curP==='pSetP')showP(G&&backTo==='pPause'?'pPause':'pMenu')}
function gameDir(d){if(!cur.show){cur.show=true;padMode=true;return}if(held){const c2=cur.c+d[0],r2=cur.r+d[1];if(c2>=0&&r2>=0&&c2<N&&r2<N&&trySwap(cur.c,cur.r,c2,r2)){held=false;sel=null;cur.c=c2;cur.r=r2}else sfx('bad');return}
 cur.c=Math.max(0,Math.min(N-1,cur.c+d[0]));cur.r=Math.max(0,Math.min(N-1,cur.r+d[1]))}
function gameA(){if(!cur.show){cur.show=true;padMode=true;return}held=!held;sel=held?{c:cur.c,r:cur.r}:null}
// ===== gamepad =====
let pprev=[],repT={},stickHeld={};
function pollPad(dt){const ps=navigator.getGamepads?navigator.getGamepads():[];let p=null;for(const q of ps)if(q&&q.connected){p=q;break}if(!p)return;
 const B=i=>p.buttons[i]&&p.buttons[i].pressed,down=i=>B(i)&&!pprev[i];const ax=p.axes[0]||0,ay=p.axes[1]||0;
 const dirs=[[12,0,-1,ay<-.55],[13,0,1,ay>.55],[14,-1,0,ax<-.55],[15,1,0,ax>.55]];let any=false;
 for(const [bi,dx,dy,st] of dirs){const on=B(bi)||st;if(on){any=true;if(!repT[bi]){repT[bi]=.32;fire([dx,dy])}else{repT[bi]-=dt;if(repT[bi]<=0){repT[bi]=.11;fire([dx,dy],true)}}}else repT[bi]=0}
 function fire(d,rep){padMode=true;audio();if(curP){navMenu(d)}else if(G){if(rep&&held)return;if(!cur.show){cur.show=true}else gameDir(d)}}
 if(down(0)){padMode=true;audio();if(curP){const b=btns()[focusI];if(b&&b.classList.contains('f'))b.click();else setFocus()}else if(G){if(!cur.show)cur.show=true;else gameA()}}
 if(G&&!curP&&!B(0)&&pprev[0]&&held&&padHoldSwap){held=false;sel=null}
 if(down(1)){if(curP)menuBack();else if(held||sel){held=false;sel=null}}
 if(down(3)&&!curP)showHint();
 if(down(9)){if(curP==='pPause')hideOv();else if(!curP)pause();else if(curP==='pMenu'){const b=btns()[focusI];if(b)b.click()}}
 if(down(8)&&!curP)togM();
 for(let i=0;i<17;i++)pprev[i]=B(i);void any}
let padHoldSwap=false;
addEventListener('gamepadconnected',()=>{padMode=true;document.body.classList.add('pad');setFocus()});
// ===== loop =====
let last=performance.now(),fpsA=0,fpsN=0;window.__fps=60;
function frame(ts){let dt=Math.min(.05,(ts-last)/1000);last=ts;fpsA+=dt;fpsN++;if(fpsA>1){window.__fps=Math.round(fpsN/fpsA);fpsA=0;fpsN=0}
 pollPad(dt);if(!paused)update(dt);else now+=0;render();renderBg(dt);requestAnimationFrame(frame)}
// logo
(()=>{const l=$('logo').getContext('2d');l.drawImage(ORB[0],0,0)})();
layout();showP('pMenu');requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
// test/debug hooks
window.RS={get G(){return G},get grid(){return grid},start:startGame,swap:trySwap,settled:isSettled,findMoves,detonate,FX,PT,
 build(over){// over: {"c,r":v}; fill rest w/o matches
 const T=[];for(let c=0;c<N;c++){T.push([]);for(let r=0;r<N;r++)T[c].push(-1)}for(const k in over){const [c,r]=k.split(',').map(Number);T[c][r]=over[k]}
 const run=(c,r,t)=>{const s=(a,b)=>a>=0&&b>=0&&a<N&&b<N&&T[a][b]>=0&&T[a][b]%10===t;let h=1;for(let k=c-1;s(k,r);k--)h++;for(let k=c+1;s(k,r);k++)h++;let v=1;for(let k=r-1;s(c,k);k--)v++;for(let k=r+1;s(c,k);k++)v++;return h>=3||v>=3};
 for(let c=0;c<N;c++)for(let r=0;r<N;r++)if(T[c][r]<0){let t,k=0;do{t=(Math.random()*7)|0}while(run(c,r,t)&&++k<50);T[c][r]=t}
 for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c][r];g.t=T[c][r]%10;g.sp=(T[c][r]/10)|0;g.st='idle';g.y=r;g.x=c;g.vy=0;g.pulse=0}G.chain=0;G.hint=null},
 setBoard(types){for(let c=0;c<N;c++)for(let r=0;r<N;r++){const v=types[r][c];const g=grid[c][r];g.t=v%10;g.sp=(v/10)|0;g.st='idle';g.y=r;g.x=c;g.vy=0}G.chain=0},
 state(){let f=0,cl=0,sw=0,id=0;for(const col of grid)for(const g of col){if(!g)continue;if(g.st==='fall')f++;else if(g.st==='clear')cl++;else if(g.st==='swap')sw++;else id++}return {fall:f,clear:cl,swap:sw,idle:id,score:G.score,chain:G.chain,fx:FX.length,pt:PT.length}}};
