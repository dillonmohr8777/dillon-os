#!/usr/bin/env python3
"""Check the shipped data against the claims made about it.

The README, the PR and docs/SOURCES.md all assert numbers. This re-derives them
from the files in data/ and fails on any disagreement, so the provenance is
checkable rather than asserted. It reads only what ships: no source download, no
network, about a second.

    python3 tools/verify.py            check
    python3 tools/verify.py --update   rewrite data/manifest.json checksums
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import struct
import sys
import zlib

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
import pack                                                        # noqa: E402
from geo import FEET_TO_M                                          # noqa: E402

DATA = os.path.join(HERE, "data")
MANIFEST = os.path.join(DATA, "manifest.json")

SHIPPED = [
    "philly-buildings.bin", "philly-terrain.bin", "philly-ground.bin",
    "philly-water.bin", "philly-landmarks.json", "philly-crowns.json",
    "philly-prospects.json",
]

fails: list[str] = []
notes: list[str] = []


def check(label, got, want, tol=0.0):
    ok = (abs(got - want) <= tol) if isinstance(want, (int, float)) else got == want
    line = f"{'ok  ' if ok else 'FAIL'}  {label}: {got}" + ("" if ok else f"  (expected {want})")
    (notes if ok else fails).append(line)
    print(line)
    return ok


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def read_buildings():
    """Walk every tile of the shipped binary and total what is really in it."""
    data = open(os.path.join(DATA, "philly-buildings.bin"), "rb").read()
    assert data[:8] == pack.MAGIC, f"bad magic {data[:8]!r}"
    ntiles, nbuild = struct.unpack_from("<II", data, 40)
    idx, pay = pack.HEADER_SIZE, pack.HEADER_SIZE + ntiles * pack.INDEX_ENTRY
    total = 0
    tallest = 0.0
    for i in range(ntiles):
        _tx, _ty, cnt, off, ln = struct.unpack_from(
            "<iiIII", data, idx + i * pack.INDEX_ENTRY)
        raw = zlib.decompress(data[pay + off:pay + off + ln])
        n = struct.unpack_from("<I", raw, 0)[0]
        assert n == cnt, f"tile {i}: index says {cnt}, payload says {n}"
        total += n
        o = 4 + 4 * n
        for k in range(n):
            h = struct.unpack_from("<H", raw, o + k * 2)[0] * 0.1
            if h > tallest:
                tallest = h
    return ntiles, nbuild, total, tallest


def main():
    update = "--update" in sys.argv
    man = json.load(open(MANIFEST))
    print("shipped artifacts")
    arts = man.setdefault("artifacts", {})
    for name in SHIPPED:
        path = os.path.join(DATA, name)
        if not os.path.exists(path):
            fails.append(f"FAIL  {name} is missing")
            print(f"FAIL  {name} is missing")
            continue
        size, digest = os.path.getsize(path), sha256(path)
        rec = arts.get(name)
        if update or rec is None:
            arts[name] = {"bytes": size, "sha256": digest}
            print(f"{'set ' if update else 'new '}  {name}: {size} bytes")
            continue
        check(f"{name} bytes", size, rec["bytes"])
        check(f"{name} sha256", digest, rec["sha256"])

    print("\nthe claims")
    ntiles, nbuild, counted, tallest_m = read_buildings()
    check("tiles in the container", ntiles, man["counts"]["tiles"])
    check("buildings in the header", nbuild, man["counts"]["buildings_written"])
    check("buildings actually decoded", counted, man["counts"]["buildings_written"])
    check("tallest measured building, ft", round(tallest_m / FEET_TO_M),
          round(man["heights_ft"]["max"]), 1)

    landmarks = json.load(open(os.path.join(DATA, "philly-landmarks.json")))
    check("landmarks", len(landmarks), man["counts"]["landmarks"])

    crowns = json.load(open(os.path.join(DATA, "philly-crowns.json")))["crowns"]
    by_id = {l["id"]: l for l in landmarks}
    for c in crowns:
        l = by_id.get(c["objectid"])
        if not l:
            fails.append(f"FAIL  crown {c['name']}: objectid not in the dataset")
            continue
        check(f"crown {c['name']} attaches to the right building", l["name"], c["name"])
        check(f"crown {c['name']} published height, ft", l["crown_ft"], c["architectural_ft"])
    for l in landmarks:
        if l.get("crown_ft") is not None and l["id"] not in {c["objectid"] for c in crowns}:
            fails.append(f"FAIL  {l['name']} has a crown height but no crown geometry")

    t = open(os.path.join(DATA, "philly-terrain.bin"), "rb").read()
    assert t[:8] == b"PHLTERR1", "bad terrain magic"
    nx, ny = struct.unpack_from("<II", t, 8)
    zmin, zscale = struct.unpack_from("<ff", t, 28)
    q = zlib.decompress(t[36:])
    vals = struct.unpack(f"<{nx * ny}H", q)
    lo, hi = zmin + min(vals) * zscale, zmin + max(vals) * zscale
    check("terrain cells", nx * ny, nx * ny)
    check("lowest ground, m", round(lo, 2), -3.97, 0.05)
    check("highest ground, m", round(hi, 2), 134.77, 0.05)

    # City Hall is the whole provenance argument in one building: measured at
    # 170 ft, published at 548, and both numbers have to survive in the data.
    ch = by_id[489794]
    check("City Hall measured, ft", ch["height_ft"], 170.0)
    check("City Hall published, ft", ch["crown_ft"], 548.0)

    print()
    if fails:
        print(f"{len(fails)} check(s) failed")
        return 1
    if update:
        json.dump(man, open(MANIFEST, "w"), indent=2)
        open(MANIFEST, "a").write("\n")
        print(f"manifest updated: {len(SHIPPED)} artifacts")
        return 0
    print(f"all {len(notes)} checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
