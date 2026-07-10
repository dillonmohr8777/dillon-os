"""Background-remove and crop client/brand logos into assets/logos/."""
from PIL import Image, ImageFilter
from collections import deque
import os

RAW, OUT = "assets/raw", "assets/logos"
os.makedirs(OUT, exist_ok=True)

def flood_white_to_alpha(im, tol=18):
    """Flood-fill from all edges: contiguous near-white becomes transparent."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    def near_white(p):
        return p[0] >= 255 - tol and p[1] >= 255 - tol and p[2] >= 255 - tol
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near_white(px[x, y]): q.append((x, y)); seen[y * w + x] = 1
    for y in range(h):
        for x in (0, w - 1):
            if near_white(px[x, y]) and not seen[y * w + x]: q.append((x, y)); seen[y * w + x] = 1
    while q:
        x, y = q.popleft()
        px[x, y] = (255, 255, 255, 0)
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and near_white(px[nx, ny]):
                seen[ny * w + nx] = 1
                q.append((nx, ny))
    # soften the cut edge: 1px feather on alpha
    a = im.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    im.putalpha(a)
    return im

def autocrop(im, pad=8):
    bbox = im.getchannel("A").getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l, t = max(0, l - pad), max(0, t - pad)
    r, b = min(im.width, r + pad), min(im.height, b + pad)
    return im.crop((l, t, r, b))

jobs = [
    # (src, dst, needs_white_removal)
    ("awp.png", "awp.png", False),
    ("rwlv.png", "rwlv.png", False),
    ("beumer.png", "beumer.png", False),
    ("arrow.png", "arrow.png", True),
    ("driscolls.png", "driscolls.png", True),
    ("align-logo-color.png", "align-color.png", False),
    ("align-logo-white.png", "align-white.png", False),
    ("smartcare-logo-transparent.png", "smartcare.png", False),
]
for src, dst, strip in jobs:
    im = Image.open(f"{RAW}/{src}").convert("RGBA")
    if strip:
        im = flood_white_to_alpha(im)
    im = autocrop(im)
    im.save(f"{OUT}/{dst}")
    print(dst, im.size)

# Contact sheet: each logo on navy AND on a white rounded card
NAVY = (10, 22, 40, 255)
tiles = [j[1] for j in jobs]
TW, TH = 460, 240
sheet = Image.new("RGBA", (TW * 4, TH * 4), NAVY)
def rounded_card(w, h, r=18):
    from PIL import ImageDraw
    c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=(255, 255, 255, 255))
    return c
for i, name in enumerate(tiles):
    logo = Image.open(f"{OUT}/{name}")
    # fit into 400x160
    s = min(400 / logo.width, 160 / logo.height)
    fit = logo.resize((max(1, int(logo.width * s)), max(1, int(logo.height * s))), Image.LANCZOS)
    # row A: on navy
    x0, y0 = (i % 4) * TW, (i // 4) * TH * 2
    sheet.alpha_composite(fit, (x0 + (TW - fit.width) // 2, y0 + (TH - fit.height) // 2))
    # row B: on white card
    card = rounded_card(420, 200)
    card.alpha_composite(fit, ((420 - fit.width) // 2, (200 - fit.height) // 2))
    sheet.alpha_composite(card, (x0 + (TW - 420) // 2, y0 + TH + (TH - 200) // 2))
sheet.convert("RGB").save("assets/contact-sheet.png")
print("contact sheet written")
