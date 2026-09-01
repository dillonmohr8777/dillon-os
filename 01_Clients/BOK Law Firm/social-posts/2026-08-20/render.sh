#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME:-google-chrome}"

shot() {
  local w="$1" h="$2" out="$3" url="$4" name="$5"
  local dir="/tmp/bok-chrome-${name}"
  rm -rf "$dir"
  mkdir -p "$dir"
  timeout -k 2 18 "$CHROME" \
    --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --no-first-run --no-default-browser-check \
    --user-data-dir="$dir" \
    --force-device-scale-factor=1 \
    --virtual-time-budget=8000 \
    --window-size="${w},${h}" \
    --screenshot="$out" \
    "$url" >/tmp/bok-chrome-"$name".log 2>&1 || true
  python3 - "$out" "$w" "$h" <<'PY'
import sys
from PIL import Image
path, w, h = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
im = Image.open(path)
if im.size != (w, h):
    im = im.crop((0, 0, min(im.width, w), min(im.height, h)))
    if im.size != (w, h):
        canvas = Image.new("RGB", (w, h), (13, 85, 88))
        canvas.paste(im, (0, 0))
        im = canvas
    im.save(path, optimize=True)
print(path, Image.open(path).size)
PY
}

shot 1080 1350 "$ROOT/final/turn-the-page-thursday.png" "file://$ROOT/graphics.html?post=thu" thu
shot 1080 1350 "$ROOT/final/family-friday.png" "file://$ROOT/graphics.html?post=fri" fri
shot 1080 1350 "$ROOT/final/saturday-solutions.png" "file://$ROOT/graphics.html?post=sat" sat
shot 1080 1920 "$ROOT/video/end-card.png" "file://$ROOT/video/end-card.html" end
echo "Graphics rendered."
