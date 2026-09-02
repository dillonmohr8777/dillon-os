// Inline WebP data URIs into the template. Run: node scripts/build.mjs
import fs from 'node:fs';
const map={LOGO:'wnf-logo',ROBOT:'robot-open',HAND:'hand-palm',SESSION:'wnf-human-led-session',WORKSHOP:'wnf-policy-workshop'};
let html=fs.readFileSync('index.template.html','utf8');
for(const [k,f] of Object.entries(map)) html=html.split(`{{${k}}}`).join(fs.readFileSync(`assets/${f}.webp.b64`,'utf8'));
fs.writeFileSync('index.html',html);
console.log('index.html',Math.round(html.length/1024)+'KB');
