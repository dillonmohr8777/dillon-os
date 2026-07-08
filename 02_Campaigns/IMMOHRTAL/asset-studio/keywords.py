#!/usr/bin/env python3
"""
IMMOHRTAL free keyword research — no API key, no cost.

Pulls real search suggestions from Google + YouTube Autocomplete
(the same feeds that power the search box) and expands each seed with
a–z / question-word modifiers to surface long-tail, AEO-friendly
queries people actually type. Music discovery skews to YouTube, so we
weight both engines.

Usage:  python3 keywords.py            # runs the IMMOHRTAL seed set
Output: data/keywords.json + a ranked print-out
"""
import json, os, time, urllib.parse, urllib.request
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
UA = "Mozilla/5.0 (keyword-research)"
QUESTIONS = ["how", "what", "who", "where", "why", "is", "when", "does"]
ALPHA = "abcdefghijklmnopqrstuvwxyz"

def suggest(q, yt=False):
    ds = "&ds=yt" if yt else ""
    url = (f"https://suggestqueries.google.com/complete/search"
           f"?client=firefox{ds}&q={urllib.parse.quote(q)}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8", "replace"))
        return data[1] if len(data) > 1 else []
    except Exception:
        return []

def expand(seed):
    """seed → suggestions for seed, seed+letter, question+seed (both engines)"""
    variants = [seed] + [f"{seed} {c}" for c in ALPHA] + [f"{q} {seed}" for q in QUESTIONS]
    hits = Counter()
    for v in variants:
        for yt in (False, True):
            for s in suggest(v, yt=yt):
                s = s.lower().strip()
                if s and s != seed:
                    hits[s] += 2 if yt else 1   # weight YouTube (music discovery)
            time.sleep(0.05)
    return hits

SEEDS = [
    "immohrtal",
    "dance with the delusional",
    "erie pa rapper",
    "pittsburgh rapper",
    "underground rapper 2026",
    "rappers like mac miller",
    "new rappers from pennsylvania",
    "sad rap album",
    "cmo who raps",
    "lyric rap album",
]

def main():
    all_hits = Counter()
    per_seed = {}
    for seed in SEEDS:
        h = expand(seed)
        per_seed[seed] = h.most_common(12)
        all_hits.update(h)
        print(f"\n### {seed}")
        for kw, n in h.most_common(10):
            print(f"  {n:>3}  {kw}")
    # global long-tail, questions surfaced separately (AEO gold)
    questions = {k: v for k, v in all_hits.items()
                 if any(k.startswith(q + " ") for q in QUESTIONS)}
    out = {
        "top_overall": all_hits.most_common(40),
        "questions": sorted(questions.items(), key=lambda x: -x[1])[:25],
        "per_seed": per_seed,
    }
    os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
    json.dump(out, open(os.path.join(HERE, "data", "keywords.json"), "w"), indent=2)
    print("\n\n=== QUESTION QUERIES (AEO targets) ===")
    for kw, n in out["questions"]:
        print(f"  {n:>3}  {kw}")
    print(f"\nsaved → data/keywords.json  ({len(all_hits)} unique terms)")

if __name__ == "__main__":
    main()
