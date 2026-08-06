// Renders the scene graph to an HTML preview (for visual QA).
// Screenshot it with headless Chromium at 1280x720 to check layout/overflow.
// Usage: node render-html.js  ->  build/preview.html
const fs = require("fs");
const path = require("path");
const { buildScene } = require("./scene");
const S = 96; // px per inch
const scene = buildScene();

function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

let body = "";
for (const e of scene.el) {
  const L = e.x * S, T = e.y * S, Wp = e.w * S, Hp = e.h * S;
  if (e.type === "roundRect") {
    const sh = e.shadow ? "box-shadow:3px 3px 10px rgba(154,166,181,.45);" : "";
    const bd = e.line ? `border:${e.line.width}px solid #${e.line.color};` : "";
    body += `<div style="position:absolute;left:${L}px;top:${T}px;width:${Wp}px;height:${Hp}px;background:#${e.fill};border-radius:${e.r * S}px;${bd}${sh}box-sizing:border-box;"></div>\n`;
  } else if (e.type === "rect") {
    body += `<div style="position:absolute;left:${L}px;top:${T}px;width:${Wp}px;height:${Hp}px;background:#${e.fill};box-sizing:border-box;"></div>\n`;
  } else if (e.type === "line") {
    body += `<div style="position:absolute;left:${L}px;top:${T}px;width:${Math.max(1, e.width)}px;height:${Hp}px;background:#${e.color};"></div>\n`;
  } else if (e.type === "image") {
    const p = e.path.startsWith("/") ? "file://" + e.path : e.path;
    body += `<img src="${p}" style="position:absolute;left:${L}px;top:${T}px;width:${Wp}px;height:${Hp}px;object-fit:contain;"/>\n`;
  } else if (e.type === "text") {
    const jc = e.valign === "middle" ? "center" : (e.valign === "bottom" ? "flex-end" : "flex-start");
    let inner = "";
    e.runs.forEach((r) => {
      const fs_ = r.size * (S / 72);
      const st = `font-size:${fs_}px;color:#${r.color};${r.bold ? "font-weight:700;" : "font-weight:400;"}${r.italic ? "font-style:italic;" : ""}${r.cs ? `letter-spacing:${r.cs}px;` : ""}`;
      inner += `<span style="${st}">${esc(r.text)}</span>`;
      if (r.br) inner += "<br/>";
      if (r.spAfter) inner += `<div style="height:${r.spAfter * (S / 72)}px"></div>`;
    });
    const lh = e.lh ? e.lh * 1.2 : 1.2;
    body += `<div style="position:absolute;left:${L}px;top:${T}px;width:${Wp}px;height:${Hp}px;display:flex;flex-direction:column;justify-content:${jc};text-align:${e.align};line-height:${lh};overflow:visible;box-sizing:border-box;"><div style="width:100%;">${inner}</div></div>\n`;
  }
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;font-family:'Carlito','Calibri',sans-serif;}
body{width:${scene.W * S}px;height:${scene.H * S}px;background:#${scene.bg};position:relative;overflow:hidden;}
</style></head><body>${body}</body></html>`;
fs.writeFileSync(path.join(__dirname, "preview.html"), html);
console.log("WROTE preview.html", scene.W * S, "x", scene.H * S);
