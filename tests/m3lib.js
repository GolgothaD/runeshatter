const puppeteer=require('puppeteer-core');const http=require('http'),fs=require('fs'),path=require('path');
exports.serve=()=>{const port=9100+Math.floor(Math.random()*200);http.createServer((q,r)=>{let p=path.join('/workspace/match3',decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.statusCode=404;return r.end()}r.setHeader('content-type',{'.js':'text/javascript','.html':'text/html','.json':'application/json','.png':'image/png'}[path.extname(p)]||'application/octet-stream');r.end(d)})}).listen(port);return port};
exports.launch=()=>puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
exports.W8=ms=>new Promise(r=>setTimeout(r,ms));
