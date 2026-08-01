"""Validate generated sites: HTML tag balance, JS syntax, unresolved tokens."""
import os, re, subprocess, sys, json
BASE = r"C:\Users\dillo\Documents\Codex\2026-07-31\push-to-netlify-4\dillon-os-pr242\philly-sites-b2"
ASSIGN = json.load(open(os.path.join(BASE,"_build","templates.json"),encoding="utf-8"))
import importlib.util
spec = importlib.util.spec_from_file_location("g", os.path.join(BASE,"_build","generate_sites.py"))
# avoid executing build; just read site list from file
sites = []
src = open(os.path.join(BASE,"_build","generate_sites.py"),encoding="utf-8").read()
m = re.search(r"ASSIGN = \{(.*?)\n\}", src, re.S)
for k in re.findall(r'"([a-z0-9-]+)":', m.group(1)): sites.append(k)

VOID = {"meta","link","img","br","input","hr","source","wbr"}
fails = []
for s in sites:
    d = os.path.join(BASE, s)
    for f in ["index.html","site.css","site.js"]:
        if not os.path.exists(os.path.join(d,f)): fails.append(f"{s}: missing {f}")
    h = open(os.path.join(d,"index.html"),encoding="utf-8").read()
    stack = []
    for tm in re.finditer(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*)>", h):
        closing, tag = tm.group(1), tm.group(2).lower()
        if tag in VOID or tm.group(3).rstrip().endswith("/"): continue
        if closing:
            if stack and stack[-1]==tag: stack.pop()
            elif tag in stack:
                fails.append(f"{s}: mis-nested </{tag}>")
                while stack and stack[-1]!=tag: stack.pop()
                if stack: stack.pop()
        else:
            stack.append(tag)
    if stack: fails.append(f"{s}: unclosed tags {stack[:5]}")
    c = open(os.path.join(d,"site.css"),encoding="utf-8").read()
    for tok in ["__PAPER__","__INK__","__ACCENT__","__DEEP__","__DISPLAY__","__TEXT__","__RADIUS__","__BTNR__"]:
        if tok in c: fails.append(f"{s}: unresolved {tok}")
    r = subprocess.run(["node","--check",os.path.join(d,"site.js")],capture_output=True,text=True)
    if r.returncode != 0: fails.append(f"{s}: JS syntax error {r.stderr[:200]}")
    # all referenced assets exist
    for a in set(re.findall(r'(?:src|href)="(assets/[^"]+)"', h)):
        if not os.path.exists(os.path.join(d,a)): fails.append(f"{s}: missing asset {a}")
print(f"checked {len(sites)} sites")
if fails:
    print("FAILURES:"); [print(" -",f) for f in fails]; sys.exit(1)
print("ALL LOCAL VALIDATION PASSED")
