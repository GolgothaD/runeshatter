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
const K=2,S=CS*K;
const lerp3=(a,b,f)=>[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*f));
function ramp9(t){const P=PAL[t].map(hex),R=[];for(let i=0;i<9;i++){const f=i/2,k=Math.min(3,Math.floor(f));R.push(lerp3(P[k],P[k+1],f-k))}return R}
const L3=(()=>{const v=[-.45,-.62,.64],l=Math.hypot(...v);return v.map(a=>a/l)})();
const GH=S/2,gnx=p=>(p+.5-GH)/(GH-1.5);
function gemSprite(t,white){
 const c=mk(S,S),x=c.getContext('2d'),im=x.createImageData(S,S),d=im.data,F=SHAPES[t],R=ramp9(t),TAB=t===3?-1:.5,Q=t===3?16:8;
 const ins=(px,py)=>px>=0&&py>=0&&px<S&&py<S&&F(gnx(px),gnx(py))<1;
 const fac=(px,py)=>{const X=gnx(px),Y=gnx(py),f=F(X,Y);if(f<TAB)return 99;if(f>=1)return -1;const e=.02,gx=F(X+e,Y)-F(X-e,Y),gy=F(X,Y+e)-F(X,Y-e);return ((Math.round(Math.atan2(gy,gx)/(Math.PI*2/Q))%Q)+Q)%Q};
 const gl=(px,py)=>{const gx=Math.floor((px-GH+5)/2),gy=Math.floor((py-GH+5)/2);return gx>=0&&gy>=0&&gx<5&&gy<5&&GLYPH[t][gy][gx]==='#'};
 for(let py=0;py<S;py++)for(let px=0;px<S;px++){const o=(py*S+px)*4;
  if(!ins(px,py)){if(!white&&ins(px-2,py-3))d[o+3]=95;continue}
  const X=gnx(px),Y=gnx(py),f=F(X,Y),fa=fac(px,py);let b;
  if(fa===99)b=.6+(-X-Y)*.22+(1-f/TAB)*.16;
  else{const a=fa*Math.PI*2/Q,k=t===3?Math.min(.95,f*.9):.74,n=[Math.cos(a)*k,Math.sin(a)*k,SQ(1-k*k)];b=(n[0]*L3[0]+n[1]*L3[1]+n[2]*L3[2])*.82+.16}
  b+=Math.max(0,.55-f)*.22;
  let i=Math.floor(b*8+(bay(px,py)-.5)*1.1);
  if(fac(px+1,py)!==fa||fac(px,py+1)!==fa)i+=b>.5?2:-2;else if(fac(px-1,py)!==fa||fac(px,py-1)!==fa)i+=1;
  if(fa===99&&t!==3||t===3&&f<.5){if(gl(px,py))i=9;else if(gl(px-1,py)||gl(px+1,py)||gl(px,py-1)||gl(px,py+1))i=Math.max(1,Math.min(i,4)-2);else if(gl(px-2,py)||gl(px+2,py)||gl(px,py-2)||gl(px,py+2)||gl(px-1,py-1)||gl(px+1,py+1))i+=1}
  const edge=!ins(px-1,py)||!ins(px+1,py)||!ins(px,py-1)||!ins(px,py+1);
  if(edge)i=0;else if((!ins(px-1,py-1)||!ins(px-2,py))&&X+Y<0)i+=2;else if(!ins(px+2,py+2)&&X+Y>0)i-=1;
  let col=i>=9?lerp3(R[8],[255,255,255],.55):R[Math.max(edge?0:1,Math.min(8,i))];
  const sp=(X+.36)**2/.02+(Y+.44)**2/.008;if(!edge&&sp<1)col=[255,255,255];else if(!edge&&sp<2.4&&bay(px,py)<.5)col=lerp3(col,[255,255,255],.6);
  if(white)col=[255,255,255];
  d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255}
 x.putImageData(im,0,0);return c}
function glintFrames(t){const F=SHAPES[t],fr=[];for(let k=0;k<8;k++){const c=mk(S,S),x=c.getContext('2d');x.fillStyle='#fff';
 for(let py=1;py<S-1;py++)for(let px=1;px<S-1;px++){const X=gnx(px),Y=gnx(py);if(F(X,Y)>=.93)continue;const u=X+Y-(-1.7+k*.48);if(AB(u)<.09||(AB(u)<.2&&bay(px,py)<.4))x.fillRect(px,py,1,1)}fr.push(c)}return fr}
function glowSprite(t,colr){const D=S+16,c=mk(D,D),x=c.getContext('2d'),F=SHAPES[t];x.fillStyle=colr;
 for(let py=0;py<D;py++)for(let px=0;px<D;px++){const f=F(gnx(px-8),gnx(py-8));if(f<1)continue;const dd=(f-1)*(GH-1.5),b=bay(px,py);
  if(dd<=2.5||(dd<=4.5&&b<.65)||(dd<=6.5&&b<.33)||(dd<=8&&b<.12))x.fillRect(px,py,1,1)}return c}
function orbFrames(){const fr=[];for(let k=0;k<16;k++){const c=mk(S,S),x=c.getContext('2d'),im=x.createImageData(S,S),d=im.data;
 for(let py=0;py<S;py++)for(let px=0;px<S;px++){const X=(px+.5-GH)/2,Y=(py+.5-GH)/2,r=Math.hypot(X,Y);if(r>10.6)continue;const o=(py*S+px)*4;
  let col;if(r>9.8)col=[40,8,60];else if(r>9.1)col=X+Y<0?[255,200,255]:[120,40,160];else{const a=Math.atan2(Y,X);const h=((a/(2*Math.PI))*360+k*22.5+r*30+720)%360;
   const arm=Math.sin(a*3-r*.75+k*.39)*.5+.5,sh=Math.hypot(X+3.6,Y+3.6);let l=.5-r*.022+arm*.16+(sh<2.6?.3:sh<3.6?.12:0);l+=(bay(px,py)-.5)*.1;l=Math.round(l*8)/8;col=hsl(h,1,Math.min(.95,Math.max(.12,l)));
   if(r<1.6)col=[255,255,255];else if(r<2.6)col=lerp3(col,[255,255,255],.6)}
  d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255}
 x.putImageData(im,0,0);fr.push(c)}return fr}
function hsl(h,s,l){h/=360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return [f(0),f(8),f(4)]}
const FLAMEC=['#fff6c0','#ffd04a','#ff8a1a','#e0401a','#8a1a10'];
function flameFrames(){const fr=[],D=S+24;for(let k=0;k<8;k++){const c=mk(D,D),x=c.getContext('2d');
 for(let py=0;py<D;py++)for(let px=0;px<D;px++){const X=(px+.5-D/2)/(GH-1.5),Y=(py+.5-D/2)/(GH-1.5),rr=Math.hypot(X,Y);if(rr<.7||rr>1.6)continue;const a=Math.atan2(Y,X),up=Math.max(0,-Y/rr);
  const H=.12+.42*up*up+.09*Math.sin(a*7+k*.785)+.06*Math.sin(a*13-k*1.57+Y*6);const v=1-(rr-.82)/Math.max(.05,H);if(v<bay(px,py)*.5)continue;x.fillStyle=FLAMEC[Math.max(0,Math.min(4,Math.floor((1-v)*5)))];x.fillRect(px,py,1,1)}fr.push(c)}return fr}
function coronaFrames(){const fr=[],D=S+24;for(let k=0;k<8;k++){const c=mk(D,D),x=c.getContext('2d');
 for(let py=0;py<D;py++)for(let px=0;px<D;px++){const X=px+.5-D/2,Y=py+.5-D/2,r=Math.hypot(X,Y)/2,a=Math.atan2(Y,X);if(r<8||r>18)continue;const ray=Math.pow(AB(Math.cos(a*6+k*.39)),8)*7+Math.pow(AB(Math.cos(a*10-k*.6)),12)*4;
  const v=1-(r-9)/(2+ray);if(v<bay(px,py)*.7)continue;x.fillStyle=v>.7?'#ffffff':v>.4?'#bff4ff':'#5aa8ff';x.fillRect(px,py,1,1)}fr.push(c)}return fr}
const SPR=PAL.map((_,t)=>gemSprite(t)),WSPR=PAL.map((_,t)=>gemSprite(t,true)),GLINT=PAL.map((_,t)=>glintFrames(t));
const GLOW={f:PAL.map((_,t)=>glowSprite(t,'#ff9a2a')),s:PAL.map((_,t)=>glowSprite(t,'#ffffff')),n:PAL.map((_,t)=>glowSprite(t,'#9fe8ff'))};
const ORB=orbFrames(),ORBG=glowSprite(3,'#ff7bff'),FLAMEF=flameFrames(),CORONA=coronaFrames();
const DITH=[];for(let k=0;k<=16;k++){const c=mk(W,W),x=c.getContext('2d');x.fillStyle='#fff';for(let y=0;y<W;y++)for(let X=0;X<W;X++)if(bay(X,y)<k/16)x.fillRect(X,y,1,1);DITH.push(c)}
// pixel font 3x5
const FONT={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','+':'000010111010000','x':'000101010101000'};
function ptext(ctx,s,x,y,col,sc){sc=sc||1;const w=s.length*4*sc-sc;x=Math.round(x-w/2);y=Math.round(y);
 ctx.fillStyle='#000';for(let p=0;p<2;p++){for(let i=0;i<s.length;i++){const g=FONT[s[i]];if(!g)continue;for(let k=0;k<15;k++)if(g[k]==='1'){const gx=x+(i*4+k%3)*sc,gy=y+((k/3)|0)*sc;if(p===0){ctx.fillRect(gx-1,gy-1,sc+2,sc+2)}else ctx.fillRect(gx,gy,sc,sc)}}ctx.fillStyle=col}}

// ===== settings & save =====
const SK='runeshatter';let SAVE={};try{SAVE=JSON.parse(localStorage.getItem(SK)||'{}')}catch(e){}
SAVE.best=SAVE.best||{classic:0,zen:0,lightning:0};SAVE.lvl=SAVE.lvl||{classic:0,zen:0};SAVE.set=Object.assign({snd:1,mus:1,shake:1,q:'auto'},SAVE.set||{});
const persist=()=>{try{localStorage.setItem(SK,JSON.stringify(SAVE))}catch(e){}};

// ===== audio (all synthesized in-browser) =====
let AC=null,MG,SG,MUG,DUCK,AEXT='mp3';
// ===== v6 audio: recorded orchestral music (Kevin MacLeod, CC BY 4.0) + designed layered SFX samples =====
if(SAVE.set.sv==null)SAVE.set.sv=.8;if(SAVE.set.mv==null)SAVE.set.mv=.6;
const SFXN=['match','make','swap','bad','land','tick','shuffle','boom','whoosh','beam','crackle','zap','swell','swellbig','nova','clash','tail','level'];
const MUSF={calm:'Dreamy Flashback',vale:'Enchanted Valley',quest:'Five Armies',dark:'Darkest Child'};
const THMUS={tower:'calm',library:'calm',sky:'calm',green:'calm',meadow:'vale',lake:'vale',forest:'vale',mount:'quest',aurora:'quest',crypt:'dark',blood:'dark',cath:'dark',forge:'dark'};
const SB={},MB={},MBP={};let musK=null,musNode=null,wantMus=null;
const sGain=()=>SAVE.set.snd?SAVE.set.sv:0,mGain=()=>SAVE.set.mus?SAVE.set.mv*.55:0;
function fetchBuf(u){return fetch(u).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise((ok,no)=>{const p=AC.decodeAudioData(b,ok,no);if(p&&p.then)p.then(ok,no)}))}
function audio(){if(AC){if(AC.state==='suspended')AC.resume();return}try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
 const a=document.createElement('audio');AEXT=a.canPlayType&&a.canPlayType('audio/ogg; codecs="opus"')?'ogg':'mp3';
 MG=AC.createGain();MG.gain.value=.95;const cp=AC.createDynamicsCompressor();cp.threshold.value=-8;cp.knee.value=6;cp.ratio.value=3;cp.attack.value=.004;cp.release.value=.2;MG.connect(cp);cp.connect(AC.destination);
 SG=AC.createGain();SG.gain.value=sGain();SG.connect(MG);
 DUCK=AC.createGain();DUCK.connect(MG);MUG=AC.createGain();MUG.gain.value=mGain();MUG.connect(DUCK);
 SFXN.forEach(n=>fetchBuf('audio/sfx/'+n+'.'+AEXT).then(b=>SB[n]=b).catch(()=>{}));
 if(AC.state==='suspended')AC.resume();if(wantMus)playMus(wantMus)}
function play(n,o){o=o||{};const b=SB[n];if(!b||!AC)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;
 s.playbackRate.value=(o.rate||1)*(o.exact?1:rnd(.96,1.04));g.gain.value=(o.vol||1)*(o.exact?1:rnd(.9,1));s.connect(g);g.connect(SG);s.start(AC.currentTime+(o.at||0))}
function duck(amt,len){if(!DUCK||!SAVE.set.mus)return;const t=AC.currentTime,p=DUCK.gain;p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.linearRampToValueAtTime(amt,t+.06);p.setValueAtTime(amt,t+len);p.linearRampToValueAtTime(1,t+len+1.2)}
const SCALE=[0,2,4,5,7,9,11];
const SFX={
 swap(){play('swap')},bad(){play('bad')},land(){play('land',{vol:.7,rate:rnd(.85,1.15)})},tick(){play('tick',{exact:1})},shuffle(){play('shuffle')},make(){play('make')},
 match(ch){const b=Math.max(0,Math.min((ch||1)-1,11)),st=SCALE[b%7]+12*Math.floor(b/7);play('match',{rate:Math.pow(2,(st-5)/12),exact:1,vol:.9+Math.min(b,6)*.03})},
 boom(){play('boom');duck(.45,.6)},whoosh(){play('whoosh')},beam(){play('beam');duck(.6,.4)},crackle(){play('crackle',{rate:rnd(.85,1.2)})},
 zap(){play('zap');duck(.45,.8)},swell(big){play(big?'swellbig':'swell')},nova(){play('nova');duck(.3,1.6)},clash(){play('clash');duck(.4,1)},tail(){play('tail');duck(.35,1.4)},
 level(){play('level',{exact:1});duck(.35,2.2)}};
function sfx(n,a){if(!AC||!SAVE.set.snd)return;try{SFX[n](a)}catch(e){}}
function loadMus(k){if(!MBP[k])MBP[k]=fetchBuf('audio/music/'+k+'.'+AEXT).then(b=>MB[k]=b).catch(e=>{delete MBP[k];throw e});return MBP[k]}
function playMus(k){wantMus=k;if(!AC||!SAVE.set.mus||musK===k)return;loadMus(k).then(b=>{if(wantMus!==k||musK===k||!SAVE.set.mus)return;const t=AC.currentTime,old=musNode;
  const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.loop=true;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+2.5);s.connect(g);g.connect(MUG);s.start(t);musNode={s,g};musK=k;
  if(old){old.g.gain.cancelScheduledValues(t);old.g.gain.setValueAtTime(old.g.gain.value,t);old.g.gain.linearRampToValueAtTime(0,t+2.5);old.s.stop(t+2.6)}}).catch(()=>{})}
function musForTheme(th){playMus(THMUS[th&&th.id]||'calm')}
function setVols(){if(SG)SG.gain.setTargetAtTime(sGain(),AC.currentTime,.05);if(MUG)MUG.gain.setTargetAtTime(mGain(),AC.currentTime,.05);if(SAVE.set.mus&&wantMus&&!musK)playMus(wantMus)}

// ===== board state =====
let grid,G,gid=1,now=0;
const FX=[],PT=[];
function newGem(t,y,sp){return {t,sp:sp||0,st:'fall',x:0,y,vy:0,ct:0,id:gid++,mv:0,born:now,pulse:0,sq:0}}
function cellTypeOk(b,c,r,t){return !((c>=2&&b[c-1][r]===t&&b[c-2][r]===t)||(r>=2&&b[c][r-1]===t&&b[c][r-2]===t))}
function freshTypes(){for(let tries=0;tries<200;tries++){const b=[];for(let c=0;c<N;c++){b.push([]);for(let r=0;r<N;r++){let t,k=0;do{t=(Math.random()*7)|0}while(!cellTypeOk(b,c,r,t)&&++k<30);b[c][r]=t}}
 if(findMoves(b.map(col=>col.map(t=>({t,sp:0})))).length>=3)return b}}
function startGame(mode,load){
 Q.length=0;G={mode,score:0,level:1,prog:0,chain:0,time:60,over:false,idle:0,hint:null,shake:0,imp:0,lastAct:0,settledFor:0,made:0,best:0,biggest:0};
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
 if(s.back){a.st=b.st='idle';if(window.__rv)window.__rv(s);return}
 a.st=b.st='idle';a.mv=b.mv=now+1;
 if(a.sp===3||b.sp===3||(a.sp&&b.sp)){comboSpell(a,s.c2,s.r2,b,s.c1,s.r1);return}
 if(lineAt(s.c2,s.r2,a.t)||lineAt(s.c1,s.r1,b.t)){if(G.chain<1)G.chain=0;return}
 grid[s.c1][s.r1]=a;grid[s.c2][s.r2]=b;a.st=b.st='swap';SW.push({a,b,c1:s.c2,r1:s.r2,c2:s.c1,r2:s.r1,t:0,back:true});sfx('bad');shake(1.2)}
// ===== effects =====
const cx=c=>M+c*CS+CS/2,cy=r=>M+r*CS+CS/2;
function impact(x,y,col,big){G.imp=big?.07:.04;FX.push({k:'rays',x,y,a:Math.random()*6.28,n:big?16:10,L:big?260:120,col:col||'#fff4c0',l:0,m:big?.7:.45})}
function burst(x,y,ramp,n,sp,opt){opt=opt||{};n=Math.round(n*(HQ?1.3:.5));if(PT.length>(HQ?1600:700))return;for(let i=0;i<n;i++){const a=Math.random()*6.283,v=rnd(sp*.3,sp);PT.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(opt.up||0),l:0,m:rnd(.35,.8)*(opt.life||1),ramp,s:Math.random()<(opt.big||.25)?(Math.random()<.3?3:2):(Math.random()<.5?.5:1),tr:1,g:opt.g==null?120:opt.g,dr:opt.dr||.96})}}
function shards(g,c,r){const ramp=[...PAL[g.t]].reverse();burst(cx(c),cy(r),['#ffffff',...ramp],14,70,{big:.4});FX.push({k:'ring',x:cx(c),y:cy(r),r:3,vr:70,l:0,m:.22,col:PAL[g.t][4]})}
function shake(v){if(SAVE.set.shake)G.shake=Math.max(G.shake,v)}
function flash(m,col,dens){FX.push({k:'flash',l:0,m,col:col||'#fff',d:dens||1})}
function hit(c,r,delay,src){const g=at(c,r);if(!g||g.st==='clear'||g.st==='swap'||g.st==='hold')return 0;g.st='clear';g.ct=delay;g.cause=src||1;return 1}
const FIRE=['#ffffff','#fff2a0','#ffc030','#ff7a1a','#d02a10','#5a0e08'];
function detonate(g,c,r){const x=cx(c),y=cy(r);
 if(g.sp===1){sfx('boom');shake(4);impact(x,y,'#ffd080');flash(.12,'#ffb050',.6);burst(x,y,FIRE,70,140,{big:.5,g:40});FX.push({k:'ring',x,y,r:4,vr:180,l:0,m:.3,col:'#ffd060',w:2});FX.push({k:'fire',x,y,R:34,l:0,m:.45});smoke(x,y,12);embers(x,y,26);debris(x,y,g.t);lit('#ff7a1a',.4);punch(.04);sfx('tail');
  for(let dc=-1;dc<=1;dc++)for(let dr=-1;dr<=1;dr++)if(dc||dr)hit(c+dc,r+dr,.06+(AB(dc)+AB(dr))*.03,2)}
 else if(g.sp===2){sfx('beam');shake(3);beams(c,r,0,PAL[g.t][3]);FX.push({k:'rays',x,y,a:Math.random()*6.28,n:8,L:90,col:PAL[g.t][2],l:0,m:.35});debris(x,y,g.t);lit(PAL[g.t][3],.3);punch(.03)}
 else if(g.sp===4){sfx('nova');shake(9);impact(x,y,'#e0fbff',1);flash(.4,'#ffffff',1);for(let k=-1;k<=1;k++)beams(c+k,r+k,k?1:0,'#bff4ff',true);FX.push({k:'ring',x,y,r:4,vr:260,l:0,m:.5,col:'#ffffff',w:3});FX.push({k:'ring',x,y,r:2,vr:160,l:0,m:.6,col:'#9fe8ff',w:2});burst(x,y,['#ffffff','#e0fbff','#9fe8ff','#5aa8ff','#3a4aff','#1a1050'],140,200,{big:.5,g:20});FX.push({k:'wisp',x,y,n:HQ?7:4,a:Math.random()*6.28,R:190,l:0,m:.9});lit('#d8f4ff',.55);slowmo(.15);punch(.07);sfx('tail');smoke(x,y,8,'#18203a')}
 else if(g.sp===3){const ts=[];for(let cc=0;cc<N;cc++)for(let rr=0;rr<N;rr++){const q=grid[cc][rr];if(q&&q.st==='idle'&&q.sp!==3)ts.push(q.t)}orbStrike(c,r,ts.length?ts[(Math.random()*ts.length)|0]:0,0)}}
function beams(c,r,dl,col,big){if(r>=0&&r<N){FX.push({k:'beam',h:1,at:cy(r),l:-dl*.05,m:.45,col,w:big?7:5});for(let cc=0;cc<N;cc++)hit(cc,r,.04+AB(cc-c)*.035,2)}
 if(c>=0&&c<N){FX.push({k:'beam',h:0,at:cx(c),l:-dl*.05,m:.45,col,w:big?7:5});for(let rr=0;rr<N;rr++)hit(c,rr,.04+AB(rr-r)*.035,2)}
 burst(cx(Math.max(0,Math.min(7,c))),cy(Math.max(0,Math.min(7,r))),['#ffffff','#ffffff',col,col,'#4a2a8a'],40,160,{g:0,big:.3})}
function orbStrike(c,r,t,makeSp){const x=cx(c),y=cy(r);sfx('zap');shake(5);flash(.15,'#d07bff',.5);FX.push({k:'ring',x,y,r:3,vr:220,l:0,m:.45,col:'#ff9bff',w:2});burst(x,y,['#ffffff','#ffd0ff','#ff7bff','#a040ff','#4a10a0'],60,120,{g:0});
 const list=[];for(let cc=0;cc<N;cc++)for(let rr=0;rr<N;rr++){const q=grid[cc][rr];if(q&&q.t===t&&q.sp!==3&&q.st!=='clear'&&q.st!=='swap')list.push([cc,rr,q])}
 {const o=[];let pc=c,pr=r;const L=list.slice();while(L.length){let bi=0,bd=1e9;L.forEach((q,i)=>{const d=Math.hypot(q[0]-pc,q[1]-pr);if(d<bd){bd=d;bi=i}});const q=L.splice(bi,1)[0];o.push(q);pc=q[0];pr=q[1]}list.length=0;list.push(...o)}
 const C0=.16;caster(x,y,'#ff9bff',C0);sfx('swell');let px=x,py=y;const col=PAL[t][3];
 list.forEach(([cc,rr,q],i)=>{const d=C0+.1+i*.06;if(makeSp&&!q.sp){q.sp=makeSp;q.pulse=1}FX.push({k:'arc',x1:px,y1:py,c:cc,r:rr,l:-(d-.07),m:.34+(makeSp?.25:0),col,seed:Math.random()*1e4});if(HQ&&i%2===0)FX.push({k:'arc',x1:px,y1:py,c:cc,r:rr,l:-(d-.07),m:.2,col:'#ffd0ff',seed:Math.random()*1e4});
  hit(cc,rr,d+(makeSp?.3:0),3);later(d-.07,()=>{sfx('crackle');lit(col,.2)});px=cx(cc);py=cy(rr)});
 const me=at(c,r);if(me&&me.sp===3&&me.st!=='clear'){me.sp=0;hit(c,r,C0+.15+list.length*.06,3)}}
function comboFire(a,ca,ra,b,cb,rb){// a moved to (ca,ra)
 G.chain=Math.max(G.chain,1);const sa=a.sp,sb=b.sp,x=cx(ca),y=cy(ra);
 if(sa===3&&sb===3){sfx('nova');shake(12);impact(x,y,'#ffc8ff',1);flash(.7,'#ffffff',1);a.sp=b.sp=0;FX.push({k:'ring',x,y,r:4,vr:300,l:0,m:.7,col:'#ff9bff',w:3});
  for(let c=0;c<N;c++)for(let r=0;r<N;r++){const d=Math.hypot(c-ca,r-ra);const q=grid[c][r];if(q&&q.sp)q.sp=0;hit(c,r,.1+d*.07,4);if(Math.random()<.5)FX.push({k:'arc',x1:x,y1:y,c,r,l:-d*.07,m:.4,col:hsl(c*40+r*20,1,.7).reduce((s,v)=>s+v.toString(16).padStart(2,'0'),'#'),seed:Math.random()*1e4})}
  addScore(5000,ca,ra);banner('ARCANE CATACLYSM');return}
 if(sa===3||sb===3){const orb=sa===3?a:b,o=sa===3?[ca,ra]:[cb,rb],oth=sa===3?b:a,oc=sa===3?[cb,rb]:[ca,ra];orb.sp=0;
  if(oth.sp){const ms=oth.sp;oth.sp=0;banner(['','FLAME STORM','STAR STORM','','NOVA STORM'][ms]);orbStrike(o[0],o[1],oth.t,ms===4?2:ms);hit(oc[0],oc[1],.1,3);hit(o[0],o[1],.08,3)}
  else{orbStrike(o[0],o[1],oth.t,0);hit(o[0],o[1],.05,3)}return}
 // two non-orb specials
 const s=[sa,sb].sort().join('');a.sp=b.sp=0;hit(ca,ra,.02,2);hit(cb,rb,.04,2);
 if(s==='11'){sfx('boom');sfx('boom');shake(8);impact(x,y,'#ffd080',1);flash(.25,'#ffb050',.8);burst(x,y,FIRE,140,200,{big:.6,g:30});FX.push({k:'ring',x,y,r:4,vr:240,l:0,m:.4,col:'#ffd060',w:3});FX.push({k:'fire',x,y,R:62,l:0,m:.6});
  for(let dc=-2;dc<=2;dc++)for(let dr=-2;dr<=2;dr++)hit(ca+dc,ra+dr,.05+Math.max(AB(dc),AB(dr))*.05,2);banner('INFERNO');}
 else if(s==='22'){sfx('beam');shake(6);beams(ca,ra,0,PAL[a.t][3]);beams(cb,rb,1,PAL[b.t][3]);banner('CROSSFIRE')}
 else if(s==='12'){sfx('beam');sfx('boom');shake(8);for(let k=-1;k<=1;k++)beams(ca+k,ra+k,AB(k),'#ffb040',true);flash(.2,'#ffb050',.7);banner('BLAZING CROSS')}
 else {sfx('nova');shake(12);impact(x,y,'#e0fbff',1);flash(.6,'#fff',1);for(let k=-2;k<=2;k++)beams(ca+k,ra+k,AB(k),'#bff4ff',true);FX.push({k:'ring',x,y,r:4,vr:300,l:0,m:.6,col:'#fff',w:3});burst(x,y,['#ffffff','#e0fbff','#9fe8ff','#5aa8ff','#3a4aff'],200,220,{g:10});banner('SUPERNOVA BURST')}}
// ===== spellcasting: caster flare -> charge -> travelling bolt -> impact =====
const Q=[];function later(t,fn){Q.push({t,fn})}
function lit(col,a){if(G)G.lit={col,a:Math.max(a,(G.lit&&G.lit.a)||0)}}
function punch(v){if(G&&SAVE.set.shake)G.punch=Math.max(G.punch||0,v)}
function slowmo(t){if(G)G.slow=Math.max(G.slow||0,t)}
const SPC=g=>g.sp===1?'#ff8a2a':g.sp===3?'#ff7bff':g.sp===4?'#bff4ff':PAL[g.t][3];
function caster(x,y,col,m,big){FX.push({k:'cast',x,y,col,l:0,m:m||.3,a:Math.random()*6.28,big});
 const n=Math.round((big?36:16)*(HQ?1:.5));for(let i=0;i<n;i++){const a=Math.random()*6.283,d=rnd(big?18:9,big?46:20),tt=rnd(.12,m||.3)*.9,v=d/tt;PT.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,vx:-Math.cos(a)*v,vy:-Math.sin(a)*v,l:0,m:tt,ramp:[col,col,'#ffffff','#ffffff'],s:Math.random()<.3?1:.5,tr:1,g:0,dr:1})}}
function bolt(x0,y0,x1,y1,dl,tm,col,o){FX.push(Object.assign({k:'bolt',x0,y0,x1,y1,l:-dl,m:tm+.22,tm,col,seed:Math.random()*100,w:3},o||{}))}
function boltHead(f){const h=Math.min(1,Math.max(0,f.l/f.tm)),e=h*(.35+.65*h);return [f.x0+(f.x1-f.x0)*e,f.y0+(f.y1-f.y0)*e,e]}
function smoke(x,y,n,col){const pf=[];for(let i=0;i<Math.round(n*(HQ?1:.5));i++)pf.push({x:x+rnd(-8,8),y:y+rnd(-6,6),vx:rnd(-14,14),vy:rnd(-22,-6),r:rnd(3,6)});FX.push({k:'smoke',pf,l:0,m:1.1,col:col||'#3a3048'})}
function embers(x,y,n,ramp){for(let i=0;i<Math.round(n*(HQ?1:.5));i++)PT.push({x:x+rnd(-14,14),y:y+rnd(-10,10),vx:rnd(-14,14),vy:rnd(-30,-8),l:0,m:rnd(.7,1.4),ramp:ramp||['#fff2a0','#ffc030','#ff7a1a','#d02a10','#5a0e08'],s:Math.random()<.3?1:.5,tr:1,g:-6,dr:.985})}
function debris(x,y,t){burst(x,y,[PAL[t][1],PAL[t][2],PAL[t][3],PAL[t][4]],10,110,{big:.9,g:340,dr:.985,life:1.3})}
// returns how long the cast takes before the rune actually detonates
function castSpell(g,c,r){const x=cx(c),y=cy(r),q=G.chain>3?.75:1;
 if(g.sp===1){const ox=Math.max(14,Math.min(W-14,x+(c<4?44:-44))),oy=W-5,T=.42*q;caster(ox,oy,'#ffb040',.14*q);sfx('swell');later(.14*q,()=>sfx('whoosh'));
  bolt(ox,oy,x,y,.14*q,.26*q,'#ff9a30',{fire:1,w:7,tl:130});lit('#ff8a2a',.15);return T}
 if(g.sp===2){const col=PAL[g.t][3],T=.38*q;for(const [ox,oy] of [[3,y],[W-3,y],[x,3],[x,W-3]]){caster(ox,oy,col,.13*q);bolt(ox,oy,x,y,.13*q,.24*q,col,{w:4,tl:150})}sfx('swell');later(.13*q,()=>sfx('whoosh'));lit(col,.15);return T}
 if(g.sp===4){const T=.34*q;caster(x,y,'#bff4ff',.34*q,1);sfx('swell',1);lit('#bff4ff',.2);return T}
 return 0}
// dueling clash for two specials: two jets meet, struggle, then explode
function comboSpell(a,ca,ra,b,cb,rb){if(!(a.sp&&b.sp))return comboFire(a,ca,ra,b,cb,rb);G.chain=Math.max(G.chain,1);a.st=b.st='hold';const T=.5,hz=ra===rb,px=(cx(ca)+cx(cb))/2,py=(cy(ra)+cy(rb))/2;
 const A=hz?[3,py]:[px,3],B=hz?[W-3,py]:[px,W-3];const left=hz?(ca<cb?a:b):(ra<rb?a:b),right=left===a?b:a;
 FX.push({k:'clash',ax:A[0],ay:A[1],bx:B[0],by:B[1],px,py,hz,ca:SPC(left),cb:SPC(right),l:0,m:T,block:1,seed:Math.random()*100});caster(A[0],A[1],SPC(left),.12);caster(B[0],B[1],SPC(right),.12);
 sfx('swell');later(.1,()=>sfx('clash'));
 later(T-.1,()=>slowmo(.13));later(T,()=>{if(a.st==='hold')a.st='idle';if(b.st==='hold')b.st='idle';punch(.08);lit('#ffffff',.45);smoke(px,py,10);sfx('tail');comboFire(a,ca,ra,b,cb,rb)})}
function jet(x0,y0,x1,y1,col,w,a,fire,seed,tl){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,s0=Math.max(0,L-(tl||1e9));
 for(let s=s0;s<=L;s+=HQ?.5:1){const q=(s-s0)/Math.max(1,L-s0),x=x0+ux*s,y=y0+uy*s,wv=Math.sin(s*.22-now*38+seed)*1.4*(1-q),ww=Math.max(1,w*(.3+.7*q)*(1+.15*Math.sin(s*.7+now*50)));
  const hw=ww*2.6;fc.globalAlpha=a*.16*q;fc.fillStyle=fire?'#ff6a10':col;if(((s*2)|0)%2===0)fc.fillRect(rx(x+nx*wv-hw/2),rx(y+ny*wv-hw/2),hw,hw);fc.globalAlpha=a*(.2+.8*q);fc.fillStyle=fire?FIRE[Math.max(1,Math.min(5,Math.floor((1-q)*5.2)))]:col;fc.fillRect(rx(x+nx*wv-ww/2),rx(y+ny*wv-ww/2),ww,ww);
  if(q>.25){fc.fillStyle='#ffffff';fc.fillRect(rx(x+nx*wv*.5-.5),rx(y+ny*wv*.5-.5),1,1)}
  if(HQ&&((s*2)|0)%3===0){fc.fillStyle=col;for(const sg of [1,-1]){const o=sg*(ww*.5+1.5+Math.sin(s*.13+now*16+seed*sg)*2.5)*(1.2-q*.6);fc.globalAlpha=a*.55*q;fc.fillRect(rx(x+nx*o),rx(y+ny*o),.5,.5)}}}
 fc.globalAlpha=1}
// per-frame: sparks off travelling heads
function spellTick(dt){for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t-=dt;if(q.t<=0){Q.splice(i,1);try{q.fn()}catch(e){}}}
 if(G.punch>0)G.punch=Math.max(0,G.punch-dt*.45);
 for(const f of FX){if(f.l<0)continue;let hx,hy,col;if(f.k==='bolt'&&f.l<=f.tm){[hx,hy]=boltHead(f);col=f.col}else if(f.k==='clash'){hx=f.cx||f.px;hy=f.cy||f.py;col=Math.random()<.5?f.ca:f.cb}else continue;
  const n=HQ?3:1;for(let k=0;k<n;k++){const a=Math.random()*6.283,v=rnd(20,f.k==='clash'?140:60);PT.push({x:hx,y:hy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:0,m:rnd(.15,.4),ramp:f.fire?FIRE.slice(0,5):['#ffffff',col,col],s:Math.random()<.25?1:.5,tr:1,g:f.fire?-30:60,dr:.94})}}}
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
  if(g.st==='clear'){if(g.sp&&g.sp!==3&&!g.cast){g.cast=1;g.ct=Math.max(g.ct,0)+castSpell(g,c,r)}g.ct-=dt;if(g.ct<=0){grid[c][r]=null;shards(g,c,r);if(g.cause>1)addScoreQuiet(30*Math.max(1,G.chain));if(g.sp){const s=g.sp;detonate(g,c,r);g.sp=0;void s}}}}
 // gravity
 for(let c=0;c<N;c++){for(let pass=0;pass<N;pass++){let moved=false;for(let r=N-1;r>=1;r--){if(!grid[c][r]){const g=grid[c][r-1];if(g&&(g.st==='idle'||g.st==='fall')){grid[c][r]=g;grid[c][r-1]=null;g.st='fall';moved=true}}}
   if(!grid[c][0]){let top=0;for(let r=0;r<N;r++){const g=grid[c][r];if(g)top=Math.min(top,g.y)}const g=newGem(pick(c),Math.min(-1,top-1.05));g.x=c;g.vy=3;grid[c][0]=g;moved=true}if(!moved)break}}
 // falling
 for(let c=0;c<N;c++)for(let r=N-1;r>=0;r--){const g=grid[c][r];if(!g||g.st!=='fall')continue;g.vy=Math.min(16,g.vy+38*dt);g.y+=g.vy*dt;const b=at(c,r+1);if(b&&b.y-1<g.y)g.y=b.y-1;g.x=c;
  if(g.y>=r){g.y=r;g.st='idle';g.mv=now;if(g.vy>6)g.sq=1;g.vy=0;if(Math.random()<.3)sfx('land')}}
 resolveMatches();
 // settle bookkeeping
 const st=isSettled();if(st){G.settledFor+=dt;if(G.settledFor>.25&&G.chain){if(G.chain>=6)banner(G.chain>=10?'UNSTOPPABLE!':'MAGNIFICENT!');G.chain=0;hud()}
  G.idle+=dt;if(G.settledFor>.3&&!G.checked){G.checked=1;const mv=findMoves(grid.map(col=>col.map(g=>({t:g.t,sp:g.sp}))));G.moves=mv;if(!mv.length){if(G.mode==='classic')gameOver('Out of Moves');else reshuffle()}}
  if(G.idle>(G.mode==='zen'?5:9)&&!G.hint&&G.moves&&G.moves.length)G.hint=G.moves[(Math.random()*G.moves.length)|0]}
 else{G.settledFor=0;G.checked=0;G.hint=null;G.idle=0}
 if(G.mode==='lightning'&&!G.over){const p=G.time;G.time-=dt;if(Math.ceil(G.time)!==Math.ceil(p)&&G.time<10)sfx('tick');if(G.time<=0){G.time=0;gameOver("Time's Up")}hud()}
 spellTick(dt);if(G.shake>0)G.shake=Math.max(0,G.shake-dt*30);if(G.imp>0)G.imp-=G.slow>0?dt/.35:dt;
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
const BC=$('board'),bx=BC.getContext('2d');const DW=W*K;BC.width=BC.height=DW;bx.imageSmoothingEnabled=false;
const FC=mk(DW,DW),fc=FC.getContext('2d');fc.imageSmoothingEnabled=false;const B1C=mk(DW/4,DW/4),b1x=B1C.getContext('2d'),B2C=mk(DW/8,DW/8),b2x=B2C.getContext('2d');
let FRAMEG;const FRAME=(()=>{const D=DW,c=mk(D,D),x=c.getContext('2d'),im=x.createImageData(D,D),d=im.data,gc=mk(D,D),gxx=gc.getContext('2d'),gi=gxx.createImageData(D,D),g=gi.data;
 const R=srand(77),P=[];for(let i=0;i<256;i++)P.push(R());
 const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,h=(a,b)=>P[((a*17+b*31)%256+256)%256],s=t=>t*t*(3-2*t);return h(xi,yi)*(1-s(xf))*(1-s(yf))+h(xi+1,yi)*s(xf)*(1-s(yf))+h(xi,yi+1)*(1-s(xf))*s(yf)+h(xi+1,yi+1)*s(xf)*s(yf)};
 const ST=[[14,11,20],[30,25,40],[48,41,62],[70,62,88],[98,88,118],[136,124,158],[186,174,206]];
 const B0=M*K,B1=(M+N*CS)*K,put=(o,c)=>{d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255},gp=(o,c)=>{g[o]=c[0];g[o+1]=c[1];g[o+2]=c[2];g[o+3]=255};
 const rune=(px,py)=>{// rune band positions along ring
  let u,v;if(py<B0){u=px;v=py}else if(py>=B1){u=px;v=D-1-py}else if(px<B0){u=py;v=px}else{u=py;v=D-1-px}
  if(v<7||v>16)return 0;const seg=Math.floor((u-B0)/36);if(u<B0+6||u>=B1-6)return 0;const lu=(u-B0)-seg*36-13;if(lu<0||lu>=10)return 0;const gy=Math.floor((v-7)/2),gx2=Math.floor(lu/2);if(gy<0||gy>4)return 0;return GLYPH[(seg*3+(py<B0?0:py>=B1?2:px<B0?4:5))%7][gy][gx2]==='#'?1:0};
 for(let py=0;py<D;py++)for(let px=0;px<D;px++){const o=(py*D+px)*4;
  if(px>=B0&&px<B1&&py>=B0&&py<B1){const cc=Math.floor((px-B0)/S),rr=Math.floor((py-B0)/S),n=vn(px/7,py/7)*.5+vn(px/2,py/2)*.5;
   let col=(cc+rr)%2?[24,18,42]:[33,25,56];col=lerp3(col,[10,8,20],n*.35);const lx=(px-B0)%S,ly=(py-B0)%S;if(lx===0||ly===0)col=[13,10,24];else if(lx===1||ly===1)col=lerp3(col,[60,48,96],.35);put(o,col);continue}
  const de=Math.min(px,py,D-1-px,D-1-py),n=vn(px/6,py/6)*.6+vn(px/2.2,py/2.2)*.4;let lv=2.2+n*1.8+(bay(px,py)-.5)*.6;
  if(AB(vn(px/16+3,py/16+9)-.5)<.012)lv-=1.6;
  const top=py<B0&&py<=px&&py<=D-1-px,left=px<B0&&px<py&&px<=D-1-py,bot=py>=B1&&D-1-py<=px&&D-1-py<=D-1-px,right=!top&&!left&&!bot;
  if(de<1)lv=0;else if(de<4)lv+=(top||left)?2.2:-1.3;
  else if(de===5||de===6){lv=.6;gp(o,[150,90,255])}
  else if(de===7)lv+=1.2;
  const dIn=Math.max(B0-px,px-(B1-1),B0-py,py-(B1-1));
  if(dIn===1)lv=0;else if(dIn<=4)lv+=(top||left)?-1.4:1.8;
  const rn=rune(px,py);if(rn){lv=1.3;gp(o,[190,140,255])}else if(rune(px-1,py)||rune(px+1,py)||rune(px,py-1)||rune(px,py+1))lv=Math.min(lv,.6);else if(rune(px-1,py-1))lv+=1;
  // corner medallions
  const cxm=px<D/2?B0/2:D-B0/2,cym=py<D/2?B0/2:D-B0/2,md=Math.hypot(px+.5-cxm,py+.5-cym);
  if(md<11.5){lv=md>10?0:md>8.5?((px-cxm)+(py-cym)<0?6:3):1}
  let col=ST[Math.max(0,Math.min(6,Math.round(lv)))];col=lerp3(col,[60,30,90],.18);put(o,col)}
 x.putImageData(im,0,0);gxx.putImageData(gi,0,0);
 [[B0/2,B0/2,2],[D-B0/2,B0/2,1],[B0/2,D-B0/2,4],[D-B0/2,D-B0/2,0]].forEach(([u,v,t])=>{x.drawImage(SPR[t],u-8,v-8,16,16);gxx.drawImage(GLOW.s[t],u-11,v-11,22,22)});
 FRAMEG=gc;return c})();
function line(x0,y0,x1,y1){x0|=0;y0|=0;x1|=0;y1|=0;const dx=AB(x1-x0),dy=-AB(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy,n=0;while(n++<600){fc.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function srand(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
let cur={c:3,r:3,show:false},held=false;
let HQ=true,autoLow=false;const FL=[];const rx=v=>Math.round(v*K)/K;
function star(x,y,t,id,nova){const a0=t*1.6+id;fc.fillStyle=nova?'#bff4ff':'#ffffff';
 for(let k=0;k<8;k++){const a=a0+k*Math.PI/4,L=(k%2?5:10)+2.5*Math.sin(t*9+id+k);for(let s=1.5;s<L;s+=.5){const w=Math.max(.5,Math.round((1-s/L)*3)/2);fc.fillRect(rx(x+Math.cos(a)*s-w/2),rx(y+Math.sin(a)*s-w/2),w,w)}}
 fc.fillStyle='#ffffff';fc.fillRect(x-2,y-2,4,4);fc.fillRect(x-3,y-1,6,2);fc.fillRect(x-1,y-3,2,6)}
function render(){const t=now;bx.setTransform(1,0,0,1,0,0);bx.globalAlpha=1;bx.globalCompositeOperation='source-over';bx.drawImage(FRAME,0,0);
 bx.globalCompositeOperation='lighter';bx.globalAlpha=.3+.25*Math.sin(t*1.7);bx.drawImage(frameGlow(),0,0);bx.globalAlpha=1;bx.globalCompositeOperation='source-over';
 bx.setTransform(K,0,0,K,0,0);fc.setTransform(1,0,0,1,0,0);fc.clearRect(0,0,DW,DW);fc.setTransform(K,0,0,K,0,0);fc.globalAlpha=1;fc.globalCompositeOperation='lighter';if(!G)return;
 bx.save();bx.beginPath();bx.rect(M,M,N*CS,N*CS);bx.clip();
 if(G.hint){const [c1,r1,c2,r2]=G.hint;const a=(Math.sin(t*8)+1)/2;bx.fillStyle='#ffe08a';bx.globalAlpha=.25+a*.35;for(const [c,r] of [[c1,r1],[c2,r2]])bx.fillRect(M+c*CS+1,M+r*CS+1,CS-2,CS-2);bx.globalAlpha=1}
 for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c][r];if(!g||g.y<-1)continue;let x=rx(M+g.x*CS),y=rx(M+g.y*CS);
  if(g.st==='clear'){const k=Math.max(0,g.ct);if(g.toward&&k<.14){const p=1-k/.14;x=rx(x+(g.toward[0]-c)*CS*p*.5);y=rx(y+(g.toward[1]-r)*CS*p*.5)}bx.drawImage(g.ct<.1?WSPR[g.t]:SPR[g.t],x,y,CS,CS);if(g.ct<.1){fc.globalAlpha=.7;fc.drawImage(GLOW.s[g.t],x-4,y-4,CS+8,CS+8);fc.globalAlpha=1}continue}
  if(g.sq>0){const s=rx(g.sq*2);bx.drawImage(SPR[g.t],x-s,y+s*2,CS+s*2,CS-s*2);continue}
  const sp=g.sp;
  if(sp===1){bx.globalCompositeOperation='lighter';bx.globalAlpha=.85;bx.drawImage(FLAMEF[((t*14+g.id)|0)%8],x-6,y-6,CS+12,CS+12);bx.globalAlpha=.5+.4*Math.sin(t*10+g.id);bx.drawImage(GLOW.f[g.t],x-4,y-4,CS+8,CS+8);bx.globalAlpha=1;bx.globalCompositeOperation='source-over'}
  if(sp===4){bx.globalCompositeOperation='lighter';bx.globalAlpha=.9;bx.drawImage(CORONA[((t*10+g.id)|0)%8],x-6,y-6,CS+12,CS+12);bx.globalAlpha=.6+.4*Math.sin(t*14);bx.drawImage(GLOW.n[g.t],x-4,y-4,CS+8,CS+8);bx.globalAlpha=1;bx.globalCompositeOperation='source-over'}
  if(sp===3){bx.globalAlpha=.5+.5*Math.sin(t*6);bx.drawImage(ORBG,x-4,y-4,CS+8,CS+8);bx.globalAlpha=1;bx.drawImage(ORB[((t*14)|0)%16],x,y,CS,CS)}
  else{bx.drawImage(SPR[g.t],x,y,CS,CS);const ph=(t*.3+g.id*.1373)%1;if(ph<.1){bx.globalCompositeOperation='lighter';bx.globalAlpha=.75;bx.drawImage(GLINT[g.t][Math.floor(ph/.1*8)],x,y,CS,CS);bx.globalAlpha=1;bx.globalCompositeOperation='source-over'}}
  if(sp===2||sp===4)star(x+12,y+12,t,g.id,sp===4);
  if(g.pulse>0){bx.globalAlpha=g.pulse;bx.drawImage(WSPR[g.t],x,y,CS,CS);bx.globalAlpha=1}}
 // selection & cursor
 const corner=(c,r,col,o)=>{const x=M+c*CS,y=M+r*CS;bx.fillStyle=col;for(const [px,py,sx,sy] of [[x-o,y-o,1,1],[x+CS-1+o,y-o,-1,1],[x-o,y+CS-1+o,1,-1],[x+CS-1+o,y+CS-1+o,-1,-1]]){bx.fillRect(Math.min(px,px+sx*4),py,5,1);bx.fillRect(px,Math.min(py,py+sy*4),1,5)}};
 if(sel){const o=((t*6)|0)%2;corner(sel.c,sel.r,'#ffffff',o-1);bx.globalAlpha=.18;bx.fillStyle='#fff';bx.fillRect(M+sel.c*CS,M+sel.r*CS,CS,CS);bx.globalAlpha=1}
 if(cur.show){corner(cur.c,cur.r,held?'#ffe08a':'#7bf0ff',0);if(held){bx.fillStyle='#ffe08a';const x=M+cur.c*CS+11,y=M+cur.r*CS;bx.fillRect(x,y-1,2,1);bx.fillRect(x,y+CS,2,1);bx.fillRect(M+cur.c*CS-1,y+11,1,2);bx.fillRect(M+cur.c*CS+CS,y+11,1,2)}}
 bx.restore();
 // fx
 
 for(const f of FX){if(f.l<0)continue;const p=f.l/f.m;
  if(f.k==='fire'){const e=1-(1-p)*(1-p),r=f.R*(.25+.75*e),x0=Math.round(f.x),y0=Math.round(f.y),ri=Math.ceil(r);
   for(let yy=-ri;yy<=ri;yy++)for(let xx=-ri;xx<=ri;xx++){const d=Math.hypot(xx,yy)/r;if(d>=1)continue;const px=x0+xx,py=y0+yy,n=Math.sin(xx*.7+now*20)*Math.cos(yy*.6-now*17)*.18;
    let h=(1-d)*(1.25-p*1.3)+n+(d>.75?(.2-p*.2):0);if(h<bay(px,py)*.35)continue;const k=Math.max(0,Math.min(5,Math.floor(5-h*5-bay(px,py)*.8)));fc.fillStyle=FIRE[k];fc.fillRect(px,py,1,1)}}
  else if(f.k==='glow'){const r=f.r*(.6+p*.6);fc.globalAlpha=(1-p)*.5;fc.fillStyle=f.col;for(let k=0;k<4;k++){const rr=r*(1-k*.22);fc.fillRect(Math.round(f.x-rr),Math.round(f.y-rr*.7),Math.round(rr*2),Math.round(rr*1.4));fc.fillRect(Math.round(f.x-rr*.7),Math.round(f.y-rr),Math.round(rr*1.4),Math.round(rr*2))}fc.globalAlpha=1}
  else if(f.k==='ring'){const r=f.r+f.vr*f.l,th=1-p,w=f.w||1;fc.fillStyle=f.col;const st=Math.max(12,r*6);for(let i=0;i<st;i++){const a=i/st*6.283;for(let k=0;k<w;k++){const px=Math.round(f.x+Math.cos(a)*(r-k)),py=Math.round(f.y+Math.sin(a)*(r-k));if(bay(px,py)<th)fc.fillRect(px,py,1,1)}}}
  else if(f.k==='beam'){const w=Math.max(1,Math.round(f.w*(1-p*p))),core=p<.7?2:1;
   for(let k=-w-2;k<=w+2;k++){const d=AB(k);const dens=d<core?1:d<=w?1-(d-core)/(w-core+1)*.6:(.35*(1-p));fc.fillStyle=d<core?'#ffffff':f.col;
    if(f.h){const y=Math.round(f.at+k);if(dens>=1)fc.fillRect(M,y,N*CS,1);else for(let x=M;x<M+N*CS;x++)if(bay(x,y)<dens)fc.fillRect(x,y,1,1)}
    else{const x=Math.round(f.at+k);if(dens>=1)fc.fillRect(x,M,1,N*CS);else for(let y=M;y<M+N*CS;y++)if(bay(x,y)<dens)fc.fillRect(x,y,1,1)}}
   fc.fillStyle='#ffffff';for(let i=0;i<6;i++){const s=Math.random()*N*CS+M;if(f.h)fc.fillRect(s|0,(f.at+rnd(-w,w))|0,2,1);else fc.fillRect((f.at+rnd(-w,w))|0,s|0,1,2)}}
  else if(f.k==='arc'){const x2=cx(f.c),y2=cy(f.r),R=srand(((f.seed+((now*30)|0))|0)+1),pts=[[f.x1,f.y1]],n=Math.max(3,Math.round(Math.hypot(x2-f.x1,y2-f.y1)/8));
   for(let i=1;i<n;i++){const s=i/n;pts.push([f.x1+(x2-f.x1)*s+(R()-.5)*9,f.y1+(y2-f.y1)*s+(R()-.5)*9])}pts.push([x2,y2]);
   const fade=1-p;for(const [col,o] of [[f.col,1],[f.col,-1],['#ffffff',0]]){fc.fillStyle=col;fc.globalAlpha=o?fade*.8:fade;for(let i=0;i<pts.length-1;i++)line(pts[i][0]+o,pts[i][1],pts[i+1][0]+o,pts[i+1][1])}
   fc.globalAlpha=1;if(p<.3){fc.fillStyle='#ffffff';fc.fillRect(Math.round(x2)-2,Math.round(y2)-2,4,4)}}
  else if(f.k==='rays'){const n=f.n||12;fc.fillStyle=f.col;fc.globalAlpha=(1-p)*(1-p)*.3;for(let i=0;i<n;i++){const a=f.a+i*6.283/n+p*.6,L=f.L*(.4+p*.8);fc.beginPath();fc.moveTo(f.x,f.y);fc.lineTo(f.x+Math.cos(a-.06)*L,f.y+Math.sin(a-.06)*L);fc.lineTo(f.x+Math.cos(a+.06)*L,f.y+Math.sin(a+.06)*L);fc.fill()}fc.globalAlpha=1}
  else if(f.k==='cast'){const r=(f.big?18:5)+(f.big?20:10)*(1-p),al=Math.min(1,(1-p)*3+.3);fc.globalAlpha=al;fc.fillStyle=f.col;const n=f.big?12:8;
   for(let i=0;i<n;i++){const a=f.a+i*6.283/n+now*(f.big?3:7);fc.fillRect(rx(f.x+Math.cos(a)*r-.5),rx(f.y+Math.sin(a)*r-.5),1,1);if(HQ)fc.fillRect(rx(f.x+Math.cos(a+.2)*r*.7),rx(f.y+Math.sin(a+.2)*r*.7),.5,.5)}
   const L=2+(f.big?22:10)*p;fc.fillRect(rx(f.x-L),rx(f.y-.5),L*2,1);fc.fillRect(rx(f.x-.5),rx(f.y-L),1,L*2);fc.globalAlpha=al*.5;fc.fillRect(rx(f.x-L*.5),rx(f.y-L*.5),L,L);
   fc.globalAlpha=1;fc.fillStyle='#ffffff';const cz=1+p*(f.big?6:3);fc.fillRect(rx(f.x-cz/2),rx(f.y-cz/2),cz,cz)}
  else if(f.k==='bolt'){const [hx,hy]=boltHead(f),fade=f.l<=f.tm?1:Math.max(0,1-(f.l-f.tm)/(f.m-f.tm));
   if(f.l<=f.tm){jet(f.x0,f.y0,hx,hy,f.col,f.w,1,f.fire,f.seed,f.tl);fc.fillStyle=f.col;fc.globalAlpha=.6;fc.fillRect(rx(hx-f.w),rx(hy-f.w),f.w*2,f.w*2);fc.globalAlpha=1;fc.fillStyle='#ffffff';fc.fillRect(rx(hx-f.w*.5),rx(hy-f.w*.5),f.w,f.w)}
   else{const k=1-fade,tx=f.x0+(f.x1-f.x0)*k,ty=f.y0+(f.y1-f.y0)*k;jet(tx,ty,f.x1,f.y1,f.col,f.w*fade,fade,f.fire,f.seed,f.tl)}}
  else if(f.k==='clash'){const st=Math.sin(now*31+f.seed)*3+Math.sin(now*13)*2,cxp=f.hz?f.px+st:f.px,cyp=f.hz?f.py:f.py+st;f.cx=cxp;f.cy=cyp;const gr=Math.min(1,f.l/.12);
   const ex=f.ax+(cxp-f.ax)*gr,ey=f.ay+(cyp-f.ay)*gr,fx2=f.bx+(cxp-f.bx)*gr,fy2=f.by+(cyp-f.by)*gr;jet(f.ax,f.ay,ex,ey,f.ca,6,1,f.ca==='#ff8a2a',f.seed,200);jet(f.bx,f.by,fx2,fy2,f.cb,6,1,f.cb==='#ff8a2a',f.seed+3,200);
   if(gr>=1){const R=5+p*9+Math.sin(now*60)*2;fc.globalAlpha=.18;fc.fillStyle='#ffffff';fc.fillRect(rx(cxp-R*2.2),rx(cyp-R*2.2),R*4.4,R*4.4);fc.fillStyle=f.ca;fc.globalAlpha=.7;fc.fillRect(rx(cxp-R-1),rx(cyp-R),R,R*2);fc.fillStyle=f.cb;fc.fillRect(rx(cxp+1),rx(cyp-R),R,R*2);fc.globalAlpha=1;fc.fillStyle='#ffffff';fc.fillRect(rx(cxp-R*.55),rx(cyp-R*.55),R*1.1,R*1.1);
    for(let z=0;z<(HQ?3:1);z++){const a=Math.random()*6.28,L=rnd(8,26);fc.fillStyle=Math.random()<.5?f.ca:f.cb;line(cxp,cyp,cxp+Math.cos(a)*L,cyp+Math.sin(a)*L)}}}
  else if(f.k==='wisp'){for(let i=0;i<f.n;i++){const a0=f.a+i*6.283/f.n,sg=i%2?1:-1;for(let j=0;j<(HQ?18:9);j++){const tau=p*1.15-j*.018;if(tau<0||tau>1)continue;const rr=tau*f.R,ang=a0+sg*tau*2.8,x=f.x+Math.cos(ang)*rr,y=f.y+Math.sin(ang)*rr*.9,al=(1-j/(HQ?18:9))*(1-p*.7);
    fc.globalAlpha=al;fc.fillStyle=j<2?'#ffffff':j<6?'#e0fbff':'#7fd0ff';const s=j<2?3:j<6?2:1;fc.fillRect(rx(x-s/2),rx(y-s/2),s,s)}}fc.globalAlpha=1}
  else if(f.k==='smoke'){bx.globalCompositeOperation='source-over';for(const s of f.pf){const x=s.x+s.vx*f.l,y=s.y+s.vy*f.l,r=s.r+f.l*12;bx.globalAlpha=(1-p)*(1-p)*.2;bx.fillStyle=f.col;bx.fillRect(rx(x-r),rx(y-r*.6),r*2,r*1.2);bx.fillRect(rx(x-r*.6),rx(y-r),r*1.2,r*2);bx.globalAlpha=(1-p)*.12;bx.fillStyle='#8a7aa0';bx.fillRect(rx(x-r*.5),rx(y-r*.8),r,r*.4)}bx.globalAlpha=1}
  else if(f.k==='flash')FL.push(f)}
 for(const p of PT){const k=Math.min(p.ramp.length-1,Math.floor(p.l/p.m*p.ramp.length));fc.fillStyle=p.ramp[k];const s=p.s<1?.5:p.s;fc.fillRect(rx(p.x),rx(p.y),s,s);if(HQ&&p.tr&&s<=1){fc.globalAlpha=.45;fc.fillRect(rx(p.x-p.vx*.016),rx(p.y-p.vy*.016),.5,.5);fc.globalAlpha=1}}
 // composite: heat shimmer, fx, pixel bloom, impact frame
 bx.setTransform(1,0,0,1,0,0);
 if(HQ)for(const f of FX)if(f.k==='fire'&&f.l>=0&&f.l<f.m*.9){const p=f.l/f.m,R=(f.R+10)*K,x0=Math.max(0,Math.round(f.x*K-R)),y0=Math.max(0,Math.round(f.y*K-R)),w=Math.min(DW-x0,R*2),h=Math.min(DW-y0,R*2);
  for(let yy=y0;yy<y0+h;yy+=2){const off=Math.round(Math.sin(yy*.31+now*30)*2.2*(1-p));if(off)bx.drawImage(BC,x0,yy,w,2,x0+off,yy,w,2)}}
 bx.globalCompositeOperation='lighter';bx.drawImage(FC,0,0);
 if(HQ){b1x.globalCompositeOperation='copy';b1x.imageSmoothingEnabled=true;b1x.drawImage(FC,0,0,DW/4,DW/4);b2x.globalCompositeOperation='copy';b2x.imageSmoothingEnabled=true;b2x.drawImage(B1C,0,0,DW/8,DW/8);
  bx.imageSmoothingEnabled=false;bx.globalAlpha=.4;bx.drawImage(B1C,0,0,DW,DW);bx.globalAlpha=.55;bx.drawImage(B2C,0,0,DW,DW);bx.globalAlpha=1}
 bx.setTransform(K,0,0,K,0,0);for(const f of FL){const p=f.l/f.m,lev=Math.round((1-p)*(1-p)*9*f.d);if(lev>0){bx.globalAlpha=.35;bx.drawImage(DITH[Math.min(16,lev)],0,0);bx.globalAlpha=(1-p)*.25;bx.fillStyle=f.col;bx.fillRect(0,0,W,W);bx.globalAlpha=1}}FL.length=0;bx.setTransform(1,0,0,1,0,0);
 if(G.imp>0){bx.globalCompositeOperation='difference';bx.fillStyle='#ffffff';bx.fillRect(0,0,DW,DW)}
 bx.globalCompositeOperation='source-over';bx.setTransform(K,0,0,K,0,0);
 for(const f of FX)if(f.k==='txt'){const p=f.l/f.m;if(p<.85||((now*20)|0)%2)ptext(bx,f.s,f.x,f.y-p*14,f.col,+f.s>=1000?2:1)}
 // shake offset applied via css
 const s=G.shake>0?Math.round(rnd(-1,1)*Math.min(4,G.shake*.5)):0,s2=G.shake>0?Math.round(rnd(-1,1)*Math.min(4,G.shake*.5)):0;const pz=G.punch>0?1+G.punch:1;BC.style.transform=s||s2||pz>1?`translate(${s*scale}px,${s2*scale}px) scale(${pz})`:'none'}
// ===== background: 12 themed animated backdrops =====
const BG=$('bg'),gx=BG.getContext('2d');let stars=[],motes=[],AMB=[],ART={},bgHue=0;
// grade = tint for frame glow + UI accents; amb = ambient layers; lite = bright theme (stronger board backing)
const THEMES=[
 {id:'tower',file:'',name:'The Wizard Tower',grade:'#a970ff',amb:['shafts','stars','motes'],shaft:'#b9a0ff'},
 {id:'library',name:'The Sunlit Library',grade:'#ffc25a',amb:['shafts','dust','motes'],shaft:'#fff0b0',lite:1},
 {id:'meadow',name:'The Crystal Meadow',grade:'#ff9ad0',amb:['petals','fog','motes'],lite:1,fog:'#ffd8f0'},
 {id:'sky',name:'The Cloud Temple',grade:'#6ad8ff',amb:['clouds','dust','birds'],lite:1,fog:'#ffffff'},
 {id:'green',name:'The Enchanted Greenhouse',grade:'#5cff9a',amb:['fireflies','leaves','shafts'],shaft:'#b0ffd0',fly:'#c8ff70'},
 {id:'crypt',name:'The Necromancer\u2019s Crypt',grade:'#7dff5a',amb:['fog','wisps','dust'],fog:'#5aff7a',dark:1},
 {id:'blood',name:'The Blood Moon Ruins',grade:'#ff3a3a',amb:['bats','embers','fog'],fog:'#ff4a3a',ember:['#ffb0a0','#ff4030','#a01010'],dark:1},
 {id:'cath',name:'The Shadow Cathedral',grade:'#b06aff',amb:['fog','shafts','dust'],fog:'#8a50ff',shaft:'#a070ff',dark:1},
 {id:'forge',name:'The Demon Forge',grade:'#ff7a1a',amb:['embers','heat','embers'],ember:['#fff2a0','#ffc030','#ff6a10','#a02008'],dark:1},
 {id:'lake',name:'The Moonlit Lake',grade:'#b8a8ff',amb:['stars','ripples','fireflies'],fly:'#e0d8ff'},
 {id:'mount',name:'The Misty Mountain Pass',grade:'#9ad0e0',amb:['fog','rain','birds'],fog:'#e8f0f4'},
 {id:'aurora',name:'The Aurora Tundra',grade:'#4affc8',amb:['aurora','snow','stars']},
 {id:'forest',name:'The Enchanted Forest',grade:'#d0ff6a',amb:['fireflies','shafts','leaves'],shaft:'#e8ffb0',fly:'#fff07a'}];
const PREV=mk(1,1),pvx=PREV.getContext('2d');let TH=THEMES[0],thI=-1,trans=0,thName=0;
function artFor(th,k){const key=th.id+k+(HQ?'':'l');if(ART[key]!==undefined)return ART[key];ART[key]=null;const im=new Image();im.decoding='async';im.onload=()=>{ART[key]=im;if(th===TH)paintArt()};im.src='art/hd/'+th.id+'-'+k+(HQ?'':'-lq')+'.webp';return null}
// HD backdrop: ONE cover-fit image, drawn once at native device resolution into a static layer (no per-frame redraw, no second copy)
const ARTC=[$('art0'),$('art1')];let artF=0;
function artKey(){return innerHeight>innerWidth*1.1?'port':'land'}
function paintArt(cv){cv=cv||ARTC[artF];const dpr=devicePixelRatio||1,iw=innerWidth,ih=innerHeight,cap=HQ?3840:1280,f=Math.min(dpr,cap/Math.max(iw,ih)),w=Math.round(iw*f),h=Math.round(ih*f);
 if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}const c=cv.getContext('2d'),k=artKey(),im=artFor(TH,k);c.fillStyle='#0b0618';c.fillRect(0,0,w,h);if(!im)return;
 c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';const s=Math.max(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;c.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh)}
function themeIndex(level){if(!G||level<=1)return 0;const n=THEMES.length;if(!Array.isArray(G.thOrd)||G.thOrd[0]!==0)G.thOrd=[0];
 while(G.thOrd.length<level){const last=G.thOrd[G.thOrd.length-1],first=G.thOrd.length===1;let bag=[...Array(n).keys()].filter(i=>!(first&&i===0));
  for(let i=bag.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[bag[i],bag[j]]=[bag[j],bag[i]]}
  if(bag[0]===last){const j=1+((Math.random()*(bag.length-1))|0);[bag[0],bag[j]]=[bag[j],bag[0]]}G.thOrd.push(...bag)}// shuffled bags: every theme once per cycle, never twice in a row
 return G.thOrd[level-1]}
// tinted frame glow per theme
const FGT={};function frameGlow(){const k=TH.id;if(FGT[k])return FGT[k];const c=mk(DW,DW),x=c.getContext('2d');x.drawImage(FRAMEG,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=.75;x.fillStyle=TH.grade;x.fillRect(0,0,DW,DW);return FGT[k]=c}
function hexA(h,a){return h+Math.round(a*255).toString(16).padStart(2,'0')}
function setBg(level){setBg0(level);paintArt()}
function setBg0(level){const port=innerHeight>innerWidth*1.1,h=port?480:270,w=Math.max(1,Math.round(h*innerWidth/innerHeight));
 const ni=themeIndex(level||1),changed=ni!==thI;
 const swap=changed&&thI>=0;
 if(BG.width!==w||BG.height!==h){BG.width=w;BG.height=h;gx.imageSmoothingEnabled=false}
 BG.style.filter='none';
 if(changed||!AMB.length){thI=ni;TH=THEMES[ni];musForTheme(TH);
  if(swap){const o=ARTC[artF];artF^=1;const nc=ARTC[artF];paintArt(nc);nc.style.zIndex=-1;o.style.zIndex=-2;nc.style.clipPath='circle(0% at 50% '+(port?42:50)+'%)';nc.style.visibility='visible';trans=1}
  if(G){const nx=THEMES[themeIndex((level||1)+1)];artFor(nx,artKey())}// prefetch only the next themedocument.documentElement.style.setProperty('--acc',TH.grade);document.documentElement.style.setProperty('--accA',hexA(TH.grade,.55));
  if(changed&&level>1){const e=$('theme');if(e){e.innerHTML='<small>Level '+level+'</small>'+TH.name;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');clearTimeout(thName);thName=setTimeout(()=>e.classList.remove('on'),2600)}}}
 const lo=!HQ,n=v=>Math.round(v*(lo?.45:1));
 stars=Array.from({length:n(60)},()=>({x:Math.random()*w,y:Math.random()*h*.55,p:Math.random()*6}));
 motes=Array.from({length:n(36)},()=>({x:Math.random()*w,y:Math.random()*h,v:rnd(4,12),g:(Math.random()*7)|0,ph:Math.random()*6,gly:Math.random()<.35}));
 AMB=[];const add=(k,cnt,f)=>{for(let i=0;i<n(cnt);i++)AMB.push(Object.assign({k,x:Math.random()*w,y:Math.random()*h,ph:Math.random()*6.28},f?f(i):{}))};
 for(const a of TH.amb){
  if(a==='fog'&&!lo)add('fog',7,()=>({y:h*rnd(.45,.95),r:rnd(40,90),v:rnd(2,6)*(Math.random()<.5?-1:1)}));
  if(a==='clouds')add('fog',lo?3:8,()=>({y:h*rnd(.1,.95),r:rnd(30,70),v:rnd(3,8)}));
  if(a==='embers')add('ember',40,()=>({v:rnd(10,30)}));
  if(a==='rain')add('rain',70,()=>({v:rnd(160,220)}));
  if(a==='snow')add('snow',70,()=>({v:rnd(6,16),s:Math.random()<.2?2:1}));
  if(a==='fireflies')add('fly',22);
  if(a==='petals')add('petal',26,()=>({v:rnd(8,16)}));
  if(a==='leaves')add('leaf',14,()=>({v:rnd(6,12)}));
  if(a==='bats')add('bat',6,()=>({v:rnd(20,40),y:h*rnd(.05,.45)}));
  if(a==='birds')add('bird',5,()=>({v:rnd(10,20),y:h*rnd(.05,.4)}));
  if(a==='dust')add('dust',40,()=>({v:rnd(1,4)}));
  if(a==='wisps')add('wisp',8,()=>({v:rnd(6,14)}));
  if(a==='ripples')add('rip',14,()=>({y:h*rnd(.72,.98)}));}}
let bgT=0;function drawArt(ctx,im,w,h,ox,oy,sc){const s=Math.max(w/im.width,h/im.height)*(sc||1),dw=im.width*s,dh=im.height*s;ctx.drawImage(im,Math.round((w-dw)/2+ox),Math.round((h-dh)/2+oy),Math.round(dw),Math.round(dh))}
function renderBg(dt){bgT+=dt;if(G&&G.lit)G.lit.a=Math.max(0,G.lit.a-dt*2.2);if(bgT<1/30)return;const fd=bgT;bgT=0;const t=now,w=BG.width,h=BG.height,port=h>w,k=port?'port':'land';
 // the painted backdrop lives on the static #art layer; this canvas carries ambient overlays only
 gx.globalCompositeOperation='source-over';gx.globalAlpha=1;gx.clearRect(0,0,w,h);
 const A=TH.amb;gx.globalCompositeOperation='lighter';
 if(A.includes('shafts')){const sh=.05+.03*Math.sin(t*.7);gx.fillStyle=TH.shaft||'#b9a0ff';for(let q=0;q<3;q++){gx.globalAlpha=sh*(1-q*.25);gx.beginPath();const x0=w*(.42+q*.06)+Math.sin(t*.3+q)*4;gx.moveTo(x0,0);gx.lineTo(x0+w*.05,0);gx.lineTo(x0+w*.22+q*10,h);gx.lineTo(x0+w*.1,h);gx.fill()}gx.globalAlpha=1}
 if(A.includes('aurora')){for(let b=0;b<(HQ?3:2);b++)for(let x=0;x<w;x+=2){const y0=h*(.08+b*.07)+Math.sin(x*.02+t*.5+b*2)*h*.05+Math.sin(x*.05-t*.8)*h*.015,L=h*(.12+.06*Math.sin(x*.03+t+b)),a=.10+.08*Math.sin(x*.04+t*1.3+b);gx.globalAlpha=Math.max(0,a);gx.fillStyle=b===1?'#7a5aff':'#3affb0';gx.fillRect(x,y0,2,L);gx.globalAlpha=Math.max(0,a*1.4);gx.fillStyle='#d0fff0';gx.fillRect(x,y0+L-2,2,1)}gx.globalAlpha=1}
 if(A.includes('heat')){gx.globalAlpha=.08+.05*Math.sin(t*2.3);const gr=gx.createLinearGradient(0,h,0,h*.5);gr.addColorStop(0,'#ff5a10');gr.addColorStop(1,'rgba(0,0,0,0)');gx.fillStyle=gr;gx.fillRect(0,0,w,h);gx.globalAlpha=1}
 if(A.includes('stars'))for(const s of stars){const v=(Math.sin(t*2.2+s.p)+1)/2;if(v<.6)continue;gx.fillStyle=v>.92?'#ffffff':'#9c8fd0';gx.fillRect(s.x|0,s.y|0,1,1)}
 const D=fd;
 for(const p of AMB){switch(p.k){
  case 'fog':{p.x+=p.v*D;if(p.x>w+p.r)p.x=-p.r;if(p.x<-p.r)p.x=w+p.r;gx.globalAlpha=TH.lite?.05:.07;gx.fillStyle=TH.fog||'#ffffff';for(let q=0;q<3;q++){const rr=p.r*(1-q*.25);gx.fillRect(p.x-rr,p.y-rr*.25+Math.sin(t*.4+p.ph)*3,rr*2,rr*.5)}break}
  case 'ember':{p.y-=p.v*D;p.x+=Math.sin(t*2+p.ph)*.4;if(p.y<-2){p.y=h+2;p.x=Math.random()*w}const R=TH.ember||FIRE,c=R[((t*3+p.ph)|0)%R.length];gx.globalAlpha=.5+.5*Math.sin(t*9+p.ph);gx.fillStyle=c;gx.fillRect(p.x|0,p.y|0,1,1);gx.globalAlpha*=.4;gx.fillRect(p.x|0,(p.y|0)+1,1,2);break}
  case 'rain':{p.y+=p.v*D;p.x-=p.v*D*.25;if(p.y>h){p.y=-6;p.x=Math.random()*w*1.2}gx.globalAlpha=.22;gx.fillStyle='#cfe4ff';gx.fillRect(p.x|0,p.y|0,1,5);break}
  case 'snow':{p.y+=p.v*D;p.x+=Math.sin(t+p.ph)*.3;if(p.y>h){p.y=-2;p.x=Math.random()*w}gx.globalAlpha=.7;gx.fillStyle='#ffffff';gx.fillRect(p.x|0,p.y|0,p.s,p.s);break}
  case 'fly':{p.x+=Math.cos(t*.7+p.ph)*.5;p.y+=Math.sin(t*.9+p.ph*1.3)*.4;const a=Math.max(0,Math.sin(t*1.7+p.ph*3));if(a<.05)break;gx.globalAlpha=a;gx.fillStyle=TH.fly||'#fff07a';gx.fillRect(p.x|0,p.y|0,1,1);gx.globalAlpha=a*.35;gx.fillRect((p.x|0)-1,p.y|0,3,1);gx.fillRect(p.x|0,(p.y|0)-1,1,3);break}
  case 'petal':{p.y+=p.v*D;p.x+=p.v*D*.6+Math.sin(t*2+p.ph)*.4;if(p.y>h||p.x>w){p.y=-3;p.x=Math.random()*w-20}gx.globalAlpha=.8;gx.fillStyle=((t*4+p.ph)|0)%2?'#ffc0e0':'#ff90c8';gx.fillRect(p.x|0,p.y|0,2,1);break}
  case 'leaf':{p.y+=p.v*D;p.x+=Math.sin(t*1.5+p.ph)*.6;if(p.y>h){p.y=-3;p.x=Math.random()*w}gx.globalAlpha=.7;gx.fillStyle=((t*3+p.ph)|0)%2?'#9aff6a':'#4ac860';gx.fillRect(p.x|0,p.y|0,2,1);gx.fillRect((p.x|0)+1,(p.y|0)+1,1,1);break}
  case 'bat':case 'bird':{p.x+=p.v*D;if(p.x>w+6){p.x=-6;p.y=h*rnd(.05,.45)}const fl=((t*(p.k==='bat'?12:6)+p.ph)|0)%2,yy=(p.y+Math.sin(t*2+p.ph)*3)|0,xx=p.x|0;gx.globalCompositeOperation='source-over';gx.globalAlpha=.85;gx.fillStyle=p.k==='bat'?'#1a0406':'#3a4450';gx.fillRect(xx,yy,1,1);gx.fillRect(xx-2,yy-(fl?1:-1),2,1);gx.fillRect(xx+1,yy-(fl?1:-1),2,1);gx.globalCompositeOperation='lighter';break}
  case 'dust':{p.y-=p.v*D*.3;p.x+=Math.sin(t*.5+p.ph)*.15;if(p.y<0)p.y=h;const a=.25+.25*Math.sin(t*2+p.ph);gx.globalAlpha=a;gx.fillStyle=TH.lite?'#fff4c8':'#c8b8e0';gx.fillRect(p.x|0,p.y|0,1,1);break}
  case 'wisp':{p.y-=p.v*D;p.x+=Math.sin(t*1.2+p.ph)*.8;if(p.y<-8){p.y=h+8;p.x=Math.random()*w}gx.fillStyle='#8aff9a';for(let q=0;q<6;q++){gx.globalAlpha=.25*(1-q/6);gx.fillRect((p.x+Math.sin(t*3+p.ph+q*.6)*2)|0,(p.y+q*2)|0,2-(q>2),2)}break}
  case 'rip':{const a=(Math.sin(t*1.3+p.ph)+1)/2;gx.globalAlpha=a*.35;gx.fillStyle='#e8e0ff';const L=4+a*8;gx.fillRect((p.x-L/2)|0,p.y|0,L|0,1);break}}}
 if(A.includes('motes'))for(const m of motes){m.y-=m.v*.033;if(m.y<-6){m.y=h+4;m.x=Math.random()*w}const xx=(m.x+Math.sin(t*.8+m.ph)*4)|0,yy=m.y|0,a=.35+.35*Math.sin(t*3+m.ph);gx.globalAlpha=a;gx.fillStyle=PAL[m.g][3];
  if(m.gly){const gl=GLYPH[m.g];for(let j=0;j<5;j++)for(let i=0;i<5;i++)if(gl[j][i]==='#')gx.fillRect(xx+i,yy+j,1,1)}else{gx.fillRect(xx,yy,1,1);gx.globalAlpha=a*.4;gx.fillRect(xx-1,yy,3,1);gx.fillRect(xx,yy-1,1,3)}}
 // theme-graded arcane pulse behind the board
 const bcx=w/2,bcy=h*(port?.42:.5),pr=Math.min(w,h)*(.42+.03*Math.sin(t*1.3));gx.globalAlpha=.10+.05*Math.sin(t*1.3);let gr=gx.createRadialGradient(bcx,bcy,0,bcx,bcy,pr);gr.addColorStop(0,TH.grade);gr.addColorStop(1,'rgba(0,0,0,0)');gx.fillStyle=gr;gx.fillRect(0,0,w,h);
 // spell light flicker tints the whole backdrop
 if(G&&G.lit&&G.lit.a>0){gx.globalAlpha=Math.min(.5,G.lit.a)*(.75+.25*Math.random());gx.fillStyle=G.lit.col;gx.fillRect(0,0,w,h)}
 gx.globalCompositeOperation='source-over';
 // readability: bright themes get a darker backing behind the board plus a stronger vignette
 const bk=TH.lite?.55:.3;gx.globalAlpha=bk;gr=gx.createRadialGradient(bcx,bcy,Math.min(w,h)*.18,bcx,bcy,Math.min(w,h)*.62);gr.addColorStop(0,'#0a0614');gr.addColorStop(1,'rgba(10,6,20,0)');gx.fillStyle=gr;gx.fillRect(0,0,w,h);
 gx.globalAlpha=TH.lite?.45:.35;const vg=gx.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'#000');gx.fillStyle=vg;gx.fillRect(0,0,w,h);
 // swirl transition: previous theme spins and shrinks into a closing iris
 if(trans>0){trans=Math.max(0,trans-fd/1.3);const p=1-trans,e=p*p*(3-2*p),nc=ARTC[artF],oc=ARTC[artF^1];
  if(trans>0){nc.style.clipPath='circle('+(e*120).toFixed(2)+'% at 50% '+(port?42:50)+'%)';oc.style.transform='rotate('+(e*1.4)+'rad) scale('+(1+e*.5)+')';oc.style.opacity=1-e*.6}
  else{nc.style.clipPath='none';oc.style.visibility='hidden';oc.style.transform='none';oc.style.opacity=1}
  gx.globalCompositeOperation='lighter';gx.globalAlpha=(1-p)*.8;gx.strokeStyle=TH.grade;gx.lineWidth=3;gx.beginPath();gx.arc(bcx,bcy,Math.max(w,h)*1.1*e,0,6.283);gx.stroke();
  for(let i=0;i<(HQ?24:10);i++){const a=i/(HQ?24:10)*6.283+e*4,r=Math.max(w,h)*1.1*e;gx.fillStyle='#ffffff';gx.fillRect((bcx+Math.cos(a)*r)|0,(bcy+Math.sin(a)*r)|0,2,2)}gx.globalCompositeOperation='source-over'}
 gx.globalAlpha=1}
// ===== layout =====
let scale=1;
function layout(){const port=innerHeight>innerWidth*1.1;document.body.classList.toggle('port',port);const dpr=devicePixelRatio||1;
 const nb=!port&&innerWidth<1000;document.body.classList.toggle('nob2',nb);let avail;if(port){const top=$('side').offsetHeight+16,bot=80+$('book2').offsetHeight+16;avail=Math.min(innerWidth-8,innerHeight-top-bot)}else avail=Math.min(innerWidth-330-(nb?0:250),innerHeight-30);
 let s=Math.floor(avail*dpr/W);if(s<1)s=1;let css=W*s/dpr;if(css<avail*.92){css=Math.floor(avail)}// fallback fractional when integer too small
 BC.style.width=BC.style.height=css+'px';scale=css/W;if(G)setBg(G.level);else setBg(1)}
addEventListener('resize',layout);
// ===== hud / ui =====
function BOOK(){const ch=G.chain||0;G.best=Math.max(G.best||0,ch);$('cmbV').textContent='×'+ch;const pe=$('pips').children;for(let i=0;i<pe.length;i++)pe[i].className=i<Math.min(10,ch)?(i>=6?'on hot':'on'):'';
 $('bkBest').textContent='×'+(G.best||0);const lt=G.mode==='lightning';$('bkNL').textContent=lt?'Time left':'To level '+(G.level+1);$('bkNext').textContent=lt?Math.ceil(G.time)+'s':Math.max(0,need(G.level)-G.prog).toLocaleString();$('bkMade').textContent=G.made||0;$('bkLv').textContent=lt?'⚡':G.level}
function hud(){if(!G)return;BOOK();$('score').textContent=G.score.toLocaleString();const lt=G.mode==='lightning';$('lvlL').textContent=lt?'Time':'Level';$('lvl').textContent=lt?Math.ceil(G.time)+'s':G.level;
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
 $('sSnd').textContent='Sound: '+(SAVE.set.snd?'On':'Off');$('sMus').textContent='Music: '+(SAVE.set.mus?'On':'Off');$('sQ').textContent='Effects quality: '+({auto:'Auto'+(autoLow?' (Low now)':''),high:'High',low:'Low'})[SAVE.set.q];$('sShake').textContent='Screen shake: '+(SAVE.set.shake?'On':'Off');
 $('bSnd').classList.toggle('off',!SAVE.set.snd);$('bMus').classList.toggle('off',!SAVE.set.mus);
 $('sTab').innerHTML=['classic','zen','lightning'].map(m=>`<tr><td>${m[0].toUpperCase()+m.slice(1)}${SAVE.lvl[m]?' <small>(best level '+SAVE.lvl[m]+')</small>':''}</td><td>${(SAVE.best[m]||0).toLocaleString()}</td></tr>`).join('')+`<tr><td>Power-ups forged (total)</td><td>${(SAVE.forged||0).toLocaleString()}</td></tr>`}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{audio();const m=b.dataset.mode;SAVE['save_'+m]=null;startGame(m)});
$('mCont').onclick=()=>{audio();const m=$('mCont').dataset.m;startGame(m,SAVE['save_'+m])};
$('mHelp').onclick=()=>{backTo='pMenu';showP('pHelpP')};$('mScores').onclick=()=>{backTo='pMenu';showP('pScores')};$('mSet').onclick=()=>{backTo='pMenu';showP('pSetP')};
$('pRes').onclick=()=>hideOv();$('pHelp').onclick=()=>{backTo='pPause';showP('pHelpP')};$('pSet').onclick=()=>{backTo='pPause';showP('pSetP')};
$('pQuit').onclick=()=>{saveGame();if(G&&G.mode==='lightning')SAVE.best.lightning=Math.max(SAVE.best.lightning,G.score);persist();G=null;showP('pMenu')};
$('oAgain').onclick=()=>startGame(G.mode);$('oMenu').onclick=()=>{G=null;showP('pMenu')};
document.querySelectorAll('.back').forEach(b=>b.onclick=()=>menuBack());
$('sCred').onclick=()=>showP('pCred');
[['vMus','mv'],['vSfx','sv']].forEach(([id,k])=>{const e=$(id);e.value=Math.round(SAVE.set[k]*100);e.oninput=()=>{audio();SAVE.set[k]=e.value/100;setVols();persist()};e.onchange=()=>{if(k==='sv')sfx('match',3)}});
const togS=()=>{SAVE.set.snd^=1;setVols();persist();refreshMenu();setFocus()},togM=()=>{audio();SAVE.set.mus^=1;setVols();persist();refreshMenu();setFocus()};
$('sQ').onclick=()=>{SAVE.set.q=({auto:'high',high:'low',low:'auto'})[SAVE.set.q];autoLow=false;setQ();persist();refreshMenu();setFocus()};$('sSnd').onclick=togS;$('sMus').onclick=togM;$('sShake').onclick=()=>{SAVE.set.shake^=1;persist();refreshMenu();setFocus()};$('sReset').onclick=()=>{if(confirm('Reset all records?')){SAVE.best={classic:0,zen:0,lightning:0};SAVE.lvl={classic:0,zen:0};SAVE.forged=0;persist();refreshMenu()}};
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
function menuBack(){if(curP==='pPause')hideOv();else if(curP==='pCred')showP('pSetP');else if(curP==='pHelpP'||curP==='pScores'||curP==='pSetP')showP(G&&backTo==='pPause'?'pPause':'pMenu')}
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
let last=performance.now(),fpsA=0,fpsN=0,lowS=0;function setQ(){const o=HQ;HQ=SAVE.set.q==='high'||(SAVE.set.q==='auto'&&!autoLow);if(o!==HQ)paintArt()}setQ();window.__fps=60;
function frame(ts){let dt=Math.min(.05,(ts-last)/1000);last=ts;fpsA+=dt;fpsN++;if(fpsA>1){window.__fps=Math.round(fpsN/fpsA);fpsA=0;fpsN=0;if(SAVE.set.q==='auto'&&!paused&&!document.hidden){if(window.__fps<48)lowS++;else lowS=0;if(lowS>=2&&!autoLow){autoLow=true;setQ()}}}
 pollPad(dt);if(G&&G.slow>0&&!paused){G.slow-=dt;dt*=.35}if(!paused)update(dt);else now+=0;render();renderBg(dt);requestAnimationFrame(frame)}
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
