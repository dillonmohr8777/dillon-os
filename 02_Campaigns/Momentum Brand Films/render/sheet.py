#!/usr/bin/env python3
"""Contact sheet for a rendered film, for eyes-on QA."""
import argparse, subprocess, sys
ap = argparse.ArgumentParser()
ap.add_argument("mp4"); ap.add_argument("out")
ap.add_argument("--duration", type=float, required=True)
ap.add_argument("--cols", type=int, default=5); ap.add_argument("--rows", type=int, default=4)
ap.add_argument("--width", type=int, default=440)
a = ap.parse_args()
n = a.cols * a.rows
rate = n / a.duration
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", a.mp4, "-vf",
                f"fps={rate},scale={a.width}:-1,tile={a.cols}x{a.rows}",
                "-frames:v", "1", a.out], check=True)
print(a.out)
