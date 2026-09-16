// WCAG contrast for every text/background pair used by the Momentum Agent Console.
// Tokens are the hosted Claude Design project "Momentum Design System" (09b3bbc0, v3).
// Run: node _os/public/brand/contrast.js
const T = { night:'#03172e', navy:'#072d53', blue:'#1766ab', gold:'#efb928',
  paper:'#ffffff', pale:'#f0f5f9', ink:'#102d49', muted:'#52677c', paperDim:'#d5e4f1' };
const lum = (h) => { const c = [1,3,5].map((i) => parseInt(h.slice(i,i+2),16)/255)
  .map((v) => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4);
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]; };
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((m,n) => n-m); return (x+0.05)/(y+0.05); };
const PAIRS = [['ink','paper','body'],['muted','paper','secondary'],['blue','paper','link'],
  ['ink','pale','body'],['muted','pale','secondary'],['blue','pale','link'],
  ['paper','navy','body'],['paperDim','navy','secondary'],['gold','navy','accent'],
  ['paper','night','body'],['paperDim','night','secondary'],['gold','night','accent'],
  ['night','gold','body'],['paper','blue','body']];
let fail = 0;
for (const [fg,bg,role] of PAIRS) {
  const r = ratio(T[fg],T[bg]), min = role === 'accent' ? 3 : 4.5, ok = r >= min;
  if (!ok) fail++;
  console.log(`${(fg+' on '+bg).padEnd(22)} ${r.toFixed(2).padStart(6)}:1  min ${min}  ${ok ? 'PASS' : 'FAIL'}`);
}
process.exit(fail ? 1 : 0);
