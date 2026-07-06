#!/usr/bin/env bash
# Chunked render: splits the timeline into 4 ranges so a late worker stall
# can't lose the whole run, retries each failed chunk once, then concats
# with ffmpeg (stream copy, no re-encode).
set -u
cd "$(dirname "$0")/.."

TOTAL=5298
CHUNKS=("0-1349" "1350-2699" "2700-4049" "4050-5297")
FFMPEG="$(node -e "process.stdout.write(require('@ffmpeg-installer/ffmpeg').path)")"

mkdir -p out/chunks
rm -f out/chunks/*.mp4 out/chunks/list.txt

for i in "${!CHUNKS[@]}"; do
  range="${CHUNKS[$i]}"
  out="out/chunks/chunk-$i.mp4"
  ok=0
  for attempt in 1 2; do
    echo "=== chunk $i ($range) attempt $attempt ==="
    if npx remotion render LyricVideo "$out" --frames="$range" --concurrency=3 --timeout=120000; then
      ok=1
      break
    fi
    echo "chunk $i attempt $attempt FAILED"
  done
  if [ "$ok" -ne 1 ]; then
    echo "FATAL: chunk $i failed twice" >&2
    exit 1
  fi
  echo "file 'chunk-$i.mp4'" >> out/chunks/list.txt
done

"$FFMPEG" -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/lyric-video.mp4
echo "CONCAT EXIT: $?"
ls -la out/lyric-video.mp4
