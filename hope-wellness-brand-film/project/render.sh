#!/usr/bin/env bash
# Hope Wellness Center brand film - full reproducible build.
#
#   ./project/render.sh            full build (assets, score, video, mux, QC)
#   ./project/render.sh video      re-render picture only
#   ./project/render.sh audio      re-synthesise the score only
#
# Picture is rendered in parallel segments and concatenated losslessly, then
# muxed with the synthesised score.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
SEG=$ROOT/build/seg
FINAL=$ROOT/render/hope-wellness-five-video-brand-film-final.mp4
JOBS=${JOBS:-4}
STEP=${1:-all}

mkdir -p "$SEG" "$ROOT/render" "$ROOT/build/inspect"

TOTAL=$(python3 -c "import sys;sys.path.insert(0,'project');import manifest as M;print(M.TOTAL)")

render_video () {
  echo "== picture: $TOTAL s in $JOBS parallel segments"
  rm -f "$SEG"/*.mp4 "$SEG"/list.txt
  python3 - "$JOBS" "$TOTAL" <<'PY' > "$SEG/bounds.txt"
import sys
jobs, total = int(sys.argv[1]), float(sys.argv[2])
# split on whole frames so no frame is rendered twice or dropped
n = round(total * 30)
edges = [round(i * n / jobs) for i in range(jobs + 1)]
for i in range(jobs):
    print(f"{i} {edges[i]/30:.6f} {edges[i+1]/30:.6f}")
PY
  while read -r i a b; do
    ( python3 project/compose.py --render "$SEG/seg$i.mp4" --start "$a" --end "$b" \
        > "$SEG/seg$i.log" 2>&1 && echo "   segment $i done" ) &
  done < "$SEG/bounds.txt"
  wait
  for f in $(ls "$SEG"/seg*.mp4 | sort -V); do echo "file '$f'"; done > "$SEG/list.txt"
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$SEG/list.txt" \
     -c copy "$ROOT/build/picture.mp4"
  echo "   -> build/picture.mp4"
}

case "$STEP" in
  assets) python3 project/extract_assets.py ;;
  audio)  python3 project/audio.py ;;
  video)  render_video ;;
  all)
    python3 project/extract_assets.py
    python3 project/manifest.py
    python3 project/audio.py
    render_video
    ;;
esac

if [ "$STEP" = "all" ] || [ "$STEP" = "mux" ] || [ "$STEP" = "video" ]; then
  echo "== mux"
  ffmpeg -y -hide_banner -loglevel error \
    -i "$ROOT/build/picture.mp4" -i "$ROOT/render/score.wav" \
    -map 0:v:0 -map 1:a:0 \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
    -profile:v high -level 4.0 -bf 2 -g 60 \
    -movflags +faststart \
    -c:a aac -b:a 192k -ar 48000 -ac 2 \
    -shortest "$FINAL"
  echo "   -> $FINAL"
  ffprobe -v error -show_entries \
    stream=index,codec_name,width,height,r_frame_rate,sample_rate,channels,duration \
    -show_entries format=duration,size,bit_rate -of default=noprint_wrappers=1 "$FINAL"
fi
