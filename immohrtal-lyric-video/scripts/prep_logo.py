"""Knock out the near-white background of the logo JPEG -> public/logo.png

The logo is dark chrome on a white background, so alpha is derived from
luminance: pure white -> transparent, dark pixels -> opaque, with a smooth
ramp in between to keep soft shadow edges from going crunchy.
"""
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "public", "logo-original.jpeg")
OUT = os.path.join(HERE, "..", "public", "logo.png")

img = Image.open(SRC).convert("RGB")
px = img.load()
w, h = img.size

out = Image.new("RGBA", (w, h))
opx = out.load()

# Luminance above HI is background, below LO is fully part of the mark.
HI, LO = 235, 190
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        if lum >= HI:
            a = 0
        elif lum <= LO:
            a = 255
        else:
            a = int(255 * (HI - lum) / (HI - LO))
        opx[x, y] = (r, g, b, a)

# Trim transparent border so the logo scales predictably.
bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)

out.save(OUT)
print(f"Saved {OUT} size={out.size}")
