#!/usr/bin/env python3
"""Frame-accurate renderer for the Momentum brand films.

A film is a self-contained HTML page that declares:
    window.FILM  = {width, height, fps, duration}   // duration in seconds
    window.seek(t)                                   // paint the frame at time t
    window.__ready                                   // optional: set false at boot, true when async work lands

Nothing animates on its own: every visual state is a pure function of t. This
script steps the timeline, screenshots each frame, and pipes the frames straight
into ffmpeg, so the render is deterministic and re-runnable.

    python3 capture.py films/01-momentum-news/film.html out/01.mp4 [--scale 1]
"""
import argparse, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright

CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"


def render(html, out, scale=1, crf=17, still=None, poster=None):
    html = pathlib.Path(html).resolve()
    out = pathlib.Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME,
            args=["--no-sandbox", "--allow-file-access-from-files", "--force-color-profile=srgb",
                  "--font-render-hinting=none", "--disable-lcd-text",
                  "--hide-scrollbars", "--disable-gpu"],
        )
        page = browser.new_page(viewport={"width": 100, "height": 100},
                                device_scale_factor=scale)
        page.goto("file://" + str(html))
        page.wait_for_function("() => window.FILM && window.seek && window.__ready !== false", timeout=30000)
        film = page.evaluate("window.FILM")
        w, h = int(film["width"]), int(film["height"])
        fps, dur = float(film["fps"]), float(film["duration"])
        page.set_viewport_size({"width": w, "height": h})
        try:
            page.evaluate("document.fonts.ready")
            page.wait_for_function("() => document.fonts.status === 'loaded'", timeout=15000)
        except Exception:
            pass
        total = int(round(dur * fps))
        print(f"{html.parent.name}: {w}x{h} @{fps}fps  {dur}s  {total} frames  scale={scale}",
              flush=True)

        if still is not None:
            page.evaluate(f"window.seek({still})")
            page.screenshot(path=str(out))
            browser.close()
            return

        ff = subprocess.Popen(
            ["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(fps),
             "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)],
            stdin=subprocess.PIPE)
        try:
            for i in range(total):
                t = i / fps
                page.evaluate(f"window.seek({t})")
                ff.stdin.write(page.screenshot(type="png"))
                if i % 60 == 0:
                    print(f"  frame {i}/{total}", flush=True)
                if poster and i == int(round(poster * fps)):
                    page.screenshot(path=str(out.with_suffix(".jpg")), type="jpeg", quality=88)
        finally:
            ff.stdin.close()
            ff.wait()
        browser.close()
    size = out.stat().st_size
    print(f"  wrote {out} ({size/1e6:.2f} MB)", flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("html"); ap.add_argument("out")
    ap.add_argument("--scale", type=int, default=1)
    ap.add_argument("--crf", type=int, default=17)
    ap.add_argument("--still", type=float, default=None,
                    help="render a single frame at this time to a PNG instead of a video")
    ap.add_argument("--poster", type=float, default=None,
                    help="also save a JPEG poster from the frame at this time")
    a = ap.parse_args()
    render(a.html, a.out, a.scale, a.crf, a.still, a.poster)
