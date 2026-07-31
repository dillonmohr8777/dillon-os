#!/usr/bin/env python3
"""Render 30 Animated Ineptocracy social clips from approved stills.

Output: out/anim-01.mp4 … anim-30.mp4 (1080x1920 H.264, ~6s, muted)
Also writes posters/*.jpg and ANIMATION-MANIFEST.md

Continuity: Darnell glasses lock from references/darnell-javon-approved.jpg
"""
from __future__ import annotations

import math
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
GEN = ROOT / "generated"
REF = ROOT / "references"
OUT = Path(__file__).resolve().parent / "out"
POSTERS = Path(__file__).resolve().parent / "posters"
FPS = 24
DUR = 5.0
W, H = 720, 1280  # story/reel friendly; keeps pack git-manageable
FRAMES = int(FPS * DUR)

INK = (3, 3, 3)
PAPER = (247, 244, 236)
SIGNAL = (240, 90, 40)
RED = (211, 34, 24)
GRAY = (126, 122, 112)


def font(size: int, mono: bool = False) -> ImageFont.FreeTypeFont:
    candidates = (
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
            "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansMono-Bold.ttf",
        ]
        if mono
        else [
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def cover_crop(im: Image.Image, tw: int, th: int, cx: float = 0.5, cy: float = 0.5) -> Image.Image:
    """Scale to cover and crop around (cx, cy) normalized centers."""
    scale = max(tw / im.width, th / im.height)
    nw, nh = int(im.width * scale + 0.5), int(im.height * scale + 0.5)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, min(nw - tw, int(cx * nw - tw / 2)))
    top = max(0, min(nh - th, int(cy * nh - th / 2)))
    return im.crop((left, top, left + tw, top + th))


def ken_burns(
    im: Image.Image,
    t: float,
    start_zoom: float = 1.08,
    end_zoom: float = 1.22,
    start_c: tuple[float, float] = (0.48, 0.45),
    end_c: tuple[float, float] = (0.52, 0.55),
) -> Image.Image:
    u = 0.5 - 0.5 * math.cos(math.pi * min(1.0, max(0.0, t)))
    zoom = start_zoom + (end_zoom - start_zoom) * u
    cx = start_c[0] + (end_c[0] - start_c[0]) * u
    cy = start_c[1] + (end_c[1] - start_c[1]) * u
    # Crop a zoomed window then resize to frame
    sw, sh = int(W / zoom), int(H / zoom)
    base = cover_crop(im, max(sw, W), max(sh, H), cx, cy)
    # From cover base take center crop at zoom size
    left = max(0, (base.width - sw) // 2)
    top = max(0, (base.height - sh) // 2)
    crop = base.crop((left, top, left + sw, top + sh))
    return crop.resize((W, H), Image.Resampling.LANCZOS)


def scanlines(im: Image.Image, strength: int = 28) -> Image.Image:
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(0, im.height, 3):
        d.line([(0, y), (im.width, y)], fill=(0, 0, 0, strength))
    # faint CRT noise band
    band_y = int((im.height * 0.15 + (im.height * 0.7) * ((hash(im.tobytes()[:64]) % 1000) / 1000)))
    d.rectangle([0, band_y, im.width, band_y + 4], fill=(247, 244, 236, 18))
    return Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")


def vignette(im: Image.Image, amount: float = 0.45) -> Image.Image:
    # soft edge darkening without invalid ellipses
    mask = Image.new("L", (512, 512), 0)
    md = ImageDraw.Draw(mask)
    for i in range(64):
        a = int(255 * (1 - (i / 63) ** 1.35) * amount)
        inset = int(8 + i * 3.5)
        md.ellipse([inset, inset, 511 - inset, 511 - inset], fill=max(0, 255 - a))
    mask = mask.resize((W, H), Image.Resampling.BILINEAR)
    dark = Image.new("RGB", (W, H), INK)
    return Image.composite(im, dark, mask)


def classification_bar(draw: ImageDraw.ImageDraw, text_left: str, text_right: str) -> None:
    draw.rectangle([0, 0, W, 56], fill=(11, 10, 9))
    draw.rectangle([0, 56, W, 58], fill=(207, 202, 189))
    draw.text((28, 18), text_left, font=font(16, mono=True), fill=GRAY)
    bbox = draw.textbbox((0, 0), text_right, font=font(16, mono=True))
    draw.text((W - 28 - (bbox[2] - bbox[0]), 18), text_right, font=font(16, mono=True), fill=SIGNAL)


def stamp(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], angle_hint: int = -12, color=RED) -> None:
    # simple non-rotated stamp box (rotation is expensive); angled look via offset bars
    x, y = xy
    f = font(26, mono=True)
    pad = 10
    bbox = draw.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.rectangle([x, y, x + tw + pad * 2, y + th + pad * 2], outline=color, width=3)
    draw.text((x + pad, y + pad - 2), text, font=f, fill=color)
    draw.line([(x - 6, y + th + pad * 2 + 4), (x + tw + pad * 2 + 8, y - 4)], fill=color, width=2)


def lower_third(draw: ImageDraw.ImageDraw, kicker: str, line: str) -> None:
    draw.rectangle([0, H - 260, W, H], fill=(3, 3, 3))
    draw.rectangle([28, H - 230, 32, H - 90], fill=SIGNAL)
    draw.text((48, H - 224), kicker.upper(), font=font(18, mono=True), fill=SIGNAL)
    f = font(32)
    words = line.split()
    rows, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textbbox((0, 0), test, font=f)[2] > W - 90:
            rows.append(cur)
            cur = w
        else:
            cur = test
    if cur:
        rows.append(cur)
    y = H - 180
    for row in rows[:3]:
        draw.text((48, y), row, font=f, fill=PAPER)
        y += 42


def fade_black(im: Image.Image, amount: float) -> Image.Image:
    amount = max(0.0, min(1.0, amount))
    if amount <= 0:
        return im
    black = Image.new("RGB", im.size, INK)
    return Image.blend(im, black, amount)


def typewriter(text: str, t: float, total: float = 0.7) -> str:
    n = int(len(text) * min(1.0, max(0.0, t / total)))
    return text[:n]


@dataclass
class Clip:
    id: str
    title: str
    source: str
    style: str
    kicker: str
    line: str
    stamp_text: str = ""
    day: str = ""


CLIPS: list[Clip] = [
    Clip("01", "Case opens", "01-case-017-file-open.jpg", "dossier_reveal", "CASE 017", "The file was never supposed to open cleanly.", "FILE OPEN", "01"),
    Clip("02", "Darnell Harvard", "02-darnell-harvard-surveillance.jpg", "portrait_push", "BI-01", "Intelligence made him visible.", "LIVE", "02"),
    Clip("03", "Exactly as intended", "03-quote-exactly-as-intended.jpg", "quote_type", "DIAGNOSIS", "Parts of it work exactly as intended.", "", "03"),
    Clip("04", "Javon field", "04-javon-field-after-rain.jpg", "portrait_push", "QB-ROS", "A mind nobody reduces to muscle.", "WITNESS", "04"),
    Clip("05", "Campus dusk", "05-darnell-javon-campus-dusk.jpg", "duo_parallax", "FRIENDSHIP", "Propaganda loves isolation.", "EVIDENCE", "05"),
    Clip("06", "Alec Langley", "06-alec-langley-corridor.jpg", "portrait_push", "D-09", "Conscience arriving later than it should.", "UNSEALED", "06"),
    Clip("07", "Garnier dossier CTA", "07-cta-garnier-dossier.jpg", "cta_pulse", "READER FILE", "Open the Garnier Dossier.", "ACCESS", "07"),
    Clip("08", "Freedom invoice", "08-freedom-invoice-past-due.jpg", "invoice_scroll", "INVOICE", "Freedom is not free. Processing fee applies.", "PAST DUE", "08"),
    Clip("09", "Inventory desk", "09-darnell-inventory-desk.jpg", "portrait_push", "BI-01", "Excellence makes him easier to locate.", "INVENTORY", "09"),
    Clip("10", "Pressure map", "10-world-pressure-map-board.jpg", "map_sweep", "WORLD FILE", "Every stop makes Darnell pay a little more.", "OBEY", "10"),
    Clip("11", "Diner joke dies", "11-javon-diner-joke-dies.jpg", "portrait_push", "QB-ROS", "When the joke stops, consequence arrives.", "MERCY", "11"),
    Clip("12", "Donor channel", "12-donor-channel-glass-reflection.jpg", "glitch_cut", "DONOR", "Just get it done, and the money is yours.", "PRIVATE", "13"),
    Clip("13", "Access granted", "13-access-granted-envelope.jpg", "cta_pulse", "TRANSMISSION", "Nine names public. Rest sealed until the book.", "GRANTED", "14"),
    Clip("14", "Morning after", "14-trio-morning-after-walk.jpg", "duo_parallax", "THREE FILES", "One very bad year.", "017", "15"),
    Clip("15", "Draft vs Harvard", "15-draft-vs-acceptance-desk.jpg", "split_wipe", "TWO TESTS", "America had another test waiting.", "DRAFT", "16"),
    Clip("16", "Alec rain", "16-alec-rain-window-remorse.jpg", "portrait_push", "D-09", "Can he outlive the damage he carried?", "REMORSE", "17"),
    Clip("17", "Lobby lie", "17-javon-lobby-smells-the-lie.jpg", "portrait_push", "QB-ROS", "He smells the lie before it finishes dressing.", "LIE", "19"),
    Clip("18", "Obedient again", "18-make-america-obedient-poster.jpg", "propaganda_shake", "FILING", "Slogan as diagnosis.", "OBEY", "20"),
    Clip("19", "Cast triptych", "19-cast-files-triptych.jpg", "triptych_scan", "CAST FILES", "BI-01 · QB-ROS · D-09", "ROSTER", "22"),
    Clip("20", "Control room", "20-trio-control-room.jpg", "crt_roll", "OPS", "Rooms smaller than the consequences.", "MONITOR", "24"),
    # Extra 10 motion-led pieces from continuity + graphics
    Clip("21", "Approved continuity", "darnell-javon-approved.jpg", "duo_parallax", "CONTINUITY", "Darnell keeps the glasses. Javon keeps the watch.", "LOCKED", "01"),
    Clip("22", "Glasses lock", "darnell-approved.jpg", "portrait_push", "BI-01", "Round glasses. Slim scholar frame. Speaking intensity.", "GLASSES", "02"),
    Clip("23", "Protective stare", "javon-approved.jpg", "portrait_push", "QB-ROS", "Tall. Broad. Protective. Scanning.", "WATCH", "04"),
    Clip("24", "Boston protest plate", "boston-protest-darnell-javon.jpg", "protest_zoom", "BOSTON", "Public speaker energy. Protective presence.", "APPROVED", "05"),
    Clip("25", "Redaction wipe", "01-case-017-file-open.jpg", "redaction_wipe", "REDACTED", "Names missing where the money should be.", "BLACK BAR", "01"),
    Clip("26", "Signal stamp loop", "03-quote-exactly-as-intended.jpg", "stamp_slam", "CASE 017", "Not a punchline. A filing instruction.", "STAMP", "03"),
    Clip("27", "Dossier pulse CTA", "07-cta-garnier-dossier.jpg", "cta_pulse", "CTA", "No spam. No filler. Dispatches only.", "OPEN", "07"),
    Clip("28", "Invoice overdue", "08-freedom-invoice-past-due.jpg", "invoice_scroll", "PAST DUE", "Status past due. Invoice finds a name.", "FEE", "08"),
    Clip("29", "Triptych scan II", "19-cast-files-triptych.jpg", "triptych_scan", "EYES ONLY", "Every character gets a file, not a biography.", "INDEX", "22"),
    Clip("30", "Month close", "14-trio-morning-after-walk.jpg", "endcard", "GALLEY", "36 chapters. Four continents. One very bad year.", "PRE-RELEASE", "30"),
]


def resolve_source(name: str) -> Path:
    for base in (GEN, REF):
        p = base / name
        if p.exists():
            return p
    raise FileNotFoundError(name)


def render_frame(clip: Clip, src: Image.Image, i: int) -> Image.Image:
    t = i / max(1, FRAMES - 1)
    style = clip.style

    if style in {"portrait_push", "duo_parallax", "protest_zoom", "map_sweep", "crt_roll"}:
        z0, z1 = (1.06, 1.20) if style != "protest_zoom" else (1.04, 1.28)
        c0, c1 = ((0.46, 0.42), (0.54, 0.58)) if style == "duo_parallax" else ((0.5, 0.45), (0.5, 0.52))
        frame = ken_burns(src, t, z0, z1, c0, c1)
    elif style == "glitch_cut":
        frame = ken_burns(src, t, 1.1, 1.25, (0.45, 0.5), (0.55, 0.5))
        if 0.35 < t < 0.42 or 0.62 < t < 0.68:
            r, g, b = frame.split()
            frame = Image.merge("RGB", (r.point(lambda x: min(255, x + 40)), g, b.point(lambda x: max(0, x - 20))))
            shift = 18 if t < 0.5 else -22
            rolled = Image.new("RGB", frame.size)
            rolled.paste(frame, (shift, 0))
            if shift > 0:
                rolled.paste(frame.crop((W - shift, 0, W, H)), (0, 0))
            else:
                rolled.paste(frame.crop((0, 0, -shift, H)), (W + shift, 0))
            frame = rolled
    elif style == "split_wipe":
        frame = ken_burns(src, t, 1.05, 1.15)
        wipe = Image.new("RGB", (W, H), INK)
        reveal = int(W * min(1.0, t * 1.2))
        wipe.paste(frame.crop((0, 0, reveal, H)), (0, 0))
        frame = wipe
    elif style == "invoice_scroll":
        # vertical crawl over tall letterboxed plate
        base = cover_crop(src, W, int(H * 1.35), 0.5, 0.5)
        y = int((base.height - H) * t)
        frame = base.crop((0, y, W, y + H))
    elif style == "propaganda_shake":
        frame = ken_burns(src, t, 1.08, 1.18)
        if t > 0.2:
            ox = int(6 * math.sin(t * 40))
            oy = int(4 * math.cos(t * 33))
            shaken = Image.new("RGB", (W, H), PAPER)
            shaken.paste(frame, (ox, oy))
            frame = shaken
    elif style == "triptych_scan":
        frame = ken_burns(src, t, 1.02, 1.12, (0.2 + 0.6 * t, 0.5), (0.2 + 0.6 * t, 0.5))
    elif style == "redaction_wipe":
        frame = ken_burns(src, t, 1.05, 1.12)
        dtmp = ImageDraw.Draw(frame)
            # expanding black bars
        for bi, y in enumerate([420, 520, 620, 720]):
            width = int(W * min(1.0, max(0.0, (t - 0.1 * bi) * 1.8)))
            dtmp.rectangle([48, y, 48 + width, y + 36], fill=INK)
    elif style == "stamp_slam":
        frame = ken_burns(src, min(1.0, t * 1.1), 1.15, 1.05)
    elif style == "dossier_reveal":
        frame = ken_burns(src, t, 1.2, 1.05)
        frame = fade_black(frame, max(0.0, 0.75 - t * 1.2))
    elif style == "quote_type":
        frame = Image.new("RGB", (W, H), INK)
        # keep source dim behind
        bg = ken_burns(src, t, 1.05, 1.1)
        bg = ImageEnhance.Brightness(bg).enhance(0.35)
        frame = bg
    elif style == "cta_pulse":
        pulse = 0.5 + 0.5 * math.sin(t * math.pi * 4)
        frame = ken_burns(src, t, 1.08 + 0.04 * pulse, 1.16 + 0.04 * pulse)
    elif style == "endcard":
        frame = ken_burns(src, t, 1.1, 1.2)
        frame = fade_black(frame, max(0.0, (t - 0.55) * 1.8))
    else:
        frame = ken_burns(src, t)

    frame = scanlines(frame, 22 if style != "propaganda_shake" else 10)
    frame = vignette(frame, 0.35)
    draw = ImageDraw.Draw(frame)
    classification_bar(draw, f"THE IRONIC INEPTOCRACY", f"FILE //{clip.id}")

    # animated stamp
    if clip.stamp_text:
        appear = 0.25
        if t >= appear:
            scale_pop = 1.0 + max(0.0, 0.25 - (t - appear) * 2)
            # draw stamp; ignore scale_pop geometry, use opacity via early flash
            stamp(draw, clip.stamp_text, (40, 100))
            if t < appear + 0.08:
                draw.rectangle([0, 0, W - 1, H - 1], outline=SIGNAL, width=6)

    # lower third with typewriter for quote/dossier styles
    line = clip.line
    if style in {"quote_type", "dossier_reveal", "endcard"}:
        line = typewriter(clip.line, max(0.0, t - 0.15), 0.75)
    lower_third(draw, clip.kicker, line)

    # end fade
    if t > 0.9:
        frame = fade_black(frame, (t - 0.9) / 0.1 * 0.85)
    if t < 0.06:
        frame = fade_black(frame, 1.0 - t / 0.06)
    return frame


def encode_clip(clip: Clip) -> Path:
    src_path = resolve_source(clip.source)
    src = load_rgb(src_path)
    out = OUT / f"anim-{clip.id}-{clip.title.lower().replace(' ', '-')[:40]}.mp4"
    poster = POSTERS / f"anim-{clip.id}.jpg"

    with tempfile.TemporaryDirectory(prefix=f"inept-anim-{clip.id}-") as td:
        td_path = Path(td)
        for i in range(FRAMES):
            frame = render_frame(clip, src, i)
            frame.save(td_path / f"f{i:04d}.jpg", quality=88, optimize=True)
            if i == int(FRAMES * 0.45):
                frame.save(poster, quality=88, optimize=True)
        cmd = [
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", str(td_path / "f%04d.jpg"),
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-profile:v", "main",
            "-crf", "24",
            "-movflags", "+faststart",
            "-an",
            str(out),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out


def write_manifest(paths: list[tuple[Clip, Path]]) -> None:
    lines = [
        "---",
        "project: The Ironic Ineptocracy",
        "asset: animation-manifest",
        "count: 30",
        "format: 720x1280 H.264 muted ~5s",
        "tags: [book, social, motion]",
        "---",
        "",
        "# Animation manifest (30 clips)",
        "",
        "Continuity lock: Darnell glasses / Javon protective stare from `references/darnell-javon-approved.jpg`.",
        "",
        "| # | File | Style | Source still | Calendar day | Hook |",
        "|---|------|-------|--------------|--------------|------|",
    ]
    for clip, path in paths:
        lines.append(
            f"| {clip.id} | `{path.name}` | `{clip.style}` | `{clip.source}` | {clip.day or '—'} | {clip.line} |"
        )
    lines += [
        "",
        "## Posting tips",
        "",
        "- Stories / Reels / TikTok: use 9:16 MP4s as-is.",
        "- Feed: letterbox or export center square from posters/.",
        "- Pair with captions in `../ready-to-post-captions.md` by calendar day.",
        "- Keep CTA every 3–4 posts → https://ironicineptocracy.com/dossier",
        "",
    ]
    (Path(__file__).resolve().parent / "ANIMATION-MANIFEST.md").write_text("\n".join(lines))


def _job(clip: Clip) -> tuple[str, str, int]:
    path = encode_clip(clip)
    return clip.id, path.name, path.stat().st_size // 1024


def main() -> None:
    from concurrent.futures import ProcessPoolExecutor, as_completed

    OUT.mkdir(parents=True, exist_ok=True)
    POSTERS.mkdir(parents=True, exist_ok=True)
    done_map: dict[str, Path] = {}
    workers = min(6, len(CLIPS))
    with ProcessPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(_job, clip): clip for clip in CLIPS}
        for fut in as_completed(futures):
            clip = futures[fut]
            cid, name, kb = fut.result()
            print(f"rendered {cid} -> {name} ({kb} KB)", flush=True)
            done_map[cid] = OUT / name
    done = [(c, done_map[c.id]) for c in CLIPS]
    write_manifest(done)
    print(f"done: {len(done)} clips")


if __name__ == "__main__":
    main()
