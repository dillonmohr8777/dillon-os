#!/usr/bin/env python3
"""Generate the IMMOHRTAL posting schedule: a CSV importable to Buffer or
Metricool, plus a readable markdown calendar. Beats first, no lyrics,
captions in Dillon's voice. Zero em/en dashes by construction."""
import csv, os, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "Social"))
os.makedirs(OUT, exist_ok=True)
START = datetime.date(2026, 7, 13)  # week 1, Monday

# (day_offset, time, platforms, pillar, type, asset, caption, hashtags)
POSTS = [
 (0,"18:00","IG Reels, TikTok, Shorts","The Sound","Reel","motion/descent-notepad.mp4",
  "Picking Up My Notepad. no words this time, just let the beat ride. this is what the whole world of the album feels like. sound on.",
  "#immohrtal #newmusic #undergroundrap #pittsburghrap #eriepa"),
 (1,"12:00","IG Feed","The Making","Feed","split/split-02.png",
  "every track gets its own waveform. this is Picking Up My Notepad, start to finish, on paper and in the booth. TRK 02.",
  "#immohrtal #dancewiththedelusional #rap #waveform"),
 (2,"18:30","IG Reels, TikTok, Shorts","The Sound","Reel","motion/descent-814.mp4",
  "814 Blood. the 814 is Erie, that area code is in me. me and King Keev on this one. turn it up.",
  "#immohrtal #eriepa #814 #pittsburghrap #undergroundrap"),
 (4,"12:00","IG Feed, X","The Split","Feed","tracklist.png",
  "eleven tracks. Dance With The Delusional. made it at night while the day job ran loud. here is the whole thing laid out.",
  "#immohrtal #newalbum #rap #dancewiththedelusional"),
 (5,"11:00","IG Story","The Making","Story","story-notepad.png",
  "swipe up when it drops. previews are already up on the site.",
  ""),
 (7,"18:00","IG Reels, TikTok, Shorts","The Sound","Reel","motion/descent-mothersbaby.mp4",
  "My Mothers Baby. one of the most honest ones on here. beat only for now. you feel me.",
  "#immohrtal #undergroundrap #sadrap #pittsburgh"),
 (8,"12:00","IG Feed","The Making","Feed","split/split-04.png",
  "My Mothers Baby, TRK 04. the shape of the whole song in one picture.",
  "#immohrtal #waveform #rap #dancewiththedelusional"),
 (9,"18:30","IG Reels, TikTok, Shorts","The Sound","Reel","motion/descent-rollthedice.mp4",
  "Roll the Dice. this one moves different. sound on, let it hit.",
  "#immohrtal #undergroundrap #newmusic #pittsburghrap"),
 (11,"12:00","IG Carousel","The Why","Carousel","split/split-05.png",
  "how a kid from a cold lake town ended up making this. Erie to Pittsburgh. the whole story in five. swipe.",
  "#immohrtal #eriepa #pittsburgh #macmiller #rapstory"),
 (12,"11:00","IG Story","The Split","Story","story-rollthedice.png",
  "CMO by day. this by night. same guy.",
  ""),
 (14,"18:00","IG Reels, TikTok, Shorts","The Sound","Reel","motion/descent-myownway.mp4",
  "My Own Way. had to do it my own way or not at all. beat preview. full thing soon.",
  "#immohrtal #undergroundrap #newmusic #ifnotnowwhen"),
 (15,"12:00","IG Feed","The Making","Feed","split/split-06.png",
  "My Own Way, TRK 06. paper on top, booth on the bottom, signal blue tying it together.",
  "#immohrtal #waveform #rap"),
 (16,"18:30","IG Reels, TikTok, Shorts","The Sound","Reel","motion/descent-gradealove.mp4",
  "Grade A Love. softer side of the record. let it play.",
  "#immohrtal #rnbrap #undergroundrap #pittsburgh"),
 (18,"12:00","IG Feed, X","The Why","Feed","split/split-08.png",
  "almost 29. probably should have done this years ago. doing it now anyway. Grade A Love, TRK 08. if not now, when.",
  "#immohrtal #ifnotnowwhen #rap #pittsburgh"),
 (19,"11:00","IG Story","The Making","Story","story-gradealove.png",
  "the list gets the first listens. link in bio.",
  ""),
 (21,"18:00","IG Reels, TikTok, Shorts","The Sound","Reel","motion/descent-onmyway.mp4",
  "On My Way. me and Keev again. sunniest one on the album. sound on and ride with it.",
  "#immohrtal #undergroundrap #summer #pittsburghrap"),
 (22,"12:00","IG Feed","The Split","Feed","banner-x.png",
  "IMMOHRTAL. Erie made me, Pittsburgh raised the dream. everything lives at the link.",
  "#immohrtal #pittsburgh #eriepa #rap"),
 (24,"12:00","IG Feed","The Why","Feed","story-onmyway.png",
  "Mac made me believe a person like me could do this and mean it. this whole thing is me trying to earn that. On My Way.",
  "#immohrtal #macmiller #pittsburgh #undergroundrap"),
]

rows = []
for off, tm, plats, pillar, typ, asset, cap, tags in POSTS:
    d = START + datetime.timedelta(days=off)
    rows.append({
        "Date": d.isoformat(), "Time": tm, "Platform": plats, "Pillar": pillar,
        "Type": typ, "Asset": f"asset-studio/out/{asset}", "Caption": cap, "Hashtags": tags,
    })

# guard: no em/en dashes anywhere
blob = "".join(r["Caption"] + r["Hashtags"] for r in rows)
assert "—" not in blob and "–" not in blob, "dash leaked in captions"

# CSV (Buffer/Metricool bulk import friendly)
with open(os.path.join(OUT, "posting-schedule.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["Date","Time","Platform","Pillar","Type","Asset","Caption","Hashtags"])
    w.writeheader(); w.writerows(rows)

# readable markdown
md = ["# IMMOHRTAL Posting Schedule (beats first, no lyrics)\n",
      "Four week runway. Import `posting-schedule.csv` into Buffer or Metricool,",
      "or post by hand off this list. Captions are final, in voice, dash free.",
      "Reels cross post to IG Reels + TikTok + YouTube Shorts (same file).\n",
      "Skipped for now: lyric quote cards and lyric videos (holding on lyrics).\n"]
wk = None
for r in rows:
    d = datetime.date.fromisoformat(r["Date"])
    w_no = (d - START).days // 7 + 1
    if w_no != wk:
        wk = w_no; md.append(f"\n## Week {wk}\n")
    md.append(f"- **{r['Date']} {r['Time']}** · {r['Type']} · _{r['Pillar']}_ · {r['Platform']}")
    md.append(f"  - asset: `{r['Asset']}`")
    md.append(f"  - caption: {r['Caption']}")
    if r["Hashtags"]: md.append(f"  - tags: {r['Hashtags']}")
open(os.path.join(OUT, "Posting Schedule.md"), "w").write("\n".join(md))
print(f"wrote {len(rows)} posts to Social/posting-schedule.csv + Posting Schedule.md")
