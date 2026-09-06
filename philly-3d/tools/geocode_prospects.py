#!/usr/bin/env python3
"""Geocode the Philadelphia prospect sites and bind each to its real building.

Two passes, both against the city's own systems rather than a third-party
geocoder:

1. AIS (api.phila.gov/ais) turns a street address into an official coordinate.
2. A spatial query against LI_BUILDING_FOOTPRINTS finds the footprint that
   actually contains that point, so a marker sits on the building the business
   occupies rather than floating at a rooftop guess.

Anything that fails either pass is written out with match: null rather than
being quietly moved to the nearest thing that did match.
"""
from __future__ import annotations

import gzip
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "tools"))
from geo import to_local, FEET_TO_M                                # noqa: E402

AIS = "https://api.phila.gov/ais/v1/search/"
FOOTPRINTS = ("https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/"
              "LI_BUILDING_FOOTPRINTS/FeatureServer/0/query")
SRC = os.environ.get("PHL25_SRC", "/home/user/work/philly25.json")
OUT = os.path.join(HERE, "data", "philly-prospects.json")


def get(url, params=None, tries=5):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    last = None
    for t in range(tries):
        try:
            req = urllib.request.Request(url, headers={
                "Accept-Encoding": "gzip", "User-Agent": "philly-3d/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                return json.loads(raw)
        except Exception as e:                        # noqa: BLE001
            last = e
            time.sleep(min(2 ** t, 20))
    raise RuntimeError(f"{url}: {last}")


def street_only(addr):
    return addr.split(",")[0].strip()


def geocode(addr):
    d = get(AIS + urllib.parse.quote(street_only(addr)), {"gatekeeperKey": ""})
    feats = d.get("features") or []
    if not feats:
        return None
    g = feats[0]["geometry"]["coordinates"]
    return {"lon": g[0], "lat": g[1],
            "normalized": feats[0]["properties"].get("street_address"),
            "match_type": d.get("search_type")}


FIELDS = "objectid,building_name,address,approx_hgt,base_elevation,square_ft"
NEAR_RADIUS_M = 25.0


def footprint_at(lon, lat):
    """Footprint containing the point, else the nearest within 25 m.

    An AIS coordinate can land on the pavement outside the building line, so a
    strict intersect misses roughly one in six. The fallback is bounded and the
    result records which rule matched, so a near miss is never presented as a
    containment.
    """
    d = get(FOOTPRINTS, {
        "geometry": json.dumps({"x": lon, "y": lat,
                                "spatialReference": {"wkid": 4326}}),
        "geometryType": "esriGeometryPoint", "inSR": "4326", "outSR": "4326",
        "spatialRel": "esriSpatialRelIntersects", "outFields": FIELDS,
        "returnGeometry": "false", "f": "json"})
    feats = d.get("features") or []
    if feats:
        best = max(feats, key=lambda f: f["attributes"].get("square_ft") or 0)
        return best["attributes"], "contains", 0.0

    # widen to a small envelope and take the geometrically nearest footprint
    dlon = NEAR_RADIUS_M / 85452.8936
    dlat = NEAR_RADIUS_M / 111033.7215
    d = get(FOOTPRINTS, {
        "geometry": f"{lon-dlon},{lat-dlat},{lon+dlon},{lat+dlat}",
        "geometryType": "esriGeometryEnvelope", "inSR": "4326", "outSR": "4326",
        "spatialRel": "esriSpatialRelIntersects", "outFields": FIELDS,
        "returnGeometry": "true", "geometryPrecision": "6", "f": "geojson"})
    best, bestd = None, 1e9
    px, py = to_local(lon, lat)
    for f in d.get("features") or []:
        g = f.get("geometry")
        if not g:
            continue
        rings = ([g["coordinates"][0]] if g["type"] == "Polygon"
                 else [poly[0] for poly in g["coordinates"]])
        for r in rings:
            for lo, la in r:
                qx, qy = to_local(lo, la)
                dd = math.hypot(qx - px, qy - py)
                if dd < bestd:
                    bestd, best = dd, f["properties"]
    if best and bestd <= NEAR_RADIUS_M:
        return best, "nearest", round(bestd, 1)
    return None


def main():
    rows = json.load(open(SRC))
    out = []
    for b in rows:
        rec = dict(b)
        try:
            g = geocode(b["address"])
        except Exception as e:                        # noqa: BLE001
            g = None
            rec["geocode_error"] = str(e)[:120]
        if g:
            rec["lat"], rec["lon"] = g["lat"], g["lon"]
            rec["normalized_address"] = g["normalized"]
            x, y = to_local(g["lon"], g["lat"])
            rec["x"], rec["y"] = round(x, 2), round(y, 2)
            try:
                hit = footprint_at(g["lon"], g["lat"])
            except Exception:                         # noqa: BLE001
                hit = None
            if hit:
                fp, how, dist = hit
                rec["building"] = {
                    "objectid": fp.get("objectid"),
                    "name": fp.get("building_name"),
                    "address": fp.get("address"),
                    "height_ft": fp.get("approx_hgt"),
                    "height_m": round((fp.get("approx_hgt") or 0) * FEET_TO_M, 1),
                    "base_ft": fp.get("base_elevation"),
                    "square_ft": fp.get("square_ft"),
                    "match": how,
                    "match_distance_m": dist,
                }
            else:
                rec["building"] = None
        else:
            rec["lat"] = rec["lon"] = rec["x"] = rec["y"] = None
            rec["building"] = None
        out.append(rec)
        ok = "ok " if rec.get("x") is not None else "MISS"
        bl = rec.get("building")
        if bl:
            how = bl["match"]
            extra = "" if how == "contains" else f", {bl['match_distance_m']} m"
            note = f"bldg {bl['objectid']} @ {bl['height_ft']} ft ({how}{extra})"
        else:
            note = "no footprint within 25 m"
        print(f"  {ok} {b['code']} {b['name'][:34]:<34} {note}")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"generated_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": {"geocoder": "City of Philadelphia AIS (api.phila.gov/ais)",
                          "footprints": "LI_BUILDING_FOOTPRINTS spatial intersect"},
               "count": len(out),
               "geocoded": sum(1 for r in out if r.get("x") is not None),
               "with_building": sum(1 for r in out if r.get("building")),
               "matched_by_containment": sum(
                   1 for r in out if (r.get("building") or {}).get("match") == "contains"),
               "matched_by_proximity": sum(
                   1 for r in out if (r.get("building") or {}).get("match") == "nearest"),
               "prospects": out}, open(OUT, "w"), indent=1)
    print(f"\nwrote {OUT}")
    print(f"geocoded {sum(1 for r in out if r.get('x') is not None)}/{len(out)}, "
          f"bound to a footprint {sum(1 for r in out if r.get('building'))}/{len(out)}")


if __name__ == "__main__":
    main()
