#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME:-google-chrome}"
mkdir -p "$ROOT/final" "$ROOT/packet-pages"

shot() {
  local w="$1" h="$2" out="$3" url="$4" name="$5"
  local dir="/tmp/bok-chrome-${name}-$$"
  rm -rf "$dir"
  mkdir -p "$dir"
  timeout -k 2 20 "$CHROME" \
    --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --no-first-run --no-default-browser-check \
    --user-data-dir="$dir" \
    --force-device-scale-factor=1 \
    --virtual-time-budget=10000 \
    --window-size="${w},${h}" \
    --screenshot="$out" \
    "$url" >/tmp/bok-chrome-"$name".log 2>&1 || true
  rm -rf "$dir"
  python3 - "$out" "$w" "$h" <<'PY'
import sys
from pathlib import Path
from PIL import Image
path, w, h = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
p = Path(path)
assert p.exists() and p.stat().st_size > 40000, (path, p.stat().st_size if p.exists() else 0)
im = Image.open(path).convert("RGB")
if im.size != (w, h):
    im = im.crop((0, 0, min(im.width, w), min(im.height, h)))
    if im.size != (w, h):
        canvas = Image.new("RGB", (w, h), (13, 85, 88))
        canvas.paste(im, (0, 0))
        im = canvas
    im.save(path, optimize=True)
print(path, Image.open(path).size, Path(path).stat().st_size)
PY
}

shot 1080 1350 "$ROOT/final/wednesday-wisdom.png" "file://$ROOT/graphics.html?post=wed" wed
shot 1080 1350 "$ROOT/final/family-friday.png" "file://$ROOT/graphics.html?post=fri" fri
shot 1080 1350 "$ROOT/final/saturday-solutions.png" "file://$ROOT/graphics.html?post=sat" sat

if [[ -f "$ROOT/packet.html" ]]; then
  shot 1275 1650 "$ROOT/packet-pages/cover.png" "file://$ROOT/packet.html?page=cover" cover
  shot 1275 1650 "$ROOT/packet-pages/wednesday.png" "file://$ROOT/packet.html?page=wed" pwed
  shot 1275 1650 "$ROOT/packet-pages/friday.png" "file://$ROOT/packet.html?page=fri" pfri
  shot 1275 1650 "$ROOT/packet-pages/saturday.png" "file://$ROOT/packet.html?page=sat" psat
  python3 - "$ROOT/packet-pages" "$ROOT/This-Week-With-BOK-August-19-22-2026.pdf" <<'PY'
import sys
from pathlib import Path
import pymupdf
src, dest = Path(sys.argv[1]), Path(sys.argv[2])
order = ["cover.png", "wednesday.png", "friday.png", "saturday.png"]
doc = pymupdf.open()
for name in order:
    img = src / name
    pix = pymupdf.Pixmap(str(img))
    page = doc.new_page(width=612, height=792)
    page.insert_image(page.rect, pixmap=pix)
doc.save(dest, deflate=True)
print("pdf", dest, dest.stat().st_size, "pages", doc.page_count)
doc.close()
PY
fi

echo "render ok"
