#!/usr/bin/env python3
"""
IMMOHRTAL clip factory — batch-cuts the tracks' best-energy windows
(from data/analysis.json) into captioned vertical clips using the
lyric-clip treatment from motion.py. Captions auto-pull from
data/transcripts.json (⚠ auto-transcribed — correct in ../Tracks/).

Usage:  python3 clips.py            # all clips
        python3 clips.py 814-15s    # one
Output: out/motion/clip-<id>.mp4
"""
import os, sys, json
from motion import make_lyric, OUT, UPLOADS

HERE = os.path.dirname(os.path.abspath(__file__))
TRANS = json.load(open(os.path.join(HERE, "data", "transcripts.json")))

A814 = f"{UPLOADS}/d23670e1-814_Blood_ft._king_Keev.mp3"
AOMW = f"{UPLOADS}/c84a3b09-On_My_Way_ft._King_Keev.mp3"
ANOTE = f"{UPLOADS}/b07846c9-Picking_Up_My_Notepad.mp3"
AMMB = f"{UPLOADS}/cd64d468-My_Mothers_Baby.wav"
ADICE = f"{UPLOADS}/79d1f138-Roll_the_Dice.mp3"
AMOW = f"{UPLOADS}/e7ac92cc-My_Own_Way.mp3"
AGAL = f"{UPLOADS}/cc31a42f-Grade_A_Love.mp3"

def mmss(t):
    m, s = t.split(":"); return int(m)*60 + int(s)

def captions(track, start, dur):
    segs = TRANS[track]
    return [(mmss(s["t"]), s["text"].strip().rstrip(",")) for s in segs
            if start - 2 <= mmss(s["t"]) < start + dur - 1]

def clip(bid, audio, track, title, trk, start, dur):
    make_lyric(f"clip-{bid}", audio, title, trk, float(start), float(dur),
               captions(track, start, dur))

T814 = "814 Blood (ft. King Keev)"
TOMW = "On My Way (ft. King Keev)"

JOBS = {
    # best 15s / 30s windows from data/analysis.json energy profiles
    "814-15s":     lambda: clip("814-15s", A814, T814, "814 Blood", "TRK 03 // FT. KING KEEV", 40, 15),
    "814-30s":     lambda: clip("814-30s", A814, T814, "814 Blood", "TRK 03 // FT. KING KEEV", 25, 30),
    "onmyway-15s": lambda: clip("onmyway-15s", AOMW, TOMW, "On My Way", "TRK 09 // FT. KING KEEV", 40, 15),
    "onmyway-30s": lambda: clip("onmyway-30s", AOMW, TOMW, "On My Way", "TRK 09 // FT. KING KEEV", 120, 30),
    # solo tracks — best15s windows from data/analysis.json
    "notepad-15s":     lambda: clip("notepad-15s", ANOTE, "Picking Up My Notepad", "Picking Up My Notepad", "TRK 02", 112, 15),
    "mothersbaby-15s": lambda: clip("mothersbaby-15s", AMMB, "My Mothers Baby", "My Mothers Baby", "TRK 04", 30, 15),
    "rollthedice-15s": lambda: clip("rollthedice-15s", ADICE, "Roll the Dice", "Roll the Dice", "TRK 05", 55, 15),
    "myownway-15s":    lambda: clip("myownway-15s", AMOW, "My Own Way", "My Own Way", "TRK 06", 125, 15),
    "gradealove-15s":  lambda: clip("gradealove-15s", AGAL, "Grade A Love", "Grade A Love", "TRK 08", 45, 15),
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for jid in (sys.argv[1:] or list(JOBS)):
        JOBS[jid]()
