#!/usr/bin/env python3
"""Pull the supporting City of Philadelphia layers: water, parks, boundary,
street centrelines. Same keyset pagination as the building pull."""
import gzip, json, os, sys, time, urllib.parse, urllib.request

ROOT = "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services"
HERE = os.path.dirname(os.path.abspath(__file__))

LAYERS = [
    ("water",    "Hydrographic_Features_Poly", 1, "*"),
    ("parks",    "PPR_Properties",             0, "official_name,acreage,property_classification,ppr_use"),
    ("boundary", "City_Limits",                0, "*"),
    ("streets",  "Street_Centerline",          0, "objectid,st_name,st_type,class,seg_id,st_code"),
]


def get(url, params, tries=6):
    body = urllib.parse.urlencode(params).encode()
    last = None
    for t in range(tries):
        try:
            r = urllib.request.Request(url, data=body,
                                       headers={"Accept-Encoding": "gzip",
                                                "User-Agent": "phl-3d/1.0"})
            with urllib.request.urlopen(r, timeout=150) as resp:
                raw = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                return json.loads(raw)
        except Exception as e:                       # noqa: BLE001
            last = e
            time.sleep(min(2 ** t, 30))
    raise RuntimeError(f"{url}: {last}")


for name, svc, layer, fields in LAYERS:
    url = f"{ROOT}/{svc}/FeatureServer/{layer}/query"
    out = os.path.join(HERE, f"{name}.ndjson")
    n, last_oid, t0 = 0, 0, time.time()
    with open(out, "w") as fh:
        while True:
            d = get(url, {"where": f"objectid>{last_oid}", "outFields": fields,
                          "returnGeometry": "true", "outSR": "4326",
                          "geometryPrecision": "6", "orderByFields": "objectid ASC",
                          "resultRecordCount": 1000, "f": "geojson"})
            feats = d.get("features") or []
            if not feats:
                break
            for f in feats:
                fh.write(json.dumps(f, separators=(",", ":")) + "\n")
            oids = [f["properties"].get("objectid") or f.get("id") for f in feats]
            oids = [o for o in oids if isinstance(o, int)]
            if not oids:
                print(f"{name}: no objectid to page on, stopping at {n}", flush=True)
                break
            last_oid = max(oids)
            n += len(feats)
            if len(feats) < 1000:
                break
    print(f"{name}: {n} features in {time.time()-t0:.0f}s -> {out}", flush=True)
print("ALL LAYERS DONE", flush=True)
