import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = 'C:/Users/dillo/Documents/Codex/projects/client-operations';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const pending = 'Conversion reporting is pending validation';
const brands = {
  nexla: { name: 'Nexla', location: 'Google Search campaign review', dark: '#071a2d', accent: '#6254ff' },
  'omega-landscaping': { name: 'Omega Landscaping and Concrete', location: 'Colorado Springs, Colorado', dark: '#10283f', accent: '#2d7bc1' },
  'onsite-concrete-landscape': { name: 'Onsite Concrete & Landscape', location: 'Fairfield and Solano County, California', dark: '#171a1f', accent: '#f15a4f' }
};
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function validate(e, c, a) {
  assert.ok(['partial-live-audit','partial-daily-receipt'].includes(e.status));
  assert.match(e.observedDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(e.period.from <= e.period.to && e.period.to <= e.observedDate);
  if(e.status==='partial-daily-receipt') assert.equal(c.capturedAtUtc.slice(0,10),e.observedDate,'Capture must match report date');
  assert.ok(brands[c.id], 'Client must be explicitly scoped');
  assert.equal(c.customerId, a.googleCustomerId);
  assert.equal(c.conversionLabel, pending);
  for (const key of ['conversions','qualifiedLeads','connectedCalls','bookedEstimates']) assert.equal(c[key], null);
  for (const key of ['clicks','impressions']) assert.ok(Number.isInteger(c[key]) && c[key] >= 0);
  assert.ok(Number.isFinite(c.cost) && c.cost >= 0);
  assert.equal(c.currency, 'USD');
  assert.ok(a.logoVisualChecked && a.logoSha256 && a.logo, 'Exact logo required; no fallback');
}

// Daily mode consumes explicit saved receipts; it does not fetch accounts or infer missing metrics.
function html(e, c, a) {
  const b = brands[c.id];
  const metric = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  const list = values => values.map(x => `<li>${esc(x)}</li>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.name)} · Google Ads health review</title><style>
/* Adapted from the established weekly report. Client color pairs and portable Arial are preserved. */
:root{--dark:${b.dark};--accent:${b.accent};--paper:#f8f5ee;--ink:#162334;--muted:#40505d;--line:#ccd0cf}
*{box-sizing:border-box}html{color-scheme:light;scrollbar-color:var(--dark) var(--paper)}body{margin:0;background:#ddd;color:var(--ink);font-family:Arial,sans-serif;font-size:16px;line-height:1.55}::selection{background:var(--dark);color:white}main{max-width:1020px;margin:auto}.page{background:var(--paper);padding:28px 22px}.page+.page{border-top:1px solid var(--line)}.masthead{background:var(--dark);color:white;padding:28px 22px;display:flex;flex-direction:column;gap:20px}.brandlogo{display:flex;align-items:center;min-height:100px}.brandlogo img{display:block;max-width:235px;max-height:130px;object-fit:contain;object-position:left center}.status{font-size:13px;color:white;margin:0}.date{font-size:15px;margin:4px 0;color:white}h1{font-size:34px;line-height:1.1;letter-spacing:-.03em;margin:18px 0 14px;text-wrap:balance}h2{font-size:25px;line-height:1.2;letter-spacing:-.02em;margin:30px 0 12px;text-wrap:balance}h3{font-size:18px;line-height:1.3;margin:26px 0 10px}.client{font-size:17px;font-weight:bold;margin:0}.location{font-size:14px;margin:6px 0 0;color:white}.lead{font-size:20px;line-height:1.45;margin:0 0 16px;max-width:67ch}.note{color:var(--muted);font-size:15px;max-width:72ch}p{margin:10px 0 16px}.metrics{display:grid;grid-template-columns:1fr;gap:0;margin:24px 0 0;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}.metrics>div{padding:16px 0;border-bottom:1px solid var(--line)}dt{font-size:14px;color:var(--muted)}dd{font-size:30px;font-weight:bold;line-height:1.2;margin:8px 0 0;color:var(--dark)}.outcomes{margin:24px 0;padding:20px 0;border-top:2px solid var(--accent);border-bottom:1px solid var(--line)}.outcomes h2{font-size:22px;margin:0 0 14px}.outcomes dl{margin:0}.outcomes dl>div{display:flex;justify-content:space-between;gap:12px;padding:5px 0}.outcomes dt,.outcomes dd{font-size:15px;margin:0;font-weight:normal}.outcomes dd{font-weight:bold}ul,ol{padding-left:22px;margin:14px 0}li{padding-left:3px;margin:0 0 13px;overflow-wrap:anywhere}.next{margin:22px 0;padding:18px 20px;background:var(--dark);color:white}.next h2{font-size:22px;margin:0 0 12px}.next li:last-child{margin-bottom:0}.source{border-top:1px solid var(--line);padding-top:16px;font-size:13px;color:var(--muted);overflow-wrap:anywhere}.footer{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:14px;margin-top:28px}a{color:var(--ink);text-underline-offset:4px}a:focus-visible{outline:3px solid var(--accent);outline-offset:4px}a:hover{text-decoration-thickness:2px}.source a{display:inline-block;min-height:44px;padding:10px 0}.break{display:none}
@media(min-width:640px){main{margin:32px auto}.page{padding:36px 48px}.masthead{padding:36px 48px;flex-direction:row;align-items:center;justify-content:space-between;gap:32px}.masthead-text{max-width:610px}.brandlogo{order:2;flex-shrink:0}.brandlogo img{max-width:190px;max-height:150px}h1{font-size:40px}.metrics{grid-template-columns:repeat(3,1fr);gap:24px}.metrics>div{padding:18px 0}.outcomes dl{max-width:620px}}
@page{size:Letter;margin:0}
@media print{body{background:white;font-size:11px;line-height:1.45}main{margin:0;max-width:none}.sheet{width:8.5in;height:11in;break-after:page;position:relative;overflow:visible;background:var(--paper)}.sheet:last-child{break-after:auto}.page{padding:.42in .58in}.page+.page{border:0}.masthead{padding:.36in .58in;flex-direction:row;min-height:2.12in;align-items:center}.masthead-text{max-width:5.1in}.brandlogo{order:2}.brandlogo img{max-width:1.5in;max-height:1.35in}h1{font-size:29px;margin:12px 0 9px}.client{font-size:14px}.status,.location{font-size:10px}.date{font-size:11px}.lead{font-size:17px;line-height:1.35}.note{font-size:11px}.metrics{grid-template-columns:repeat(3,1fr);gap:22px;margin-top:17px}.metrics>div{padding:12px 0}dt{font-size:11px}dd{font-size:26px}.outcomes{margin:18px 0;padding:15px 0}.outcomes h2{font-size:18px}.outcomes dt,.outcomes dd{font-size:11px}.outcomes dl{max-width:5in}h2{font-size:21px;margin:12px 0}.next{margin:15px 0;padding:14px 18px}.next h2{font-size:17px}.next li{margin-bottom:7px}li{margin-bottom:9px}.source{font-size:9px;padding-top:10px}.source a{min-height:0;padding:0}.footer{font-size:9px;position:absolute;bottom:.28in;left:.58in;right:.58in;margin:0;padding-top:9px}.break{display:block}.findings{font-size:11px}.findings li{margin-bottom:11px}.sheet2 h2{margin:0 0 20px}.sheet2 .page{padding-top:.58in}.source p{margin:7px 0}}
@media print{body{font-size:13px}.findings{font-size:13px}.note{font-size:12px}.source{font-size:11px}.source a:focus-visible{outline:none}}
${c.id==='nexla' ? '.masthead{background:white;color:var(--ink)}.masthead .status,.masthead .date,.masthead .location{color:var(--ink)}' : ''}</style></head><body><main>
<section class="sheet"><header class="masthead"><div class="masthead-text"><p class="status">LOCAL REVIEW DRAFT · ${esc(e.observedDate)}</p><h1>Google Ads<br>health review</h1><p class="client">${esc(b.name)}</p><p class="location">${esc(b.location)}</p><p class="date">${esc(e.period.from)} through ${esc(e.period.to)}</p></div><div class="brandlogo"><img src="client-logo${esc(a.extension || '.png')}" alt="${esc(b.name)} logo"></div></header>
<div class="page"><p class="lead">${esc(c.delivery)}.</p><p class="note">${esc(c.metricScope || 'Account traffic summary')}. Saved evidence only; report generation does not refresh the account. The priority is to validate delivery and business outcomes.</p>
<dl class="metrics">${metric('Impressions',c.impressions)}${metric('Clicks',c.clicks)}${metric('Google Ads spend',new Intl.NumberFormat('en-US',{style:'currency',currency:c.currency}).format(c.cost))}</dl>
<div class="outcomes"><h2>${pending}</h2><dl>${metric('Qualified leads','Pending')}${metric('Connected calls','Pending')}${metric('Booked estimates','Pending')}</dl><p class="note">A platform event or phone-link click is not proof of a real inquiry, connected conversation or booked job. These outcomes have not yet been reconciled with CRM or call records.</p></div>
<div class="next"><h2>Next actions</h2><ol>${list(c.nextActions)}</ol></div>
<p class="note">Account ${esc(c.customerId)} · ${esc(c.timezone)}<br>Captured ${esc(c.capturedAtUtc || e.observedDate)}${c.capturedAtUtc ? ' (minute-approximate)' : ''}. Metrics cover the stated window; settings describe the capture time.</p>
<footer class="footer">${esc(b.name)} · Read-only, partial account review · 1 / 2</footer></div></section>
<section class="sheet sheet2"><div class="page"><h2>What the account shows</h2><ul class="findings">${list(c.findings)}</ul><h3>Still to validate</h3><ul>${list(c.limits.filter(x=>x!=='No campaign changes'))}</ul><div class="source"><p><strong>Evidence and scope</strong></p><p>Google Ads customer ${esc(c.customerId)}. Source: saved account-inspection receipt dated ${esc(e.observedDate)}. This render did not access Google Ads. Traffic window: ${esc(e.period.from)} through ${esc(e.period.to)}, ${esc(c.timezone)}.</p><p><a href="${esc(c.source)}" rel="noreferrer">Open the verified Google Ads account</a> (authorized login required)</p><p>This is a partial health-review draft. Missing periods and outcome reconciliation remain pending. It does not prove scheduled collection or verified lead quality. Rendering this package made no account changes.</p><p>${esc(a.logoOriginalWebProvenanceVerified ? 'Exact artwork downloaded from the client website and hash-matched.' : 'Exact existing client artwork, hash-matched to the reviewed inventory. Original web provenance was not refreshed.')}</p></div><footer class="footer">${esc(b.name)} · Prepared for review, not sent or published · 2 / 2</footer></div></section>
</main></body></html>`;
}

export async function build(options = {}) {
  let evidencePath = options.input || path.join(here,'../google-ads-live-evidence.json');
  let e = JSON.parse(fs.readFileSync(evidencePath));
  if(options.date) e = normalizeDaily(e, options.date);
  const inventory = JSON.parse(fs.readFileSync(path.join(here,'../google-ads-source-inventory.json')));
  if(options.date && e.clients.some(c=>c.id==='nexla')) {
    const logo=path.join(here,'nexla-logo.svg');
    inventory.clients=inventory.clients.filter(c=>c.id!=='nexla');
    inventory.clients.push({id:'nexla',googleCustomerId:'7917802207',logo,logoSha256:'13e660a8ec740eb9a171a952994b6c294da9ece12c07855007efab951839d273',logoVisualChecked:true,logoOriginalWebProvenanceVerified:true,extension:'.svg',source:'https://nexla.com/n3x_ctx/uploads/2026/02/nexla-logo.svg'});
  }
  const outputs = [];
  const browser = await chromium.launch({headless:true});
  try {
    for (const c of e.clients) {
      const a = inventory.clients.find(x=>x.id===c.id);
      validate(e,c,a);
      const logo = fs.readFileSync(path.isAbsolute(a.logo) ? a.logo : path.join(root,a.logo));
      assert.equal(hash(logo),a.logoSha256.toLowerCase(),'Exact logo hash mismatch');
      const dir = path.join(root,'clients',c.id,'deliverables',`${e.observedDate}-google-ads-${options.date ? 'daily-health' : 'health-review'}`);
      fs.mkdirSync(dir,{recursive:true});
      // Only this new, scoped artifact package is generated. Historical reports and sources are never overwritten.
      fs.writeFileSync(path.join(dir,`client-logo${a.extension || '.png'}`),logo);
      fs.writeFileSync(path.join(dir,'report.html'),html(e,c,a));
      fs.writeFileSync(path.join(dir,'source-data.json'),JSON.stringify({client:c,period:e.period,observedDate:e.observedDate,status:'local-draft-partial-live-review',logo:a,evidenceSha256:hash(fs.readFileSync(evidencePath)),source:evidencePath},null,2));
      const errors=[];
      const page=await browser.newPage({viewport:{width:1200,height:1000},reducedMotion:'reduce'});
      page.on('pageerror',error=>errors.push(error.message));
      page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
      await page.goto(pathToFileURL(path.join(dir,'report.html')).href,{waitUntil:'networkidle'});
      const checks=[];
      for(const width of [1200,320]) {
        await page.setViewportSize({width,height:1000});
        checks.push(await page.evaluate(()=>({width:innerWidth,noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth,imagesLoaded:[...document.images].every(i=>i.complete&&i.naturalWidth>0),headingCount:document.querySelectorAll('h1').length,pendingPresent:document.body.innerText.includes('Conversion reporting is pending validation')})));
        await page.screenshot({path:path.join(dir,width===320?'qa-mobile-320.png':'qa-desktop-1200.png'),fullPage:true});
      }
      await page.keyboard.press('Tab');
      const keyboardLinkFocused=await page.evaluate(()=>document.activeElement?.tagName==='A');
      await page.evaluate(()=>document.activeElement?.blur());
      await page.emulateMedia({media:'print'});
      const printFit=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>({height:s.clientHeight,scrollHeight:s.scrollHeight,fits:s.scrollHeight<=s.clientHeight+1})));
      const pdf=path.join(dir,`${c.id}-google-ads-health-review.pdf`);
      await page.pdf({path:pdf,format:'Letter',printBackground:true,preferCSSPageSize:true,tagged:true});
      assert.ok(checks.every(x=>x.noHorizontalOverflow&&x.imagesLoaded&&x.headingCount===1&&x.pendingPresent));
      assert.ok(keyboardLinkFocused);
      assert.equal(errors.length,0);
      assert.ok(printFit.every(x=>x.fits),'Print content exceeds a page');
      const receipt={status:'local-checks-complete-independent-review-pending',clientId:c.id,checks,keyboardLinkFocused,reducedMotion:'static artifact; no motion',printFit,consoleErrors:errors,logoSha256:hash(logo),pdfBytes:fs.statSync(pdf).size,pdfSha256:hash(fs.readFileSync(pdf)),generatedAt:new Date().toISOString(),dailyScheduledRunProven:false,providerChanges:false};
      fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(receipt,null,2));
      outputs.push({clientId:c.id,dir,pdf,receipt});
      await page.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync(path.join(here,options.date ? `build-receipt-${options.date}-${e.clients[0].id}.json` : 'build-receipt.json'),JSON.stringify(outputs,null,2));
  return outputs;
}
export function normalizeDaily(r,date) {
  assert.equal(r.date,date,'Receipt date mismatch');
  assert.match(date,/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(date).toISOString().slice(0,10),date,'Invalid date');
  assert.equal(r.capturedAtUtc?.slice(0,10),date,'Capture must match report date');
  assert.equal(new URL(r.source).origin,'https://ads.google.com');
  assert.ok(brands[r.clientId],'Unknown client');
  assert.ok(r.periods?.length);
  for(const p of r.periods) {
    for(const k of ['from','to']) assert.equal(new Date(p[k]).toISOString().slice(0,10),p[k]);
    assert.ok(p.from<=p.to && p.to<=date,'Invalid period');
    for(const k of ['impressions','clicks']) assert.ok(Number.isInteger(p[k]) && p[k]>=0,'Invalid whole count');
    assert.ok(Number.isFinite(p.cost) && p.cost>=0,'Invalid spend');
  }
  const period=r.periods[0];
  assert.equal(period.to,period.from,'Daily headline requires a single-day window');
  const c={...r,id:r.clientId,...period,conversions:null,delivery:`Campaign ${r.campaignId}: ${r.campaignState}`,
    nextActions:['Validate accepted inquiries and reconcile CRM or call outcomes.','Refresh missing reporting periods and conversion diagnostics.'],
    findings:[`Daily budget at capture: USD ${r.dailyBudget}.`, ...r.periods.map(p=>`${p.from} through ${p.to}: ${p.impressions} impressions, ${p.clicks} clicks, USD ${p.cost.toFixed(2)} spend.`), ...(r.currentCorrectionContext ? [r.currentCorrectionContext] : [])],
    limits:r.coverageGaps.filter(x=>!/renderer/i.test(x))};
  return {status:'partial-daily-receipt',observedDate:date,period:{from:period.from,to:period.to},clients:[c]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  assert.ok(args.length===0 || (args.length===4 && args[0]==='--date' && args[2]==='--input'),'Usage: build.mjs --date YYYY-MM-DD --input receipt.json');
  console.log(JSON.stringify(await build(args.length ? {date:args[1],input:path.resolve(args[3])} : {}),null,2));
}
