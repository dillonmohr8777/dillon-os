# Claude Design artboard format (.dc.html) — the parts that bite

One artboard = one self-contained HTML file. Keep this head line EXACTLY; the editor replaces it at render:
  <script src="./support.js"></script>
Root wrapper is <x-dc>. Head-type content (font links, the artboard <style>) goes in <helmet> INSIDE <x-dc>.
A static artboard needs NO <script data-dc-script>. Close every element, quote every attribute.
Inline style="" on an element is what the properties panel edits — anything a viewer should restyle stays inline, not in a class.
Layout: siblings in display:flex or display:grid with gap:, never inline flow spaced by margins. Grids as grid-template-columns: repeat(N, minmax(0, 1fr)).
Always define a { color } and a:hover { color } in <helmet><style>.
Icons: inline SVG only. No emoji, no dingbats.
Fonts: <link rel="stylesheet" href="https://fonts.googleapis.com/..."> in <helmet> (the one external host allowed); give every face a fallback stack.
Images: reference by bare filename (<img src="logo.png">) matching a sibling file; no data: prefix on stored images.

canvas.json (beside the artboards):
{"artboards":[{"file":"Main.dc.html","x":0,"y":0,"w":1080,"h":760}, ...],
 "annotations":[{"id":"thesis","x":0,"y":-150,"w":600,"text":"one plain string, \n for newlines"}],
 "launch":{"view":"canvas"}}
x/y/w/h are CSS px at zoom 1. w/h must equal the root element's real rendered size (frames neither scale nor crop). >=80px between frames in a row, >=120px between rows. Always include Main.dc.html. Annotation ids: 1-40 chars [A-Za-z0-9_-], unique.
