#!/usr/bin/env python3
"""Weekly Facebook image generation, direct OpenAI Images API. Stdlib only.

Replaces Invoke-OpenAIImage.ps1's CLI wrapper (which forced 1024x1024 and
passed --no-augment). Calls POST /v1/images/generations directly, one image
per HTTP call, with augmentation left on and a per-slot destination size.

Usage:
    python generate.py --brief briefs/bok-law-firm.json [--week 2026-W38] [--slot monday] [--dry-run]

Idempotency: a (client, week, slot) with a ledger row whose output file
still exists on disk is skipped, never regenerated.
"""
from __future__ import annotations

import argparse
import base64
import datetime
import hashlib
import io
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ENDPOINT = "https://api.openai.com/v1/images/generations"
ROOT = Path(__file__).resolve().parent
LEDGER_PATH = ROOT / "ledger.jsonl"

# Real client logo files to composite onto every generated image for that
# client (bottom-right, ~18% of image width). The model cannot draw a real
# logo accurately, so the prompt reserves blank space and this step pastes
# the frozen asset in afterward. A client with no entry here just gets no
# logo composited (unconfigured, not a failure); a client with an entry
# whose file is missing or has no alpha channel is a hard failure.
LOGO_PATHS = {
    "bok-law-firm": Path(
        r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients"
        r"\bok-law-firm\deliverables\2026-07-28-august-september-social-content"
        r"\assets\bok-law-logo.png"
    ),
}
LOGO_WIDTH_FRACTION = 0.18
LOGO_MARGIN_FRACTION = 0.03


def composite_logo(image: Image.Image, logo_path: Path) -> Image.Image:
    """Paste the real client logo bottom-right, ~18% of image width.

    Hard-fails (does not silently skip) if the logo file is missing or has
    no alpha channel, since a missing/opaque logo composited anyway would
    ship a broken or box-backed logo without anyone noticing.
    """
    if not logo_path.exists():
        raise AssertionError(f"logo file missing: {logo_path}")
    logo = Image.open(logo_path)
    if "A" not in logo.getbands():
        raise AssertionError(f"logo has no alpha channel: {logo_path} (mode={logo.mode})")
    logo = logo.convert("RGBA")

    target_w = round(image.width * LOGO_WIDTH_FRACTION)
    scale = target_w / logo.width
    target_h = round(logo.height * scale)
    logo = logo.resize((target_w, target_h), Image.LANCZOS)

    margin = round(image.width * LOGO_MARGIN_FRACTION)
    x = image.width - target_w - margin
    y = image.height - target_h - margin

    base = image.convert("RGBA")
    base.alpha_composite(logo, dest=(x, y))
    return base

# Facebook destination formats -> (width, height). Pick per brief slot;
# never force a square. Live API rejects a non-multiple-of-16 size
# ("Width and height must both be divisible by 16"), confirmed 2026-09-14
# via HTTP 400 on both 1200x630 and 1080x1080; nearest multiple-of-16 sizes
# used instead, same aspect ratio to within FB's tolerance.
FORMAT_SIZES = {
    "feed_link": (1216, 640),  # target 1200x630, ratio 1.9 vs 1.905
    "feed_square": (1088, 1088),  # target 1080x1080, exact 1:1
    "feed_portrait": (1088, 1360),  # target 1080x1350 (4:5), both /16 exact
}


def validate_size(width: int, height: int) -> None:
    """Raise before spending an API call on a size the endpoint will reject."""
    if width % 16 == 0 and height % 16 == 0:
        return
    nearest = (round(width / 16) * 16, round(height / 16) * 16)
    raise ValueError(
        f"size {width}x{height} is invalid: width and height must both be "
        f"divisible by 16 (nearest valid size: {nearest[0]}x{nearest[1]})"
    )

# Published per-token gpt-image-2.5-sunburst rates (verified 2026-09-14,
# https://openrouter.ai/openai/gpt-image-2.5-sunburst): $5/1M text-input,
# $8/1M image-input, $30/1M image-output tokens.
PRICE_PER_TOKEN = {
    "text_input": 5.0 / 1_000_000,
    "image_input": 8.0 / 1_000_000,
    "image_output": 30.0 / 1_000_000,
}


def size_for_format(fmt: str) -> str:
    if fmt not in FORMAT_SIZES:
        raise ValueError(f"Unknown destination format: {fmt!r}. Known: {list(FORMAT_SIZES)}")
    w, h = FORMAT_SIZES[fmt]
    validate_size(w, h)
    return f"{w}x{h}"


def current_iso_week() -> str:
    year, week, _ = datetime.date.today().isocalendar()
    return f"{year}-W{week:02d}"


def load_ledger_rows() -> list[dict]:
    if not LEDGER_PATH.exists():
        return []
    rows = []
    for line in LEDGER_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def already_done(rows: list[dict], client: str, week: str, slot: str) -> dict | None:
    """Return the existing ledger row if (client, week, slot) already has a
    file on disk, else None."""
    for row in rows:
        if row.get("client") == client and row.get("week") == week and row.get("slot") == slot:
            if Path(row.get("path", "")).exists():
                return row
    return None


def compute_cost(usage: dict | None) -> float | None:
    if not usage:
        return None
    details = usage.get("input_tokens_details") or {}
    text_tokens = details.get("text_tokens", 0)
    image_tokens = details.get("image_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    cost = (
        text_tokens * PRICE_PER_TOKEN["text_input"]
        + image_tokens * PRICE_PER_TOKEN["image_input"]
        + output_tokens * PRICE_PER_TOKEN["image_output"]
    )
    return round(cost, 6)


def call_image_api(api_key: str, prompt: str, size: str, quality: str, model: str) -> dict:
    payload = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": quality,
        "n": 1,
        "output_format": "png",
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error {exc.code}: {body}") from None


def run(brief_path: Path, week: str, only_slot: str | None, dry_run: bool) -> int:
    brief = json.loads(brief_path.read_text(encoding="utf-8"))
    client = brief["client"]
    model = brief.get("model", "gpt-image-2.5-sunburst")
    quality = brief.get("quality", "high")

    rows = load_ledger_rows()
    out_dir = ROOT / "out" / client / week
    out_dir.mkdir(parents=True, exist_ok=True)

    for slot_def in brief["slots"]:
        slot = slot_def["slot"]
        if only_slot and slot != only_slot:
            continue

        existing = already_done(rows, client, week, slot)
        if existing:
            print(f"[skip] {client}/{week}/{slot} already on disk: {existing['path']}")
            continue

        size = size_for_format(slot_def["format"])
        prompt = slot_def["prompt"]
        out_path = out_dir / f"{slot}.png"

        if dry_run:
            print(f"[dry-run] would generate {client}/{week}/{slot} -> {out_path} size={size} quality={quality}")
            continue

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("OPENAI_API_KEY is not set in this process.", file=sys.stderr)
            return 1

        print(f"[generate] {client}/{week}/{slot} size={size} quality={quality} model={model}")
        result = call_image_api(api_key, prompt, size, quality, model)
        api_key = None  # do not hold the key in memory longer than needed

        b64 = result["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64)

        logo_path = LOGO_PATHS.get(client)
        logo_composited = False
        if logo_path is not None:
            img = Image.open(io.BytesIO(image_bytes))
            img = composite_logo(img, logo_path)
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            image_bytes = buf.getvalue()
            logo_composited = True

        out_path.write_bytes(image_bytes)

        usage = result.get("usage")
        row = {
            "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "client": client,
            "week": week,
            "slot": slot,
            "title": slot_def.get("title"),
            "model": model,
            "size": size,
            "quality": quality,
            "prompt": prompt,
            "path": str(out_path),
            "sha256": hashlib.sha256(image_bytes).hexdigest(),
            "bytes": len(image_bytes),
            "usage": usage,
            "cost_usd": compute_cost(usage),
            "logo_composited": logo_composited,
            "logo_path": str(logo_path) if logo_path is not None else None,
        }
        with LEDGER_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(row) + "\n")
        rows.append(row)
        print(f"[done] {out_path} ({row['bytes']} bytes, cost=${row['cost_usd']})")

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--brief", required=True, type=Path)
    parser.add_argument("--week", default=current_iso_week())
    parser.add_argument("--slot", default=None, help="Generate only this slot")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    return run(args.brief, args.week, args.slot, args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
