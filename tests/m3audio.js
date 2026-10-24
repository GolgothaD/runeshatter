const L=require('./m3lib');(async()=>{const port=L.serve(),b=await L.launch(),p=await b.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.evaluateOnNewDocument(()=>{const oc=AudioNode.prototype.connect;window.__an=null;AudioNode.prototype.connect=function(d,...a){if(d instanceof AudioDestinationNode&&!window.__an){const an=this.context.createAnalyser();an.fftSize=2048;oc.call(this,an);window.__an=an}return oc.call(this,d,...a)}});
await p.goto(`http://localhost:${port}/`);await L.W8(1500);await p.click('[data-mode]');await L.W8(5000);
const r=await p.evaluate(async()=>{const n=Object.keys(SB).length;let pk=0;const buf=new Float32Array(2048);
for(let k=0;k<4;k++){['boom','zap','nova','clash','tail','beam','match','swap','crackle','swellbig'].forEach(s=>sfx(s,3))}
const t0=performance.now();while(performance.now()-t0<2500){__an.getFloatTimeDomainData(buf);for(const v of buf)pk=Math.max(pk,Math.abs(v));await new Promise(r=>setTimeout(r,20))}
return{sfxLoaded:n,of:SFXN.length,ext:AEXT,mus:musK,musLoaded:Object.keys(MB),stackPeakdBFS:(20*Math.log10(pk)).toFixed(1)}});
console.log(JSON.stringify(r),'errors:',JSON.stringify(errs));await b.close();process.exit(0)})();
