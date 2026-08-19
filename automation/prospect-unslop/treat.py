#!/usr/bin/env python3
"""Editorial print treatment for unslop collages.

Turns a photographic collage into an Align-style grain print: duotone mapped
to the site's tokens, color blocks, topographic waves, halftone, and heavy
film grain. No typeset text. No logos.

Usage:
  python3 treat.py --in collage.webp --out collage.webp --tokens '#C8102E,#1A0A0A,#3D1214,#F6EDE4,#E8A598' --seed slug-1
  python3 treat.py --all --batch <batch-dir>
  python3 treat.py --site <site-dir> --brief <brief.json>
"""
from __future__ import annotations

import argparse
import hashlib
import json
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

PRINT_PASS = "v1"


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = (value or "#111111").lstrip("#")
    if len(value) == 3:
        value = "".join(ch * 2 for ch in value)
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def parse_tokens(raw: str) -> dict[str, tuple[int, int, int]]:
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    while len(parts) < 5:
        parts.append(parts[-1] if parts else "#111111")
    keys = ("accent", "ink", "deep", "paper", "accent2")
    return {k: hex_to_rgb(parts[i]) for i, k in enumerate(keys)}


def tokens_from_colors(
    accent: str,
    ink: str,
    deep: str,
    paper: str,
    accent2: str | None = None,
) -> dict[str, tuple[int, int, int]]:
    return parse_tokens(",".join([accent, ink, deep, paper, accent2 or accent]))


def tokens_from_brief(brief: dict) -> dict[str, tuple[int, int, int]]:
    t = brief.get("tokens") or {}
    return tokens_from_colors(
        t.get("accent") or "#C45C26",
        t.get("ink") or "#1A0A0A",
        t.get("deep") or "#14181C",
        t.get("paper") or "#F4EFE6",
        t.get("accent2") or t.get("accent") or "#C45C26",
    )


def rng_from_seed(seed: str) -> np.random.Generator:
    digest = hashlib.sha256(seed.encode("utf-8")).digest()
    state = int.from_bytes(digest[:8], "little")
    return np.random.default_rng(state)


def duotone(arr: np.ndarray, tokens: dict) -> np.ndarray:
    """Map luminance onto the site palette, then keep the scene readable."""
    lum = (0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]) / 255.0
    deep = np.array(tokens["deep"], dtype=np.float32)
    ink = np.array(tokens["ink"], dtype=np.float32)
    accent = np.array(tokens["accent"], dtype=np.float32)
    paper = np.array(tokens["paper"], dtype=np.float32)
    mapped = np.empty_like(arr, dtype=np.float32)
    t0, t1, t2 = 0.22, 0.48, 0.78
    m0 = lum <= t0
    m1 = (lum > t0) & (lum <= t1)
    m2 = (lum > t1) & (lum <= t2)
    m3 = lum > t2
    mapped[m0] = deep + ((lum[m0] / t0)[:, None] * (ink - deep))
    mapped[m1] = ink + (((lum[m1] - t0) / (t1 - t0))[:, None] * (accent - ink))
    mapped[m2] = accent + (((lum[m2] - t1) / (t2 - t1))[:, None] * (paper - accent))
    mapped[m3] = paper
    mixed = arr.astype(np.float32) * 0.46 + mapped * 0.54
    return np.clip(mixed, 0, 255)


def color_blocks(h: int, w: int, tokens: dict, rng: np.random.Generator) -> np.ndarray:
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    accent = tokens["accent"] + (132,)
    deep = tokens["deep"] + (158,)
    paper = tokens["paper"] + (78,)
    accent2 = tokens["accent2"] + (96,)
    layouts = [
        [(0, 0, int(w * 0.22), h, accent), (int(w * 0.62), 0, w, int(h * 0.28), deep), (0, int(h * 0.78), w, h, paper)],
        [(int(w * 0.74), 0, w, h, accent), (0, 0, int(w * 0.38), int(h * 0.22), deep), (int(w * 0.18), int(h * 0.72), w, h, paper)],
        [(0, int(h * 0.08), int(w * 0.18), int(h * 0.72), accent2), (int(w * 0.55), int(h * 0.62), w, h, accent), (0, 0, w, int(h * 0.12), deep)],
        [(int(w * 0.08), 0, int(w * 0.28), h, accent), (0, int(h * 0.68), int(w * 0.7), h, deep), (int(w * 0.7), 0, w, int(h * 0.34), paper)],
        [(0, int(h * 0.55), w, h, deep), (int(w * 0.78), int(h * 0.12), w, int(h * 0.55), accent), (0, 0, int(w * 0.16), h, accent2)],
    ]
    pick = layouts[int(rng.integers(0, len(layouts)))]
    for x0, y0, x1, y1, color in pick:
        draw.rectangle([x0, y0, x1, y1], fill=color)
    ox = int(rng.integers(int(w * 0.3), int(w * 0.7)))
    draw.polygon(
        [
            (ox, int(h * 0.18)),
            (ox + int(w * 0.22), int(h * 0.12)),
            (ox + int(w * 0.08), int(h * 0.48)),
            (ox - int(w * 0.12), int(h * 0.52)),
        ],
        fill=tokens["accent2"] + (86,),
    )
    return np.array(layer, dtype=np.float32)


def topo_waves(h: int, w: int, tokens: dict, rng: np.random.Generator) -> np.ndarray:
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    color = tokens["paper"] + (62,)
    amp = float(rng.integers(22, 48))
    freq = float(rng.uniform(0.007, 0.015))
    phase = float(rng.uniform(0, 6.28))
    step = int(rng.integers(14, 24))
    for y in range(int(h * 0.06), int(h * 0.94), step):
        pts = []
        for x in range(0, w + 8, 8):
            yy = y + amp * np.sin(x * freq + phase + y * 0.01)
            pts.append((x, yy))
        if len(pts) > 1:
            draw.line(pts, fill=color, width=2)
    return np.array(layer, dtype=np.float32)


def halftone(arr: np.ndarray, tokens: dict) -> np.ndarray:
    """Vectorized screen dots. Darker regions get larger, stronger dots."""
    h, w = arr.shape[:2]
    lum = (0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]) / 255.0
    spacing = 11.0
    y = np.arange(h, dtype=np.float32)[:, None]
    x = np.arange(w, dtype=np.float32)[None, :]
    gy = np.minimum(y % spacing, spacing - (y % spacing))
    gx = np.minimum(x % spacing, spacing - (x % spacing))
    dist = np.sqrt(gy * gy + gx * gx)
    radius = (1.0 - lum) * 4.8
    alpha = np.clip((radius - dist) * 72.0, 0.0, 92.0)
    overlay = np.zeros((h, w, 4), dtype=np.float32)
    overlay[..., 0] = tokens["ink"][0]
    overlay[..., 1] = tokens["ink"][1]
    overlay[..., 2] = tokens["ink"][2]
    overlay[..., 3] = alpha
    return overlay


def grain(h: int, w: int, rng: np.random.Generator, strength: float) -> np.ndarray:
    noise = rng.normal(0, strength, size=(h, w, 1)).astype(np.float32)
    return np.repeat(noise, 3, axis=2)


def vignette(h: int, w: int) -> np.ndarray:
    ys, xs = np.ogrid[:h, :w]
    cy, cx = h * 0.48, w * 0.5
    dist = np.sqrt(((ys - cy) / (h * 0.72)) ** 2 + ((xs - cx) / (w * 0.72)) ** 2)
    mask = np.clip(1.0 - np.clip(dist - 0.55, 0, 1) * 0.55, 0.45, 1.0)
    return mask[..., None]


def composite_rgba(base: np.ndarray, overlay: np.ndarray) -> np.ndarray:
    alpha = overlay[..., 3:4] / 255.0
    rgb = overlay[..., :3]
    return base * (1.0 - alpha) + rgb * alpha


def treat_array(arr: np.ndarray, tokens: dict, seed: str) -> np.ndarray:
    rng = rng_from_seed(seed)
    h, w = arr.shape[:2]
    work = duotone(arr, tokens)
    work = composite_rgba(work, color_blocks(h, w, tokens, rng))
    work = composite_rgba(work, topo_waves(h, w, tokens, rng))
    work = composite_rgba(work, halftone(work, tokens))
    work = work + grain(h, w, rng, 36.0)
    work = work * vignette(h, w)
    work = np.clip(work, 0, 255)
    work = np.round(work / 8.0) * 8.0
    work = work + grain(h, w, rng_from_seed(seed + "-fine"), 14.0)
    return np.clip(work, 0, 255).astype(np.uint8)


def local_variance(arr: np.ndarray) -> float:
    lum = 0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]
    return float(lum.std())


def treat_image(src: Path, dest: Path, tokens: dict, seed: str) -> None:
    img = Image.open(src).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    out = treat_array(arr, tokens, seed)
    result = Image.fromarray(out, "RGB")
    result = ImageEnhance.Contrast(result).enhance(1.14)
    result = ImageEnhance.Color(result).enhance(0.9)
    result = result.filter(ImageFilter.UnsharpMask(radius=1.1, percent=55, threshold=4))
    dest.parent.mkdir(parents=True, exist_ok=True)
    if result.size[0] > 960:
        result = result.resize((960, 1200), Image.Resampling.LANCZOS)
    result.save(dest, "WEBP", quality=72, method=6)


def marker_path(site_dir: Path) -> Path:
    return site_dir / "assets" / ".print-pass"


def already_treated(site_dir: Path) -> bool:
    mark = marker_path(site_dir)
    return mark.exists() and mark.read_text(encoding="utf-8").strip() == PRINT_PASS


def treat_site(site_dir: Path, brief: dict | None = None, force: bool = False) -> int:
    site_dir = Path(site_dir)
    if not force and already_treated(site_dir):
        return 0
    if brief is None:
        brief_path = site_dir / "brief.json"
        if not brief_path.exists():
            batch_brief = site_dir.parent.parent / "briefs" / f"{site_dir.name}.json"
            if batch_brief.exists():
                brief_path = batch_brief
            else:
                return 0
        brief = json.loads(brief_path.read_text(encoding="utf-8"))
    tokens = tokens_from_brief(brief)
    slug = brief.get("slug") or site_dir.name
    count = 0
    for i in range(1, 6):
        src = site_dir / "assets" / f"collage-{i}.webp"
        if not src.exists():
            continue
        treat_image(src, src, tokens, f"{slug}-{i}")
        count += 1
    if count:
        marker_path(site_dir).write_text(PRINT_PASS + "\n", encoding="utf-8")
    return count


def _worker(payload: tuple[str, str, bool]) -> tuple[str, int]:
    site_dir, brief_path, force = payload
    brief = json.loads(Path(brief_path).read_text(encoding="utf-8"))
    n = treat_site(Path(site_dir), brief, force=force)
    return Path(site_dir).name, n


def treat_all(batch: Path, workers: int = 4, force: bool = False, only: str = "") -> int:
    batch = Path(batch)
    sites_root = batch / "sites"
    briefs_root = batch / "briefs"
    sites = sorted(p for p in sites_root.iterdir() if p.is_dir() and (p / "index.html").exists())
    if only:
        wanted = {s.strip() for s in only.split(",") if s.strip()}
        sites = [p for p in sites if p.name in wanted]
    jobs = []
    for site in sites:
        brief_path = briefs_root / f"{site.name}.json"
        if brief_path.exists():
            jobs.append((str(site), str(brief_path), force))
    total = 0
    if workers <= 1 or len(jobs) <= 1:
        for i, job in enumerate(jobs, 1):
            slug, n = _worker(job)
            total += n
            print(f"[{i}/{len(jobs)}] {slug} treated {n}", flush=True)
        return total
    with ProcessPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(_worker, job): job[0] for job in jobs}
        done = 0
        for fut in as_completed(futures):
            slug, n = fut.result()
            done += 1
            total += n
            print(f"[{done}/{len(jobs)}] {slug} treated {n}", flush=True)
    return total


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="src")
    parser.add_argument("--out", dest="dest")
    parser.add_argument("--tokens", default="#C45C26,#1A0A0A,#14181C,#F4EFE6,#C45C26")
    parser.add_argument("--seed", default="unslop")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--batch", default="")
    parser.add_argument("--site", default="")
    parser.add_argument("--brief", default="")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", default="")
    args = parser.parse_args()
    if args.all:
        batch = Path(args.batch)
        if not batch.exists():
            raise SystemExit(f"missing batch {batch}")
        print(f"treated {treat_all(batch, workers=args.workers, force=args.force, only=args.only)} collages")
        return 0
    if args.site:
        brief = None
        if args.brief:
            brief = json.loads(Path(args.brief).read_text(encoding="utf-8"))
        n = treat_site(Path(args.site), brief, force=args.force)
        print(f"treated {n}")
        return 0
    if not args.src or not args.dest:
        raise SystemExit("need --in/--out or --all or --site")
    treat_image(Path(args.src), Path(args.dest), parse_tokens(args.tokens), args.seed)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
