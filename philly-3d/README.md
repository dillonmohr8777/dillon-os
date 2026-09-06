# Philadelphia 3D

A real 3D model of Philadelphia, built from the city's own LiDAR survey.

545,451 buildings. Every one is a real footprint at its measured height. No
procedural city, no AI-generated skyline, no stock model. Comcast Center is
976 ft here because the City of Philadelphia measured it at 976 ft.

![Center City from the southwest](renders/shot-02-center-city.jpg)

## What is here

| Path | What it is |
|---|---|
| `data/philly-buildings.bin` | The whole city, 14.6 MB, tiled binary. Format in `docs/FORMAT.md` |
| `data/philly-landmarks.json` | 5,586 named or tall buildings with heights and addresses |
| `data/manifest.json` | Counts, extents, checksums, processing parameters |
| `tools/` | The pipeline, from download to renderable geometry |
| `renders/` | Preview images from the software renderer |
| `docs/SOURCES.md` | Provenance for every real-world number, including where the data is wrong |
| `docs/FORMAT.md` | Binary format specification |

## Reproducing the dataset

Nothing here is hand-entered. The whole thing rebuilds from public endpoints:

```bash
python3 tools/fetch_buildings.py     # 546,459 features, about 3.5 minutes
python3 tools/fetch_layers.py        # water, streets, city boundary
python3 tools/build_dataset.py       # -> data/philly-buildings.bin, about 70 s
```

Requires `numpy`. `tools/fetch_buildings.py` resumes from where it stopped if
interrupted.

## Previews

```bash
pip install pillow
python3 tools/render_preview.py
```

A dependency-free software renderer: painter's algorithm, near-plane clipping,
backface culling, flat shading against the true solar vector, Beer-Lambert
distance haze. It has **no shadows, no global illumination and no reflections** —
it exists to prove the data is right, not to be the finished image.

## Two facts this dataset produced

**Penn's grid is rotated 9.21 degrees off cardinal.** Measured from 285 street
centreline segments: Market, Arch, Chestnut, Spruce and Walnut all run within
0.25 degrees of each other, and Broad is perpendicular to them.

**Philadelphia therefore has its own henge.** Combining that rotation with NOAA
solar geometry, the setting sun aligns with the east-west street corridors from
**6-21 April** and **20 August - 5 September**. The best frame of 2026 is
**28 August, 7:14 PM**, when the sun sits 0.01 degrees off the axis of Market
Street at 3.921 degrees elevation.

```bash
python3 tools/solar.py      # validates against published sunset times
```

## Honesty about the heights

`approx_hgt` measures the dominant roof mass. It is excellent for flat-topped
buildings and understates anything with a slender crown or spire, because thin
structures return too few LiDAR points. City Hall reads 170 ft, its cornice,
rather than the 548 ft tower.

Measured values are never overwritten. Landmarks whose silhouette is
understated carry a separate `crown_ft` field with the published architectural
height, so both numbers stay visible. Full comparison table in
`docs/SOURCES.md`.

## Coordinates

Local ENU tangent plane in metres, origin at City Hall (39.952583, -75.165222),
+X east, +Y north, +Z up. One unit is one metre anywhere in the scene.
