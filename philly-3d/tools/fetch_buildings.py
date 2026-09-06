#!/usr/bin/env python3
"""Keyset-paginate the City of Philadelphia LI_BUILDING_FOOTPRINTS layer.

Official source: City of Philadelphia, Department of Licenses & Inspections.
Heights (approx_hgt / max_hgt, feet) are LiDAR-derived. We never invent a height.
"""
import json, os, sys, time, urllib.parse, urllib.request, gzip, io

BASE = ("https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/"
        "LI_BUILDING_FOOTPRINTS/FeatureServer/0/query")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "buildings.ndjson")
STATE = OUT + ".state"
PAGE = 2000
FIELDS = "objectid,building_name,approx_hgt,max_hgt,base_elevation,address,square_ft"


def get(params, tries=6):
    data = urllib.parse.urlencode(params).encode()
    last = None
    for t in range(tries):
        try:
            req = urllib.request.Request(BASE, data=data,
                                         headers={"Accept-Encoding": "gzip",
                                                  "User-Agent": "phl-3d/1.0"})
            with urllib.request.urlopen(req, timeout=120) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                return json.loads(raw)
        except Exception as e:                      # noqa: BLE001
            last = e
            time.sleep(min(2 ** t, 30))
    raise RuntimeError(f"failed after {tries}: {last}")


def main():
    last_oid = 0
    mode = "w"
    if os.path.exists(STATE):
        last_oid = int(open(STATE).read().strip() or 0)
        mode = "a"
        print(f"resuming from objectid {last_oid}", flush=True)
    total = 0
    t0 = time.time()
    with open(OUT, mode) as fh:
        while True:
            d = get({
                "where": f"objectid>{last_oid}",
                "outFields": FIELDS,
                "returnGeometry": "true",
                "outSR": "4326",
                "geometryPrecision": "6",
                "orderByFields": "objectid ASC",
                "resultRecordCount": PAGE,
                "f": "geojson",
            })
            feats = d.get("features") or []
            if not feats:
                break
            for f in feats:
                fh.write(json.dumps(f, separators=(",", ":")) + "\n")
            last_oid = max(int(f["properties"]["objectid"]) for f in feats)
            total += len(feats)
            fh.flush()
            open(STATE, "w").write(str(last_oid))
            if total % 20000 == 0:
                print(f"{total} features, oid {last_oid}, {time.time()-t0:.0f}s", flush=True)
            if len(feats) < PAGE:
                break
    print(f"DONE {total} features in {time.time()-t0:.0f}s -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
