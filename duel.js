'use strict';const DK=60;
// ===== Runeshatter v12: DUELS — match-3 wizard battles =====
const DUEL_ME=300,SH_MAX=100;
const SPELLS={
 bolt:{n:'Hex Bolt',ic:'✦'},fire:{n:'Hellfire',ic:'🔥'},freeze:{n:'Frost Lock',ic:'❄'},wall:{n:'Glacial Wall',ic:'❄'},
 curse:{n:'Withering Curse',ic:'☠'},drain:{n:'Soul Drain',ic:'☠'},heal:{n:'Mending',ic:'✚'},shuffle:{n:'Chaos Shuffle',ic:'🌀'}};
const FOES=[
 {id:'pip',name:'Pip Thistlewick',title:'Apprentice Hedge-Wizard',th:2,hp:220,rate:1/13,wind:3.4,ctr:16,dmg:24,col:'#ffd27a',sp:{bolt:3,freeze:2},nf:3,
  say:{intro:"Ooh, a real duel! Go easy on me… or don't!",cast:["Twiggy, do your thing!","Whoops, that one's live!","Hah, try THIS!"],hurt:"Ow! Okay, that one stung.",ctr:"Hey! I was doing a spell!",win:"I… I actually won? Mum won't believe this!",lose:"Fair's fair. You're brilliant at this."}},
 {id:'bramble',name:'Mother Bramble',title:'Witch of the Greenhouse',th:4,hp:320,rate:1/12.5,wind:3.2,ctr:22,dmg:28,col:'#7dff8a',sp:{curse:3,bolt:2,heal:1},nf:4,
  say:{intro:"Sit a while, dearie. My vines have missed company.",cast:["Grow, my pretties…","The thorns remember you.","Hush now, let it take root."],hurt:"Rude little sprout, aren't you?",ctr:"You snipped my bud!",win:"Back to the compost with you, love.",lose:"Well! You've got a green thumb for violence."}},
 {id:'vane',name:'Aurelius Vane',title:'Keeper of the Sunlit Archive',th:1,hp:420,rate:1/11.5,wind:3.0,ctr:29,dmg:32,col:'#ffc25a',sp:{shuffle:2,bolt:3,freeze:2},nf:4,
  say:{intro:"Silence. You are overdue for a lesson.",cast:["Chapter seven: suffering.","Let us rearrange your thinking.","Footnote: you lose."],hurt:"You've creased my robes!",ctr:"An interruption. How… uncouth.",win:"Shelved. Permanently.",lose:"Most irregular. I shall have to revise."}},
 {id:'frost',name:'Seraphine Frost',title:'Sorceress of the Aurora',th:11,hp:520,rate:1/11,wind:2.8,ctr:36,dmg:34,col:'#7ae8ff',sp:{freeze:3,wall:2,bolt:2},nf:5,
  say:{intro:"Your fire will not last out here.",cast:["Be still.","Winter answers me.","Freeze."],hurt:"A crack in the ice… impressive.",ctr:"You melted my words?",win:"Sleep beneath the snow.",lose:"The thaw comes for us all."}},
 {id:'malgrave',name:'Malgrave',title:'The Bone-Warden',th:5,hp:620,rate:1/10.5,wind:2.6,ctr:43,dmg:36,col:'#7dff5a',sp:{curse:3,drain:3,bolt:1},nf:5,
  say:{intro:"Another soul for the crypt. How generous.",cast:["Your life is mine to borrow.","Wither.","The dead are hungry."],hurt:"Pain? I forgot what it felt like.",ctr:"The ritual… broken?",win:"Rest now. Forever.",lose:"Death… is merely… a delay."}},
 {id:'ashmaw',name:'Ignatius Ashmaw',title:'Demonologist of the Forge',th:8,hp:740,rate:1/10,wind:2.4,ctr:50,dmg:44,col:'#ff7a1a',sp:{fire:3,curse:2,shuffle:1},nf:5,
  say:{intro:"I'll melt you down for horseshoes.",cast:["BURN!","Feel the forge!","Hellfire, rise!"],hurt:"GRAAH! More! Hit me again!",ctr:"You smothered my flame?!",win:"Ash. Just ash.",lose:"The forge… goes… cold…"}},
 {id:'archon',name:'The Hollow Archon',title:'Master of the Shadow Cathedral',th:7,hp:900,rate:1/9,wind:2.2,ctr:58,dmg:46,col:'#b06aff',sp:{bolt:2,freeze:2,curse:2,drain:2,shuffle:1,wall:1,heal:1},nf:6,
  say:{intro:"Every rune you touch was mine first.",cast:["Kneel.","I am the silence between spells.","Unmake."],hurt:"Interesting. Continue.",ctr:"…You see the threads.",win:"As it was always written.",lose:"Then the Tower is yours, Runebreaker."}}];
SAVE.duel=Object.assign({won:0,best:{}},SAVE.duel||{});
let D=null;const DFX=$('dfx'),dx=DFX.getContext('2d');const PRJ=[],DP=[];let dW=0,dH=0,dDpr=1;
const snd=(n,o)=>{if(AC&&SAVE.set.snd)play(n,o)};
function rc(e){return e.getBoundingClientRect()}
function ctr(e){const r=rc(e);return {x:r.left+r.width/2,y:r.top+r.height/2}}
function bpt(c,r){const b=rc(BC);return {x:b.left+(M+(c+.5)*CS)/W*b.width,y:b.top+(M+(r+.5)*CS)/W*b.height}}
function boardC(){return ctr(BC)}
function gemType(col){const i=PAL.findIndex(p=>p[4]===col);return i}
function dmgTxt(p,s,cls){const e=document.createElement('div');e.className='dmg '+(cls||'');e.textContent=s;e.style.left=p.x+'px';e.style.top=p.y+'px';$('dmgL').appendChild(e);setTimeout(()=>e.remove(),1150)}
let sayT=0;function say(s,ms){const e=$('fSay');e.textContent='“'+s+'”';e.classList.add('on');clearTimeout(sayT);sayT=setTimeout(()=>e.classList.remove('on'),ms||2800)}
function pickw(o){let tot=0;for(const k in o)tot+=o[k];let x=Math.random()*tot;for(const k in o){x-=o[k];if(x<=0)return k}return Object.keys(o)[0]}
function allGems(){const a=[];if(!grid)return a;for(let c=0;c<N;c++)for(let r=0;r<N;r++){const g=grid[c]&&grid[c][r];if(g)a.push(g)}return a}
function freeGems(){return allGems().filter(g=>g.st==='idle'&&!g.ice&&!g.curse&&!g.sp)}
function shuf(a){for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a}
// ---------- start ----------
let nextTh=0;function startDuel(i){const f=FOES[i];audio();nextTh=f.th;PRJ.length=0;SAVE['save_duel']=null;startGame('duel');
 D={i,f,hp:f.hp,max:f.hp,me:DUEL_ME,sh:0,mp:0,cast:null,grace:3.2,t:0,dealt:0,taken:0,ctrN:0,best:0,over:false,made:0,curseT:3,hurtSaid:false,marks:new Set(),pend:0,pendT:0,last:null};
 G.duel=D;document.body.style.setProperty('--fcol',f.col);$('fImg').src='art/duel/'+f.id+'.webp';$('fName').textContent=f.name;$('fTitle').textContent=f.title;
 ['fPor'].forEach(id=>$(id).className='');syncBody();PRJ.length=0;DP.length=0;$('fHpG').style.width='100%';$('mHpG').style.width='100%';duelHud();
 setTimeout(()=>{if(D&&D.f===f){say(f.say.intro,3200)}},400);setTimeout(()=>{if(G&&G.duel===D)banner('DUEL!')},1200)}
function syncBody(){const on=!!(G&&G.mode==='duel'&&G.duel);if(!on&&D){D=null;PRJ.length=0;$('fSay').classList.remove('on')}if(document.body.classList.contains('duel')!==on){document.body.classList.toggle('duel',on);layout()}}
// ---------- hooks into the core game ----------
const _ti=themeIndex;themeIndex=function(l){if(G&&G.mode==='duel')return G.duel?G.duel.f.th:nextTh;return _ti(l)};
const _sg=saveGame;saveGame=function(){if(G&&G.mode==='duel')return;_sg()};
const _hud=hud;hud=function(){if(G&&G.mode==='duel'){duelHud();return}_hud()};
const _as=addScore;addScore=function(p,c,r,col){if(!(G&&G.mode==='duel'&&G.duel))return _as(p,c,r,col);G.score+=p;if(D.over)return;
 const ch=Math.max(1,G.chain||1),d=Math.max(1,Math.min(40,Math.round(p/ch/10*(1+.15*Math.min(ch-1,6))))),t=gemType(col);D.best=Math.max(D.best,G.chain||0);
 popTxt(cx(c),cy(r)-4,String(d),col||'#fff');
 if(t===6){const s=Math.min(SH_MAX-D.sh,Math.max(2,Math.round(d*.7)));if(s>0){D.sh+=s;dmgTxt(ctr($('me')),'🛡 +'+s,'sh')}}
 launch(bpt(c,r),'foe',d,col||'#ffd27a',t);duelHud()};
const _aq=addScoreQuiet;addScoreQuiet=function(p){if(!(G&&G.mode==='duel'&&G.duel))return _aq(p);G.score+=p;if(D.over)return;D.pend+=p/DK};
const _sw=trySwap;trySwap=function(c1,r1,c2,r2){if(G&&G.mode==='duel'&&G.duel){if(D.over)return false;const a=at(c1,r1),b=at(c2,r2);
  for(const g of [a,b])if(g&&g.ice){sfx('bad');g.crk=.35;burst(cx(c1===c2&&r1===r2?c1:(g===a?c1:c2)),cy(g===a?r1:r2),['#ffffff','#d8f6ff','#7ad8ff'],8,40,{g:0});return false}}
 return _sw(c1,r1,c2,r2)};
const _fm=findMoves;findMoves=function(b){const m=_fm(b);if(!(G&&G.mode==='duel'))return m;return m.filter(v=>{const a=grid[v[0]]&&grid[v[0]][v[1]],q=grid[v[2]]&&grid[v[2]][v[3]];return !(a&&a.ice)&&!(q&&q.ice)})};
const _up=update;update=function(dt){_up(dt);if(G&&G.mode==='duel'&&G.duel)duelTick(dt)};
const _mb=menuBack;menuBack=function(){if(curP==='pLadder'){showP('pMenu');return}if(curP==='pDuelEnd')return;_mb()};
const _rm=refreshMenu;refreshMenu=function(){_rm();const w=SAVE.duel.won,n=FOES.length;$('mDuel').querySelector('small').textContent=w>=n?'Tower conquered! Rematch any rival':(w?'Next rival: '+FOES[w].name+' · '+w+'/'+n+' defeated':'Battle rival wizards up the Tower Ladder');
 $('sTab').insertAdjacentHTML('beforeend',`<tr><td>Duels — rivals defeated</td><td>${w} / ${n}</td></tr>`)};
// ---------- board overlays (drawn in board pixel space) ----------
window.gemMark=function(b,g,x,y,t){if(g.ice){b.save();b.globalAlpha=.5;b.fillStyle='#bfefff';b.fillRect(x+1,y+1,CS-2,CS-2);b.globalAlpha=1;b.fillStyle='#e8fbff';b.fillRect(x+1,y+1,CS-2,1);b.fillRect(x+1,y+1,1,CS-2);
  b.fillStyle='#5ab8e8';b.fillRect(x+1,y+CS-2,CS-2,1);b.fillRect(x+CS-2,y+1,1,CS-2);b.fillStyle='#ffffff';for(let k=0;k<5;k++)b.fillRect(x+4+k,y+5+k*2-k,1,1);b.fillRect(x+16,y+4,2,1);b.fillRect(x+17,y+5,1,2);
  b.globalAlpha=.55;b.fillStyle='#ffffff';b.fillRect(x+12,y+13,1,5);b.fillRect(x+13,y+12,4,1);b.fillRect(x+8,y+17,4,1);
  if(g.crk>0){b.globalAlpha=g.crk*2;b.fillStyle='#fff';b.fillRect(x,y,CS,CS)}b.restore()}
 if(g.curse){const p=.5+.5*Math.sin(t*5+g.id);b.save();b.globalCompositeOperation='source-atop';b.restore();b.save();b.globalAlpha=.25+.2*p;b.fillStyle='#5a1a8a';b.fillRect(x+1,y+1,CS-2,CS-2);
  b.globalAlpha=.9;b.fillStyle=p>.5?'#d080ff':'#9a40e0';const o=((t*4)|0)%4;for(const [px,py] of [[2+o,1],[CS-3,2+o],[CS-3-o,CS-2],[1,CS-3-o]])b.fillRect(x+px,y+py,2,1);
  b.fillStyle='#1a0628';b.fillRect(x+CS-9,y+2,7,6);b.fillStyle='#e8c8ff';b.fillRect(x+CS-8,y+3,5,3);b.fillStyle='#1a0628';b.fillRect(x+CS-7,y+4,1,1);b.fillRect(x+CS-5,y+4,1,1);b.fillStyle='#e8c8ff';b.fillRect(x+CS-7,y+6,3,1);b.restore()}};
window.duelBoardFx=function(b,t){if(!G||G.mode!=='duel'||!G.duel||!D.cast)return;const a=.45+.45*Math.sin(t*12);b.save();
 b.strokeStyle=D.f.col;b.globalAlpha=a;b.lineWidth=1;for(const g of D.cast.tg){if(g.st==='clear')continue;b.strokeRect(M+g.x*CS+1.5,M+g.y*CS+1.5,CS-3,CS-3)}
 if(!D.cast.tg.length&&D.cast.sp!=='heal'){b.globalAlpha=a*.6;b.strokeStyle='#ff4a3a';b.lineWidth=2;b.strokeRect(M+1,M+1,N*CS-2,N*CS-2)}b.restore()};
// ---------- AI ----------
function chooseSpell(){const f=D.f,w=Object.assign({},f.sp),nIce=allGems().filter(g=>g.ice).length,nCu=allGems().filter(g=>g.curse).length;
 if(w.heal&&D.hp>D.max*.6)delete w.heal;if(w.heal&&D.hp<D.max*.35)w.heal*=3;if(nIce>12){delete w.freeze;delete w.wall}if(nCu>7)delete w.curse;if(D.last&&w[D.last]&&Object.keys(w).length>1)w[D.last]*=.4;
 if(!Object.keys(w).length)w.bolt=1;return pickw(w)}
function beginCast(){const sp=chooseSpell(),f=D.f;let tg=[];const fr=shuf(freeGems());
 if(sp==='freeze')tg=fr.slice(0,f.nf);else if(sp==='curse')tg=fr.slice(0,Math.max(3,f.nf-1));
 else if(sp==='wall'){let br=0,bn=-1;for(let r=1;r<N-1;r++){const n=allGems().filter(g=>Math.round(g.y)===r&&g.st==='idle'&&!g.ice).length;if(n>bn){bn=n;br=r}}tg=allGems().filter(g=>Math.round(g.y)===br&&g.st==='idle'&&!g.ice)}
 const T=f.wind*(D.hp<D.max*.35?.85:1);D.cast={sp,t:T,T,dmg:0,tg};D.last=sp;$('fPor').classList.add('cast');$('foe').classList.add('tele');sfx('swell',D.i>=4);say(f.say.cast[(Math.random()*f.say.cast.length)|0],2200)}
function counter(){const f=D.f;D.cast=null;D.mp=.2;D.ctrN++;$('fPor').classList.remove('cast');$('foe').classList.remove('tele');banner('COUNTERED!');sfx('nova');shake(5);dmgTxt(ctr($('fPor')),'COUNTER!','foe word');
 const p=ctr($('fPor'));for(let k=0;k<40;k++)spark(p.x,p.y,'#ffe08a',rnd(80,420),rnd(.5,1));say(f.say.ctr,2200);const bonus=Math.round(f.ctr*.25);hitFoe(bonus,true)}
function release(){const c=D.cast,f=D.f;D.cast=null;D.mp=0;$('fPor').classList.remove('cast');$('foe').classList.remove('tele');const from=ctr($('fPor'));
 const sp=c.sp,big=sp==='fire';
 if(sp==='bolt'||sp==='fire'){sfx(big?'clash':'zap');launch(from,'me',Math.round(f.dmg*(big?1.4:1)),big?'#ff7a1a':f.col,-1,{big,to:boardC(),on:()=>{dmgMe(Math.round(f.dmg*(big?1.4:1)));if(big){const fr=shuf(freeGems()).slice(0,3);fr.forEach(g=>{g.curse=1;D.marks.add(g)})}}})}
 else if(sp==='freeze'||sp==='wall'){sfx('beam');c.tg.forEach((g,k)=>setTimeout(()=>{if(!D||D.over||!grid)return;const p=bpt(g.x,g.y);launch(from,'gem',0,'#9ae8ff',-1,{to:p,small:1,on:()=>{if(g.st==='clear')return;g.ice=1;g.iceT=sp==='wall'?14:20;D.marks.add(g);burst(cx(g.x),cy(g.y),['#ffffff','#d8f6ff','#7ad8ff','#2a7ad0'],10,50,{g:0})}})},k*55));
  setTimeout(()=>{if(D&&!D.over){vig('ice');snd('clash',{vol:.45})}},500)}
 else if(sp==='curse'){sfx('crackle');c.tg.forEach((g,k)=>setTimeout(()=>{if(!D||D.over)return;launch(from,'gem',0,'#c070ff',-1,{to:bpt(g.x,g.y),small:1,on:()=>{if(g.st==='clear')return;g.curse=1;D.marks.add(g);burst(cx(g.x),cy(g.y),['#ffffff','#e0b0ff','#9a40e0','#3a0a5a'],10,50,{g:-10})}})},k*70))}
 else if(sp==='drain'){sfx('zap');const d=Math.round(f.dmg*.8);launch(from,'me',d,'#7dff5a',-1,{to:boardC(),on:()=>{const got=dmgMe(d);if(got>0)launch(boardC(),'back',got,'#b0ff9a',-1,{to:ctr($('fPor')),on:()=>healFoe(got)})}})}
 else if(sp==='heal'){sfx('swell');healFoe(Math.round(D.max*.12));const p=ctr($('fPor'));for(let k=0;k<50;k++)spark(p.x+rnd(-60,60),p.y+rnd(-20,70),'#8affb0',rnd(20,80),rnd(.8,1.6),-90)}
 else if(sp==='shuffle'){sfx('whoosh');launch(from,'me',0,'#ff9af0',-1,{to:boardC(),big:1,on:()=>{reshuffle();shake(4)}})}}
function healFoe(n){D.hp=Math.min(D.max,D.hp+n);dmgTxt(ctr($('fPor')),'+'+n,'heal');duelHud()}
function dmgMe(d){if(D.over)return 0;let a=Math.min(D.sh,d);D.sh-=a;d-=a;const p=ctr($('me'));if(a)dmgTxt({x:p.x-40,y:p.y},'🛡 −'+a,'sh');
 if(d>0){D.me=Math.max(0,D.me-d);D.taken+=d;dmgTxt({x:p.x+20,y:p.y},'−'+d,'me'+(d>=40?' big':''));vig();shake(Math.min(9,3+d/8));snd('boom',{vol:.7});duck(.5,.5)}else{snd('clash',{vol:.4})}
 const b=boardC();for(let k=0;k<30;k++)spark(b.x,b.y,a&&!d?'#9ae8ff':'#ff8a6a',rnd(100,500),rnd(.4,.9));duelHud();if(D.me<=0)endDuel(false);return d}
function hitFoe(d,quiet){if(D.over)return;D.hp=Math.max(0,D.hp-d);D.dealt+=d;if(D.cast)D.cast.dmg+=d;const e=$('fPor');e.classList.remove('hit');void e.offsetWidth;e.classList.add('hit');
 if(!quiet)dmgTxt({x:ctr(e).x+rnd(-30,30),y:ctr(e).y+rnd(-20,10)},'−'+d,'foe'+(d>=30?' big':''));
 if(!D.hurtSaid&&D.hp<D.max*.45&&D.hp>0){D.hurtSaid=true;say(D.f.say.hurt)}duelHud();if(D.hp<=0)endDuel(true);else if(D.cast&&D.cast.dmg>=D.f.ctr)counter()}
function vig(k){const e=$('vig');e.className=k||'';void e.offsetWidth;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),140)}
function duelTick(dt){if(D.over)return;D.t+=dt;
 // marks: ice melt / shatter, curse purify
 for(const g of [...D.marks]){const gone=g.st==='clear'||!grid[g.x]||grid[g.x][Math.round(g.y)]!==g&&g.st!=='fall';if(g.crk>0)g.crk-=dt;
  if(g.st==='clear'){if(g.ice){g.ice=0;snd('clash',{vol:.35,rate:1.4});burst(cx(g.x),cy(g.y),['#ffffff','#d8f6ff','#7ad8ff'],18,90,{g:30})}
   if(g.curse){g.curse=0;const p=bpt(g.x,g.y);launch(p,'foe',6,'#e0b0ff',-1,{small:1});dmgTxt(p,'Purified','heal word')}D.marks.delete(g);continue}
  if(gone&&!g.ice&&!g.curse){D.marks.delete(g);continue}
  if(g.ice){g.iceT-=dt;if(g.iceT<=0){g.ice=0;burst(cx(g.x),cy(g.y),['#ffffff','#d8f6ff'],8,30,{g:0})}}if(!g.ice&&!g.curse)D.marks.delete(g)}
 const cu=allGems().filter(g=>g.curse);if(cu.length){D.curseT-=dt;if(D.curseT<=0){D.curseT=3;cu.forEach(g=>burst(cx(g.x),cy(g.y),['#e0b0ff','#9a40e0'],5,30,{g:-20}));dmgMe(2*cu.length);if(D.over)return}}else D.curseT=3;
 if(G.made>D.made){const n=G.made-D.made;D.made=G.made;const s=Math.min(SH_MAX-D.sh,10*n);if(s>0){D.sh+=s;dmgTxt(ctr($('me')),'🛡 +'+s,'sh')}}
 if(D.pend>=1){D.pendT-=dt;if(D.pendT<=0){const d=Math.round(D.pend);D.pend=0;D.pendT=.12;launch(boardC(),'foe',d,'#ffe08a',-1,{big:d>=25})}}
 if(D.grace>0){D.grace-=dt;duelHud();return}
 if(D.cast){D.cast.t-=dt;if(D.cast.t<=0)release()}else{D.mp+=dt*D.f.rate*(D.hp<D.max*.35?1.3:1);if(D.mp>=1)beginCast()}
 duelHud()}
function endDuel(win){if(D.over)return;D.over=true;G.over=true;sel=null;const f=D.f,d=D;if(d.cast){d.cast=null}$('fPor').classList.remove('cast');$('foe').classList.remove('tele');
 if(win){$('fPor').classList.add('ko');sfx('level');banner('VICTORY!');flash(.5,'#ffe08a',.4);const p=ctr($('fPor'));for(let k=0;k<120;k++)spark(p.x,p.y,[f.col,'#ffffff','#ffe08a'][k%3],rnd(80,700),rnd(.6,1.5));
  SAVE.duel.won=Math.max(SAVE.duel.won,d.i+1);const b=SAVE.duel.best[f.id];if(!b||d.t<b)SAVE.duel.best[f.id]=Math.round(d.t);persist();say(f.say.lose,3000)}
 else{sfx('tail');banner('DEFEATED');vig();say(f.say.win,3000)}
 setTimeout(()=>{if(G&&G.duel===d)showEnd(win)},2300)}
function fmtT(s){s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function showEnd(win){const d=D,f=d.f,P=$('pDuelEnd');P.className='panel book '+(win?'win':'lose');$('deT').textContent=win?'VICTORY':'DEFEATED';$('deI').src='art/duel/'+f.id+'.webp';
 $('deQ').textContent=f.name+': “'+(win?f.say.lose:f.say.win)+'”';
 $('deS').innerHTML=[['Time',fmtT(d.t)],['Damage dealt',d.dealt],['Best cascade','×'+d.best],['Spells countered',d.ctrN],['Damage taken',d.taken],['Rivals defeated',SAVE.duel.won+' / '+FOES.length]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('');
 const last=d.i===FOES.length-1,B=[];if(win&&!last)B.push(['deNext','Next Rival<small>'+FOES[d.i+1].name+'</small>']);if(win&&last)$('deQ').textContent+=' — You have conquered the Tower!';
 B.push(['deRe',win?'Rematch':'Rematch<small>Try again — counter their red-bar spells!</small>'],['deLad','The Ladder'],['deMenu','Main Menu']);
 $('deB').innerHTML=B.map(([id,t])=>`<button class="btn" id="${id}">${t}</button>`).join('');showP('pDuelEnd');
 if($('deNext'))$('deNext').onclick=()=>startDuel(d.i+1);$('deRe').onclick=()=>startDuel(d.i);$('deLad').onclick=()=>{G=null;D=null;syncBody();showLadder()};$('deMenu').onclick=()=>{G=null;D=null;syncBody();showP('pMenu')}}
function showLadder(){const w=SAVE.duel.won;$('ldP').textContent=w>=FOES.length?'Every rival has fallen. The Tower is yours.':w+' of '+FOES.length+' rivals defeated';
 $('ldL').innerHTML=FOES.map((f,i)=>{const lock=i>w,done=i<w,b=SAVE.duel.best[f.id];return `<button class="btn lad${lock?' lock':''}${done?' done':''}" data-i="${i}"><img src="art/duel/${f.id}.webp" alt=""><span><b>${lock?'???':f.name}</b><small>${lock?'Defeat '+FOES[i-1].name+' to unlock':f.title+' · '+'★'.repeat(Math.ceil((i+1)/2))}</small></span><i>${lock?'🔒':done?'✓ '+(b?fmtT(b):''):'⚔ Fight'}</i></button>`}).join('');
 $('ldL').querySelectorAll('.lad').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(i>SAVE.duel.won){sfx('bad');return}startDuel(i)});showP('pLadder');
 const k=Math.min(w,FOES.length-1);focusI=k;setFocus()}
$('mDuel').onclick=()=>{audio();showLadder()};
// ---------- HUD ----------
function duelHud(){if(!D)return;const f=D;$('fHp').style.width=(f.hp/f.max*100)+'%';$('fHpG').style.width=(f.hp/f.max*100)+'%';$('fHpT').textContent=Math.ceil(f.hp)+' / '+f.max;
 $('fMp').style.width=(f.cast?100:Math.min(1,f.mp)*100)+'%';$('mHp').style.width=(f.me/DUEL_ME*100)+'%';$('mHpG').style.width=(f.me/DUEL_ME*100)+'%';$('mHp').classList.toggle('low',f.me<DUEL_ME*.3);
 $('mSh').style.width=(f.sh/DUEL_ME*100)+'%';$('mHpT').textContent=Math.ceil(f.me)+' / '+DUEL_ME+(f.sh?'  ·  🛡 '+Math.round(f.sh):'');$('mShT').textContent=Math.round(f.sh);$('mCt').textContent=f.ctrN;$('mCh').textContent='×'+f.best;
 const T=$('fTel');if(f.cast){T.classList.add('on');const s=SPELLS[f.cast.sp];$('fTelB').style.width=(f.cast.t/f.cast.T*100)+'%';$('fTelC').style.width=Math.min(100,f.cast.dmg/f.f.ctr*100)+'%';$('fTelT').textContent=s.ic+' '+s.n+' · '+Math.max(0,f.cast.t).toFixed(1)+'s · counter '+Math.min(f.cast.dmg,f.f.ctr)+'/'+f.f.ctr}else T.classList.remove('on')}
// ---------- spell projectiles & particles (screen-space overlay) ----------
function launch(from,kind,dmg,col,t,o){o=o||{};const to=o.to||(kind==='foe'?ctr($('fPor')):ctr($('me')));const dist=Math.hypot(to.x-from.x,to.y-from.y);
 const dur=Math.min(.75,Math.max(.32,dist/1400))*(o.small?.8:1);const side=Math.random()<.5?-1:1;
 PRJ.push({x0:from.x,y0:from.y,x1:to.x,y1:to.y,bend:side*rnd(.15,.35)*dist,t:0,dur,kind,dmg,col,big:o.big||dmg>=25,small:o.small,on:o.on,tr:[],w:rnd(0,6)});
 if(kind==='foe'&&dmg>=20)snd('whoosh',{vol:.5})}
function spark(x,y,col,sp,life,dir){const a=dir!=null?(dir+rnd(-30,30))*Math.PI/180:Math.random()*Math.PI*2;DP.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,col,l:0,m:life||.6,s:rnd(1.5,3.5)})}
function impact(p){const x=p.x1,y=p.y1;const n=p.small?8:p.big?40:18;for(let k=0;k<n;k++)spark(x,y,k%3?p.col:'#ffffff',rnd(60,p.big?520:300),rnd(.3,.8));DP.push({ring:1,x,y,r:4,vr:p.big?520:280,l:0,m:.35,col:p.col});
 if(p.kind==='foe'){hitFoe(p.dmg);if(p.big){snd('boom',{vol:.5})}else snd('crackle',{vol:.45,rate:rnd(1.1,1.4)})}if(p.on)p.on()}
let dLast=performance.now();
function dfxFrame(ts){const dt=Math.min(.05,(ts-dLast)/1000);dLast=ts;syncBody();
 const dpr=Math.min(2,devicePixelRatio||1),w=innerWidth,h=innerHeight;if(dW!==w||dH!==h||dDpr!==dpr){dW=w;dH=h;dDpr=dpr;DFX.width=w*dpr;DFX.height=h*dpr}
 if(PRJ.length||DP.length){dx.setTransform(dpr,0,0,dpr,0,0);dx.clearRect(0,0,w,h);const run=!paused;dx.globalCompositeOperation='lighter';
  for(let i=PRJ.length-1;i>=0;i--){const p=PRJ[i];if(run)p.t+=dt;const k=Math.min(1,p.t/p.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
   const mx=(p.x0+p.x1)/2,my=(p.y0+p.y1)/2,L=Math.hypot(p.x1-p.x0,p.y1-p.y0)||1,nx=-(p.y1-p.y0)/L,ny=(p.x1-p.x0)/L,cxp=mx+nx*p.bend,cyp=my+ny*p.bend;
   const x=(1-e)*(1-e)*p.x0+2*(1-e)*e*cxp+e*e*p.x1+Math.sin(p.t*40+p.w)*2,y=(1-e)*(1-e)*p.y0+2*(1-e)*e*cyp+e*e*p.y1+Math.cos(p.t*37+p.w)*2;
   if(run){p.tr.push([x,y]);if(p.tr.length>(p.small?10:18))p.tr.shift();if(Math.random()<.8)spark(x,y,Math.random()<.4?'#ffffff':p.col,rnd(10,60),rnd(.25,.5))}
   const R=p.small?5:p.big?14:9;
   for(let j=1;j<p.tr.length;j++){const a=j/p.tr.length;dx.strokeStyle=p.col;dx.globalAlpha=a*.55;dx.lineWidth=R*a*1.4;dx.lineCap='round';dx.beginPath();dx.moveTo(p.tr[j-1][0],p.tr[j-1][1]);dx.lineTo(p.tr[j][0],p.tr[j][1]);dx.stroke();
    dx.strokeStyle='#ffffff';dx.globalAlpha=a*.8;dx.lineWidth=R*a*.4;dx.stroke()}
   dx.globalAlpha=1;const g=dx.createRadialGradient(x,y,0,x,y,R*2.4);g.addColorStop(0,'#ffffff');g.addColorStop(.25,p.col);g.addColorStop(1,'rgba(0,0,0,0)');dx.fillStyle=g;dx.beginPath();dx.arc(x,y,R*2.4,0,7);dx.fill();
   if(k>=1){PRJ.splice(i,1);if(!(D&&D.over&&p.kind!=='foe'))impact(p)}}
  for(let i=DP.length-1;i>=0;i--){const q=DP[i];if(run){q.l+=dt;q.x+=(q.vx||0)*dt;q.y+=(q.vy||0)*dt;if(q.vx!=null){q.vx*=.92;q.vy=q.vy*.92+60*dt}if(q.ring)q.r+=q.vr*dt*(1-q.l/q.m)}
   const a=Math.max(0,1-q.l/q.m);if(q.l>=q.m){DP.splice(i,1);continue}dx.globalAlpha=a;
   if(q.ring){dx.strokeStyle=q.col;dx.lineWidth=3*a+1;dx.beginPath();dx.arc(q.x,q.y,q.r,0,7);dx.stroke()}else{dx.fillStyle=q.col;dx.beginPath();dx.arc(q.x,q.y,q.s*(.5+a*.5),0,7);dx.fill()}}
  dx.globalAlpha=1;dx.globalCompositeOperation='source-over';if(!PRJ.length&&!DP.length)dx.clearRect(0,0,w,h)}
 requestAnimationFrame(dfxFrame)}
requestAnimationFrame(dfxFrame);
refreshMenu();
// test hooks
RS.duel={FOES,start:startDuel,get D(){return D},ladder:showLadder,set(o){Object.assign(D,o);duelHud()},cast(sp){D.mp=1;D.grace=0;const c=chooseSpell;chooseSpell=()=>sp;beginCast();chooseSpell=c},prj:()=>PRJ.length};
