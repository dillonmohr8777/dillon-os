#!/bin/bash
# Assemble the Align HCM — Maher x Brent cut.
set -e
cd "$(dirname "$0")"

MK() { # label src_start src_end crop plate punch
  local L=$1 S=$2 E=$3 CROP=$4 PLATE=$5
  local D=$(python3 -c "print(round($E-$S,3))")
  ffmpeg -y -v error \
    -ss "$S" -to "$E" -i master.mp4 \
    -loop 1 -i "$PLATE" \
    -loop 1 -i window_mask.png \
    -loop 1 -i chrome_ring.png \
    -filter_complex "\
      [0:v]setpts=PTS-STARTPTS,fps=30,crop=$CROP,scale=1260:709:flags=lanczos,setsar=1,format=rgba[vx]; \
      [2:v]format=gray[mk]; [vx][mk]alphamerge[vm]; \
      [1:v]format=rgba[pl]; [pl][vm]overlay=581:64:eof_action=repeat[p1]; \
      [3:v]format=rgba[ring]; [p1][ring]overlay=0:0,format=yuv420p[vout]; \
      [0:a]asetpts=PTS-STARTPTS,aresample=48000,pan=stereo|c0=c0|c1=c0[aout]" \
    -map "[vout]" -map "[aout]" -t "$D" \
    -c:v libx264 -preset fast -crf 16 -r 30 -c:a aac -b:a 256k "seg_$L.mp4"
  echo "seg_$L.mp4 done ($D s)"
}

# label  src_start src_end  crop(w:h:x:y)      plate
MK A1  7.50  14.92  "1161:653:1443:439"  plate_a.png &
MK A2  16.30 29.55  "1161:653:1443:439"  plate_a.png &
wait
MK B   68.10 74.60  "1179:663:262:327"   plate_b.png &
MK C1  79.45 95.95  "2340:1316:264:2"    plate_c1.png &
wait
MK C2  116.30 128.10 "1095:616:1476:465" plate_c2.png

# intro / outro from frame sequences (silent audio)
ffmpeg -y -v error -framerate 30 -i intro_frames/f_%04d.png -f lavfi -t 4.8 -i anullsrc=r=48000:cl=stereo \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -shortest seg_INTRO.mp4
ffmpeg -y -v error -framerate 30 -i outro_frames/f_%04d.png -f lavfi -t 6.0 -i anullsrc=r=48000:cl=stereo \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -shortest seg_OUTRO.mp4
echo "intro/outro done"

# final: xfade chain + acrossfade chain + captions + loudnorm
ffmpeg -y -v error \
  -i seg_INTRO.mp4 -i seg_A1.mp4 -i seg_A2.mp4 -i seg_B.mp4 -i seg_C1.mp4 -i seg_C2.mp4 -i seg_OUTRO.mp4 \
  -filter_complex "\
    [0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.30[x1]; \
    [x1][2:v]xfade=transition=dissolve:duration=0.35:offset=11.37[x2]; \
    [x2][3:v]xfade=transition=smoothleft:duration=0.5:offset=24.12[x3]; \
    [x3][4:v]xfade=transition=smoothright:duration=0.5:offset=30.12[x4]; \
    [x4][5:v]xfade=transition=fade:duration=0.02:offset=46.60[x5]; \
    [x5][6:v]xfade=transition=fade:duration=0.6:offset=57.80[xv]; \
    [xv]ass=captions_master.ass[vf]; \
    [0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a1]; \
    [a1][2:a]acrossfade=d=0.35:c1=tri:c2=tri[a2]; \
    [a2][3:a]acrossfade=d=0.5:c1=tri:c2=tri[a3]; \
    [a3][4:a]acrossfade=d=0.5:c1=tri:c2=tri[a4]; \
    [a4][5:a]acrossfade=d=0.02:c1=tri:c2=tri[a5]; \
    [a5][6:a]acrossfade=d=0.6:c1=tri:c2=tri[a6]; \
    [a6]loudnorm=I=-16:TP=-1.5:LRA=11[af]" \
  -map "[vf]" -map "[af]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  "Align HCM - Maher x Brent - ROI Is Earned - 64s.mp4"
echo FINAL DONE
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "Align HCM - Maher x Brent - ROI Is Earned - 64s.mp4"
