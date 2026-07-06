#!/usr/bin/env bash
# Chunked render: splits the timeline into ~4 ranges so a late worker stall
# can't lose the whole run, retries each failed chunk once, then concats
# with ffmpeg (stream copy, no re-encode).
#
# Usage: render-chunked.sh [CompositionId] [output.mp4]
# Total frames are read from the composition itself via `remotion compositions`.
set -u
cd "$(dirname "$0")/.."

COMP="${1:-LyricVideo}"
OUT="${2:-out/lyric-video.mp4}"
FFMPEG="$(node -e "process.stdout.write(require('@ffmpeg-installer/ffmpeg').path)")"

TOTAL="$(npx remotion compositions 2>/dev/null | awk -v c="$COMP" '$1 == c {print $4}')"
if ! [[ "$TOTAL" =~ ^[0-9]+$ ]]; then
  echo "FATAL: could not determine frame count for composition '$COMP' (got: '$TOTAL')" >&2
  exit 1
fi
echo "Composition $COMP: $TOTAL frames"

CHUNK_DIR="out/chunks-$COMP"
mkdir -p "$CHUNK_DIR" "$(dirname "$OUT")"
rm -f "$CHUNK_DIR"/*.mp4 "$CHUNK_DIR/list.txt"

N=4
PER=$(( (TOTAL + N - 1) / N ))
for ((i = 0; i < N; i++)); do
  start=$((i * PER))
  end=$(( (i + 1) * PER - 1 ))
  ((end >= TOTAL)) && end=$((TOTAL - 1))
  ((start > end)) && break
  range="$start-$end"
  chunk="$CHUNK_DIR/chunk-$i.mp4"
  ok=0
  for attempt in 1 2; do
    echo "=== chunk $i ($range) attempt $attempt ==="
    if npx remotion render "$COMP" "$chunk" --frames="$range" --concurrency=3 --timeout=120000; then
      ok=1
      break
    fi
    echo "chunk $i attempt $attempt FAILED"
  done
  if [ "$ok" -ne 1 ]; then
    echo "FATAL: chunk $i failed twice" >&2
    exit 1
  fi
  echo "file 'chunk-$i.mp4'" >> "$CHUNK_DIR/list.txt"
done

"$FFMPEG" -y -f concat -safe 0 -i "$CHUNK_DIR/list.txt" -c copy "$OUT"
echo "CONCAT EXIT: $?"
ls -la "$OUT"
