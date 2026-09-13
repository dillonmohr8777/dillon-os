#!/bin/bash
set -e
cd "$(dirname "$0")"
CLIP() { # name src_start src_end boxW boxH boxX boxY mask ring title kicker endseq plateseq
  local N=$1 S=$2 E=$3 W=$4 H=$5 X=$6 Y=$7 MASK=$8 RING=$9 TITLE=${10} ESEQ=${11} PSEQ=${12}
  local D=$(python3 -c "print(round($E-$S,3))")
  local XOFF=$(python3 -c "print(round($D-0.5,3))")
  ffmpeg -y -v error -framerate 30 -i "$PSEQ/f_%04d.png" -c:v libx264 -preset fast -crf 15 -pix_fmt yuv420p "plate5_$N.mp4"
  ffmpeg -y -v error -framerate 30 -i "$ESEQ/f_%04d.png" -f lavfi -t 3.1 -i anullsrc=r=48000:cl=stereo \
    -c:v libx264 -preset fast -crf 15 -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -shortest "end5_$N.mp4"
  ffmpeg -y -v error -ss "$S" -to "$E" -i full-episode.mp4 -i "plate5_$N.mp4" -loop 1 -i "$MASK" -loop 1 -i "$RING" \
    -filter_complex "\
      [0:v]setpts=PTS-STARTPTS,fps=30,scale=$W:$H:flags=lanczos,setsar=1,format=rgba[vx]; \
      [2:v]format=gray[mk]; [vx][mk]alphamerge[vm]; \
      [1:v]setpts=PTS-STARTPTS,format=rgba[pl]; [pl][vm]overlay=$X:$Y:eof_action=repeat[p1]; \
      [3:v]format=rgba[ring]; [p1][ring]overlay=0:0,format=yuv420p[vout]; \
      [0:a]asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.15[aout]" \
    -map "[vout]" -map "[aout]" -t "$D" \
    -c:v libx264 -preset fast -crf 16 -r 30 -c:a aac -b:a 256k "main5_$N.mp4"
  ffmpeg -y -v error -i "main5_$N.mp4" -i "end5_$N.mp4" \
    -filter_complex "\
      [0:v][1:v]xfade=transition=smoothleft:duration=0.5:offset=$XOFF[xv]; \
      [xv]ass=captions5_$N.ass[vf]; \
      [0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[am]; \
      [am]loudnorm=I=-16:TP=-1.5:LRA=11[af]" \
    -map "[vf]" -map "[af]" \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$TITLE"
  echo "== $TITLE done"
}
CLIP v1 440.60 454.10  1220 686 350 58 mask_v5.png ring_v5.png "Align HCM Clip 1 - The Record Trap - v2.mp4" endv1_f v1_f
CLIP v2 504.00 520.40  1160 652 700 84 mask_c2.png ring_c2.png "Align HCM Clip 2 - Foundation to Skyscraper - v2.mp4" endv2_f v2_f
CLIP v3 528.05 552.65  1220 686 350 58 mask_v5.png ring_v5.png "Align HCM Clip 3 - Leverage the System - v2.mp4" endv3_f v3_f
CLIP v4 139.60 159.55  1220 686 350 58 mask_v5.png ring_v5.png "Align HCM Clip 4 - Personal ROI - v2.mp4" endv4_f v4_f
CLIP v5 711.40 734.90  1220 686 350 58 mask_v5.png ring_v5.png "Align HCM Clip 5 - Product Not Utility - v2.mp4" endv5_f v5_f
CLIP v6 1230.40 1258.95 1160 652 700 84 mask_c2.png ring_c2.png "Align HCM Clip 6 - Speak CFO - v2.mp4" endv6_f v6_f
echo V5 BATCH DONE
