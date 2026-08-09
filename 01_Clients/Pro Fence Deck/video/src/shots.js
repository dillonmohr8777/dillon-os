const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const B='/tmp/claude-0/-home-user/5229e18d-bbaf-5c73-8cd2-126b6ec9af59/scratchpad/';
(async()=>{
  const times = process.argv.slice(2).map(Number);
  const br = await chromium.launch({args:['--force-color-profile=srgb','--font-render-hinting=none']});
  const pg = await br.newPage({viewport:{width:1920,height:1080}, deviceScaleFactor:1});
  pg.on('pageerror', e=>console.log('PAGEERR:', e.message));
  pg.on('console', m=>{ if(m.type()==='error') console.log('CONSOLE:', m.text()); });
  await pg.addInitScript(()=>{ window.__RENDER=true; });
  await pg.goto('file://'+B+'render.html');
  await pg.waitForFunction(()=>window.__DURATION>0, {timeout:20000});
  const D = await pg.evaluate(()=>window.__DURATION);
  console.log('DURATION', D.toFixed(2), 's  =', Math.floor(D/60)+':'+String(Math.round(D%60)).padStart(2,'0'));
  await pg.evaluate(()=>document.fonts.ready);
  await pg.waitForTimeout(1500);
  for(const t of times){
    await pg.evaluate(tt=>window.__seek(tt), t);
    await pg.waitForTimeout(160);
    await pg.screenshot({path:B+`shot_${String(t).padStart(6,'0')}.jpg`, type:'jpeg', quality:82});
  }
  await br.close();
  console.log('shots done');
})();
