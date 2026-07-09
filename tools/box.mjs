// box.mjs — drive Dillon's box Chrome through the cloudflare bridge from this cloud session.
// Usage: node box.mjs '<tabMatchSubstring|NEW:url|BROWSER>' < actions.json
// actions: [{navigate:url},{eval:"js"},{click:[x,y]},{dblclick:[x,y]},{move:[x,y]},
//           {type:"txt"},{key:"Enter"},{scroll:dy,at:[x,y]},{wait:secs},{shot:"/path.png"},
//           {listTabs:true},{newTab:"url"}]
import WebSocket from 'ws';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs';

const HOST = process.env.BRIDGE_HOST || 'madonna-sentences-persistent-wives.trycloudflare.com';
const agent = new HttpsProxyAgent(process.env.HTTPS_PROXY || 'http://127.0.0.1:41491');
const KEYS = {Enter:['Enter',13],Backspace:['Backspace',8],Tab:['Tab',9],Escape:['Escape',27],Delete:['Delete',46]};

function rpc(wsurl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsurl, { agent, perMessageDeflate:false });
    const connTimer = setTimeout(()=>{ try{ws.close();}catch{} rej(new Error('ws connect timeout')); }, 20000);
    let id = 0; const cbs = {};
    ws.on('open', () => { clearTimeout(connTimer); res({
      send: (m,p)=>new Promise(r=>{const i=++id;cbs[i]=r;
        const t=setTimeout(()=>{ if(cbs[i]){delete cbs[i]; r({__timeout:m});} }, 30000);
        ws.send(JSON.stringify({id:i,method:m,params:p||{}}));
        cbs[i]=(v)=>{clearTimeout(t);r(v);};
      }),
      close: ()=>{try{ws.close();}catch{}},
    }); });
    ws.on('message', d=>{const j=JSON.parse(d);if(j.id&&cbs[j.id]){cbs[j.id](j.result||j.error);delete cbs[j.id];}});
    ws.on('error', e=>{clearTimeout(connTimer);rej(e);});
    ws.on('unexpected-response',(rq,rs)=>{clearTimeout(connTimer);rej(new Error('HTTP '+rs.statusCode));});
  });
}
const list = async () => (await (await fetch(`https://${HOST}/json/list`)).json()).filter(t=>t.type==='page');
const pageWs = id => `wss://${HOST}/devtools/page/${id}`;
const browserWs = async () => (await (await fetch(`https://${HOST}/json/version`)).json()).webSocketDebuggerUrl.replace('ws://localhost',`wss://${HOST}`);

async function main() {
  const sel = process.argv[2] || '';
  const actions = JSON.parse(fs.readFileSync(0,'utf8') || '[]');
  const out = [];

  if (sel === 'BROWSER' || sel.startsWith('NEW:')) {
    const b = await rpc(await browserWs());
    if (sel.startsWith('NEW:')) { const t = await b.send('Target.createTarget',{url:sel.slice(4)}); out.push('newTab:'+t.targetId); }
    b.close();
    if (!sel.startsWith('NEW:')) { console.log(JSON.stringify(await list(),null,0)); return; }
    await new Promise(r=>setTimeout(r,2500));
  }

  const tabs = await list();
  let tab = sel && !sel.startsWith('NEW:') && sel!=='BROWSER' ? tabs.find(t=>(t.url||'').includes(sel)||(t.title||'').includes(sel)) : tabs[tabs.length-1];
  if (!tab) { console.log(JSON.stringify({err:'no tab matching '+sel, tabs:tabs.map(t=>t.url.slice(0,60))})); return; }
  const p = await rpc(pageWs(tab.id));
  await p.send('Page.enable'); await p.send('Runtime.enable'); await p.send('DOM.enable');
  for (const a of actions) {
    if ('navigate' in a) { await p.send('Page.navigate',{url:a.navigate}); }
    else if ('eval' in a) { const r=await p.send('Runtime.evaluate',{expression:a.eval,returnByValue:true,awaitPromise:true}); out.push('eval:'+JSON.stringify(r?.result?.value ?? r)); }
    else if ('click' in a||'dblclick' in a||'move' in a){ const k='click'in a?'click':('dblclick'in a?'dblclick':'move'); const [x,y]=a[k];
      await p.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
      if(k!=='move'){const c=k==='dblclick'?2:1;for(let i=0;i<c;i++){await p.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:i+1});await p.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:i+1});}}}
    else if ('type' in a){ await p.send('Input.insertText',{text:a.type}); }
    else if ('key' in a){ let kk=a.key,mod=0; if(kk.startsWith('ctrl+')){mod=2;kk=kk.slice(5);} const [code,vk]=KEYS[kk]||[kk, kk.length===1?kk.toUpperCase().charCodeAt(0):0]; await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:code,modifiers:mod,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk}); await p.send('Input.dispatchKeyEvent',{type:'keyUp',key:code,modifiers:mod,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk}); }
    else if ('scroll' in a){ const [x,y]=a.at||[700,450]; await p.send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:0,deltaY:a.scroll}); }
    else if ('wait' in a){ await new Promise(r=>setTimeout(r,a.wait*1000)); }
    else if ('shot' in a){ const s=await p.send('Page.captureScreenshot',{format:'jpeg',quality:55}); if(s&&s.data){fs.writeFileSync(a.shot,Buffer.from(s.data,'base64')); out.push('shot:'+a.shot);} else {out.push('shot:FAILED('+JSON.stringify(s)+')');} }
  }
  p.close();
  console.log(JSON.stringify(out));
  process.exit(0);
}
main().catch(e=>{console.log('ERR:'+e.message);process.exit(1);});
