#!/usr/bin/env python3
"""Fetch Playfair Display and Inter and inline them as base64 woff2.

Writes build/fonts.css, which build.py drops into index.html so the page runs
with no network at all. Only the latin subset is kept, and the unicode-range
rules are stripped so nothing tries to lazily fetch a subset that is not there.

Run from the build/ directory: python3 fonts.py
"""
import base64
import os
import re
import urllib.request

CSS_URL = (
    'https://fonts.googleapis.com/css2'
    '?family=Playfair+Display:ital,wght@0,700;0,900;1,700'
    '&family=Inter:wght@400;500;600;700;800&display=swap'
)
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    return urllib.request.urlopen(req).read()


os.makedirs('fonts', exist_ok=True)
if not os.path.exists('fonts/gf.css'):
    open('fonts/gf.css', 'wb').write(fetch(CSS_URL))
css = open('fonts/gf.css').read()

out = []
for subset, block in re.findall(r"/\*\s*([a-z\-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S):
    if subset != 'latin':
        continue
    url = re.search(r"url\((https://[^)]+)\)", block).group(1)
    path = 'fonts/' + url.rsplit('/', 1)[-1]
    if not os.path.exists(path):
        open(path, 'wb').write(fetch(url))
    data = open(path, 'rb').read()
    b64 = base64.b64encode(data).decode()
    block = re.sub(r"url\(https://[^)]+\)", f"url(data:font/woff2;base64,{b64})", block)
    block = re.sub(r"\s*unicode-range:[^;]+;", "", block)
    fam = re.search(r"font-family: '([^']+)'", block).group(1)
    weight = re.search(r"font-weight: (\d+)", block).group(1)
    style = re.search(r"font-style: (\w+)", block).group(1)
    print(f'  kept {fam} {weight} {style}, {len(data) // 1024} KB')
    out.append(block)

open('fonts.css', 'w').write('\n'.join(out))
print(f'fonts.css written, {os.path.getsize("fonts.css") // 1024} KB')
