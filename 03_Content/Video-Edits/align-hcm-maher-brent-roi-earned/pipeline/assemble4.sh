#!/bin/bash
# Assemble batch-2 clips from full-episode.mp4 (full-frame two-up, straight scale).
set -e
cd "$(dirname "$0")"

CLIP() { # name src_start src_end boxW boxH boxX boxY plateseq endseq mask ring title
  local N=$1 S=$2 E=$3 W=$4 H=$5 X=$6 Y=$7 PSEQ=$8 ESEQ=$9 MASK=${10} RING=${11} TITLE=${12}
  local D=$(python3 -c "print(round($E-$S,3))")
  local XOFF=$(python3 -c "print(round($D-0.5,3))")

  ffmpeg -y -v error -framerate 30 -i "$PSEQ/f_%04d.png" -c:v libx264 -preset fast -crf 15 -pix_fmt yuv420p "plate_$N.mp4"
  ffmpeg -y -v error -framerate 30 -i "$ESEQ/f_%04d.png" -f lavfi -t 3.1 -i anullsrc=r=48000:cl=stereo \
    -c:v libx264 -preset fast -crf 15 -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -shortest "end_$N.mp4"

  ffmpeg -y -v error \
    -ss "$S" -to "$E" -i full-episode.mp4 \
    -i "plate_$N.mp4" \
    -loop 1 -i "$MASK" \
    -loop 1 -i "$RING" \
    -filter_complex "\
      [0:v]setpts=PTS-STARTPTS,fps=30,scale=$W:$H:flags=lanczos,setsar=1,format=rgba[vx]; \
      [2:v]format=gray[mk]; [vx][mk]alphamerge[vm]; \
      [1:v]setpts=PTS-STARTPTS,format=rgba[pl]; [pl][vm]overlay=$X:$Y:eof_action=repeat[p1]; \
      [3:v]format=rgba[ring]; [p1][ring]overlay=0:0,format=yuv420p[vout]; \
      [0:a]asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.15[aout]" \
    -map "[vout]" -map "[aout]" -t "$D" \
    -c:v libx264 -preset fast -crf 16 -r 30 -c:a aac -b:a 256k "main_$N.mp4"

  ffmpeg -y -v error -i "main_$N.mp4" -i "end_$N.mp4" \
    -filter_complex "\
      [0:v][1:v]xfade=transition=smoothleft:duration=0.5:offset=$XOFF[xv]; \
      [xv]ass=captions_$N.ass[vf]; \
      [0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[am]; \
      [am]loudnorm=I=-16:TP=-1.5:LRA=11[af]" \
    -map "[vf]" -map "[af]" \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
    "$TITLE"
  echo "== $TITLE done"
}

CLIP c4 139.60 159.55  1316 740 302 64 c4_f end4_f mask_c1.png ring_c1.png "Align HCM Clip 4 - Personal ROI.mp4"
CLIP c5 711.40 734.90  1240 697 340 64 c5_f end5_f mask_c3.png ring_c3.png "Align HCM Clip 5 - Product Not Utility.mp4"
CLIP c6 1230.40 1258.95 1160 652 700 84 c6_f end6_f mask_c2.png ring_c2.png "Align HCM Clip 6 - Speak CFO.mp4"
echo BATCH2 DONE
