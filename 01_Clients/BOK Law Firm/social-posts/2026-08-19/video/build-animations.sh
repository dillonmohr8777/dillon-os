#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$(dirname "$0")")" && pwd)"
python3 - "$ROOT" <<'PY'
from pathlib import Path
import shutil
import subprocess
import sys
from PIL import Image

root = Path(sys.argv[1])
video = root / "video"
frames_root = video / "frames"
frames_root.mkdir(parents=True, exist_ok=True)

jobs = [
    ("wednesday-wisdom", "BOK-Wednesday-Wisdom.mp4", root / "heroes" / "wednesday-wisdom.jpg"),
    ("family-friday", "BOK-Family-Friday.mp4", root / "heroes" / "family-friday.jpg"),
    ("saturday-solutions", "BOK-Saturday-Solutions.mp4", root / "heroes" / "saturday-solutions.jpg"),
]

fps = 30
seconds = 8
nframes = fps * seconds
hero_h = 478  # paste only above the teal wave so chrome stays locked

for slug, outfile, hero_path in jobs:
    still = Image.open(root / "final" / f"{slug}.png").convert("RGB")
    hero = Image.open(hero_path).convert("RGB")
    # Match the CSS object-fit: cover for 1080x538, then take the top 478px.
    target_w, target_h = 1080, 538
    scale = max(target_w / hero.width, target_h / hero.height)
    resized = hero.resize((round(hero.width * scale), round(hero.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    pos = {"wednesday-wisdom": 0.32, "family-friday": 0.28, "saturday-solutions": 0.38}[slug]
    top = int((resized.height - target_h) * pos)
    hero_cover = resized.crop((left, top, left + target_w, top + target_h))

    out_dir = frames_root / slug
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    for i in range(nframes):
        t = i / (nframes - 1)
        zoom = 1.0 + 0.085 * t
        crop_w = target_w / zoom
        crop_h = hero_h / zoom
        x = (target_w - crop_w) * (0.35 + 0.30 * t)
        y = (target_h - crop_h) * (0.25 + 0.20 * t)
        window = hero_cover.crop((int(x), int(y), int(x + crop_w), int(y + crop_h))).resize((1080, hero_h), Image.Resampling.LANCZOS)
        frame = still.copy()
        frame.paste(window, (0, 0))
        frame.save(out_dir / f"f{i:04d}.jpg", quality=92, optimize=True)
        if i % 60 == 0:
            print(slug, i)

    dest = video / outfile
    subprocess.check_call([
        "ffmpeg", "-y", "-framerate", str(fps),
        "-i", str(out_dir / "f%04d.jpg"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        "-movflags", "+faststart", str(dest),
    ], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    print("wrote", dest, dest.stat().st_size)
    shutil.rmtree(out_dir)

print("animations ok")
PY
