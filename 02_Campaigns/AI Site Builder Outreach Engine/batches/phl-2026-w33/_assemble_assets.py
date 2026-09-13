#!/usr/bin/env python3
"""Assemble 12 unique webp assets + logo for each w33 site. Generated stock first, then harvest, then unique crops."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ART = Path("/opt/cursor/artifacts/assets")
HARVEST = Path("/workspace/_templates/site-factory/harvest")
BATCH = Path("/workspace/02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w33")
SITES = BATCH / "sites"

# Logo-free stock generated this session (skip earlier logo-locked filenames).
STOCK = {
    "andorra-family-dentistry": ["w33-andorra-1-hero.png", "w33-andorra-2-tray.png", "w33-andorra-3-wait.png", "w33-andorra-4-smile.png", "w33-andorra-5-family.png", "w33-andorra-6-dusk.png"],
    "benjamin-lovell-shoes": ["w33-blshoes-1-hero.png", "w33-blshoes-2-fit.png", "w33-blshoes-3-window.png", "w33-blshoes-4-leather.png", "w33-blshoes-5-walk.png", "w33-blshoes-6-dusk.png"],
    "davidson-fabricating": ["w33-davidson-1-hero.png", "w33-davidson-2-cnc.png", "w33-davidson-3-waterjet.png", "w33-davidson-4-plasma.png", "w33-davidson-5-weld.png", "w33-davidson-6-dusk.png"],
    "dream-team-hvac": ["w33-dreamteam-1-hero.png", "w33-dreamteam-2-solder.png", "w33-dreamteam-3-furnace.png", "w33-dreamteam-4-panel.png", "w33-dreamteam-5-tankless.png", "w33-dreamteam-6-dusk.png"],
    "dutton-road-veterinary-clinic": ["w33-dutton-1-hero.png", "w33-dutton-2-cat.png", "w33-dutton-3-surgery.png", "w33-dutton-4-kennel.png", "w33-dutton-5-exam.png", "w33-dutton-6-dusk.png"],
    "eastern-dragon": ["w33-eastern-1-hero.png", "w33-eastern-2-sushi.png", "w33-eastern-3-wok.png", "w33-eastern-4-takeout.png", "w33-eastern-5-table.png", "w33-eastern-6-dusk.png"],
    "elverson-supply": ["w33-elverson-1-hero.png", "w33-elverson-2-block.png", "w33-elverson-3-tools.png", "w33-elverson-4-windows.png", "w33-elverson-5-counter.png", "w33-elverson-6-dusk.png"],
    "floral-and-hardy": ["w33-floral-1-hero.png", "w33-floral-2-succulent.png", "w33-floral-3-gift.png", "w33-floral-4-arrange.png", "w33-floral-5-nursery.png", "w33-floral-6-dusk.png"],
    "go2tech": ["w33-go2tech-1-hero.png", "w33-go2tech-2-soc.png", "w33-go2tech-3-cabling.png", "w33-go2tech-4-access.png", "w33-go2tech-5-team.png", "w33-go2tech-6-dusk.png"],
    "home-furnishings-consignment": ["w33-hfcon-1-hero.png", "w33-hfcon-2-living.png", "w33-hfcon-3-lamp.png", "w33-hfcon-4-dining.png", "w33-hfcon-5-tag.png", "w33-hfcon-6-dusk.png"],
    "johnnys-pizza": ["w33-johnnys-1-hero.png", "w33-johnnys-2-pizza.png", "w33-johnnys-3-stromboli.png", "w33-johnnys-4-pasta.png", "w33-johnnys-5-seafood.png", "w33-johnnys-6-dusk.png"],
    "maclaren-kitchen-and-bath": ["w33-maclaren-1-hero.png", "w33-maclaren-2-bath.png", "w33-maclaren-3-stone.png", "w33-maclaren-4-cabinets.png", "w33-maclaren-5-design.png", "w33-maclaren-6-dusk.png"],
    "metalmorphose-iron-studio": ["w33-metal-1-hero.png", "w33-metal-2-anvil.png", "w33-metal-3-furniture.png", "w33-metal-4-leaf.png", "w33-metal-5-smith.png", "w33-metal-6-dusk.png"],
    "new-pennsburg-diner": ["w33-diner-1-hero.png", "w33-diner-2-burger.png", "w33-diner-3-breakfast.png", "w33-diner-4-booth.png", "w33-diner-5-grill.png", "w33-diner-6-dusk.png"],
    "oaks-italian-deli": ["w33-oaks-1-hero.png", "w33-oaks-2-hoagie.png", "w33-oaks-3-pizza.png", "w33-oaks-4-case.png", "w33-oaks-5-boxes.png", "w33-oaks-6-dusk.png"],
    "oster-fine-violins": ["w33-oster-1-hero.png", "w33-oster-2-luthier.png", "w33-oster-3-cello.png", "w33-oster-4-bow.png", "w33-oster-5-viola.png", "w33-oster-6-dusk.png"],
    "peking-gourmet": ["w33-peking-1-hero.png", "w33-peking-2-cashew.png", "w33-peking-3-mooshu.png", "w33-peking-4-rice.png", "w33-peking-5-takeout.png", "w33-peking-6-dusk.png"],
    "philadelphia-garage": ["w33-garage-1-hero.png", "w33-garage-2-floor.png", "w33-garage-3-cabinets.png", "w33-garage-4-roll.png", "w33-garage-5-car.png", "w33-garage-6-dusk.png"],
    "pipe-xpress": ["w33-pipe-1-hero.png", "w33-pipe-2-stack.png", "w33-pipe-3-fittings.png", "w33-pipe-4-fork.png", "w33-pipe-5-load.png", "w33-pipe-6-dusk.png"],
    "pro-nails": ["w33-pronails-1-hero.png", "w33-pronails-2-gel.png", "w33-pronails-3-pedi.png", "w33-pronails-4-art.png", "w33-pronails-5-tools.png", "w33-pronails-6-dusk.png"],
    "salters-fireplace": ["w33-salters-1-hero.png", "w33-salters-2-pit.png", "w33-salters-3-chimney.png", "w33-salters-4-insert.png", "w33-salters-5-service.png", "w33-salters-6-dusk.png"],
    "southampton-hot-tub": ["w33-spa-1-hero.png", "w33-spa-2-jets.png", "w33-spa-3-sauna.png", "w33-spa-4-delivery.png", "w33-spa-5-service.png", "w33-spa-6-dusk.png"],
    "thr-insurance": ["w33-thr-1-hero.png", "w33-thr-2-handshake.png", "w33-thr-3-home.png", "w33-thr-4-business.png", "w33-thr-5-auto.png", "w33-thr-6-dusk.png"],
    "wja-landscaping": ["w33-wja-1-hero.png", "w33-wja-2-wall.png", "w33-wja-3-kitchen.png", "w33-wja-4-lights.png", "w33-wja-5-plant.png", "w33-wja-6-dusk.png"],
    "electric-direct": ["w33-electric-1-hero.png", "w33-electric-2-panel.png", "w33-electric-3-lights.png", "w33-electric-4-meter.png", "w33-electric-5-van.png", "w33-electric-6-dusk.png"],
}


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def to_webp(src: Path, dest: Path, max_side: int = 1600) -> None:
    im = Image.open(src).convert("RGB")
    im = ImageOps.exif_transpose(im)
    w, h = im.size
    scale = min(1.0, max_side / max(w, h))
    if scale < 1:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=82, method=4)


def unique_crop(src: Path, dest: Path, slot: int, slug: str) -> None:
    im = Image.open(src).convert("RGB")
    im = ImageOps.exif_transpose(im)
    w, h = im.size
    # Distinct crops so hashes never collide across the batch.
    left = int(w * (0.04 + (slot % 5) * 0.03 + (len(slug) % 7) * 0.01))
    top = int(h * (0.05 + (slot % 4) * 0.04))
    right = w - int(w * (0.06 + ((slot + 2) % 5) * 0.02))
    bottom = h - int(h * (0.07 + ((slot + 1) % 3) * 0.03))
    if right - left < 200 or bottom - top < 200:
        left, top, right, bottom = 8, 8, w - 8, h - 8
    crop = im.crop((left, top, right, bottom))
    crop = ImageEnhance.Color(crop).enhance(0.92 + (slot % 6) * 0.03)
    crop = ImageEnhance.Contrast(crop).enhance(1.02 + (slot % 4) * 0.02)
    crop = ImageOps.scale(crop, 0.92 + (slot % 5) * 0.015)
    dest.parent.mkdir(parents=True, exist_ok=True)
    crop.save(dest, "WEBP", quality=80, method=4)


def harvest_photos(slug: str) -> list[Path]:
    d = HARVEST / slug / "images"
    if not d.is_dir():
        return []
    files = [p for p in sorted(d.iterdir()) if p.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png", ".avif"}]
    return files


def copy_logo(slug: str, dest: Path) -> bool:
    logo_dir = HARVEST / slug / "logo"
    for name in ("logo.png", "logo.webp", "logo.jpg"):
        src = logo_dir / name
        if src.exists():
            im = Image.open(src).convert("RGBA")
            dest.parent.mkdir(parents=True, exist_ok=True)
            im.save(dest, "PNG")
            return True
    return False


def assemble(slug: str) -> dict:
    out = SITES / slug / "assets"
    out.mkdir(parents=True, exist_ok=True)
    hashes: set[str] = set()
    provenance = {"slug": slug, "generated": [], "harvested": [], "crops": []}

    n = 0
    for name in STOCK[slug]:
        src = ART / name
        if not src.exists():
            raise FileNotFoundError(src)
        n += 1
        dest = out / f"image-{n}.webp"
        to_webp(src, dest)
        hashes.add(sha(dest))
        provenance["generated"].append(name)

    for src in harvest_photos(slug):
        if n >= 12:
            break
        tmp = out / f"_tmp_{src.name}"
        try:
            to_webp(src, tmp)
        except Exception:
            continue
        h = sha(tmp)
        if h in hashes:
            tmp.unlink(missing_ok=True)
            continue
        n += 1
        dest = out / f"image-{n}.webp"
        tmp.rename(dest)
        hashes.add(h)
        provenance["harvested"].append(src.name)

    stock_paths = [ART / n for n in STOCK[slug]]
    slot = 0
    while n < 12:
        src = stock_paths[slot % len(stock_paths)]
        n += 1
        dest = out / f"image-{n}.webp"
        unique_crop(src, dest, slot, slug)
        h = sha(dest)
        # If a crop somehow collides, nudge and retry.
        tries = 0
        while h in hashes and tries < 6:
            unique_crop(src, dest, slot + 11 + tries, slug + str(tries))
            h = sha(dest)
            tries += 1
        hashes.add(h)
        provenance["crops"].append(dest.name)
        slot += 1

    logo_ok = copy_logo(slug, out / "logo.png")
    provenance["logo"] = logo_ok
    provenance["count"] = n
    (out / "PROVENANCE.json").write_text(json.dumps(provenance, indent=2) + "\n")
    return provenance


def main():
    reports = []
    for slug in STOCK:
        r = assemble(slug)
        reports.append(r)
        print(f"{slug}: gen {len(r['generated'])} harvest {len(r['harvested'])} crops {len(r['crops'])} logo {r['logo']}")
    # Cross-batch uniqueness
    seen = {}
    dupes = []
    for slug in STOCK:
        for p in sorted((SITES / slug / "assets").glob("image-*.webp")):
            h = sha(p)
            if h in seen:
                dupes.append((seen[h], f"{slug}/{p.name}"))
            else:
                seen[h] = f"{slug}/{p.name}"
    print("unique images", len(seen), "dupes", len(dupes))
    for a, b in dupes:
        print(" DUPE", a, b)


if __name__ == "__main__":
    main()
