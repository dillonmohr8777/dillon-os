#!/usr/bin/env bash
# Rebuild the Thursday Ep. 58 teaser from the official podcast cover,
# branded caption cards, end card, and the 45s published-episode audio clip.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COVER="$ROOT/assets/donuts-divorce-cover-1200.jpg"
CAP1="$ROOT/video/caption-1.png"
CAP2="$ROOT/video/caption-2.png"
CAP3="$ROOT/video/caption-3.png"
END="$ROOT/video/end-card.png"
AUDIO="$ROOT/video/ep58-teaser-audio.m4a"
OUT="$ROOT/video/BOK-Turn-the-Page-Thursday-Ep58-teaser.mp4"
TMP="${TMPDIR:-/tmp}/bok-teaser-build"
mkdir -p "$TMP"

if [[ ! -f "$AUDIO" ]]; then
  echo "Missing $AUDIO. Cut 45s from the published episode starting at 6:55." >&2
  exit 1
fi

echo "Encoding 45s motion body..."
ffmpeg -y -hide_banner -loglevel error \
  -loop 1 -t 45 -i "$COVER" \
  -i "$CAP1" -i "$CAP2" -i "$CAP3" \
  -i "$AUDIO" \
  -filter_complex "\
    [0:v]scale=1400:1400,zoompan=z='min(1.0+0.00035*on,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1350:s=1080x1080:fps=30,\
    pad=1080:1920:0:0:color=0x0d5558,setsar=1[base];\
    [1:v]format=rgba[c1];[2:v]format=rgba[c2];[3:v]format=rgba[c3];\
    [base][c1]overlay=0:0:format=auto:enable='lt(t,15)'[v1];\
    [v1][c2]overlay=0:0:format=auto:enable='between(t,15,30)'[v2];\
    [v2][c3]overlay=0:0:format=auto:enable='gte(t,30)'[vout]\
  " \
  -map "[vout]" -map 4:a \
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 \
  -c:a aac -b:a 192k -ar 44100 -ac 2 \
  -t 45 "$TMP/body.mp4"

echo "Encoding 4s end card..."
ffmpeg -y -hide_banner -loglevel error \
  -loop 1 -framerate 30 -t 4 -i "$END" \
  -f lavfi -t 4 -i anullsrc=r=44100:cl=stereo \
  -vf "setsar=1,format=yuv420p" \
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 -r 30 \
  -c:a aac -b:a 192k -ar 44100 -ac 2 \
  -shortest "$TMP/end.mp4"

echo "Concatenating..."
ffmpeg -y -hide_banner -loglevel error \
  -i "$TMP/body.mp4" -i "$TMP/end.mp4" \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 \
  -c:a aac -b:a 192k -movflags +faststart \
  "$OUT"

echo "Wrote $OUT"
ffprobe -hide_banner "$OUT"
