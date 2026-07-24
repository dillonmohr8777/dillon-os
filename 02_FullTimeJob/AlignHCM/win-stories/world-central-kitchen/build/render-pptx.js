// Renders the scene graph to an editable PowerPoint deck.
// Usage: npm i pptxgenjs && node render-pptx.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const { buildScene } = require("./scene");
const FONT = "Calibri";
const OUT = path.join(__dirname, "..", "WCK_Win_Story.pptx");

const p = new pptxgen();
p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
p.layout = "W";
const scene = buildScene();
const s = p.addSlide();
s.background = { color: scene.bg };

function textOpts(e) {
  const o = { x: e.x, y: e.y, w: e.w, h: e.h, align: e.align, valign: e.valign, fontFace: FONT, margin: 0 };
  if (e.lh) o.lineSpacingMultiple = e.lh;
  return o;
}
function runOpts(r) {
  const o = { fontFace: FONT, fontSize: r.size, color: r.color };
  if (r.bold) o.bold = true;
  if (r.italic) o.italic = true;
  if (r.cs) o.charSpacing = r.cs;
  if (r.br) o.breakLine = true;
  if (r.spAfter) o.paraSpaceAfter = r.spAfter;
  return o;
}

for (const e of scene.el) {
  if (e.type === "roundRect") {
    const opt = { x: e.x, y: e.y, w: e.w, h: e.h, rectRadius: e.r, fill: { color: e.fill },
      line: e.line ? { color: e.line.color, width: e.line.width } : { type: "none" } };
    if (e.shadow) opt.shadow = { type: "outer", color: "9AA6B5", blur: 10, offset: 3, angle: 90, opacity: 0.45 };
    s.addShape(p.ShapeType.roundRect, opt);
  } else if (e.type === "rect") {
    s.addShape(p.ShapeType.rect, { x: e.x, y: e.y, w: e.w, h: e.h, fill: { color: e.fill },
      line: e.line ? { color: e.line.color, width: e.line.width } : { type: "none" } });
  } else if (e.type === "line") {
    s.addShape(p.ShapeType.line, { x: e.x, y: e.y, w: e.w, h: e.h, line: { color: e.color, width: e.width } });
  } else if (e.type === "image") {
    s.addImage({ path: e.path, x: e.x, y: e.y, w: e.w, h: e.h });
  } else if (e.type === "text") {
    s.addText(e.runs.map(r => ({ text: r.text, options: runOpts(r) })), textOpts(e));
  }
}

p.writeFile({ fileName: OUT }).then(f => console.log("WROTE", f));
