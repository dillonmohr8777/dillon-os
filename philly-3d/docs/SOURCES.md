# Sources and provenance

Every real-world number in this project traces to a named source. Where a
measurement disagrees with a published figure, both are recorded and the
disagreement is explained rather than smoothed over.

## Building footprints and heights

- **Dataset**: `LI_BUILDING_FOOTPRINTS`
- **Publisher**: City of Philadelphia, Department of Licenses & Inspections
- **Endpoint**: `https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/LI_BUILDING_FOOTPRINTS/FeatureServer/0`
- **Downloaded**: 2026-09-06, 546,459 features, complete layer
- **Height field**: `approx_hgt`, feet, LiDAR-derived
- **Also captured**: `max_hgt`, `base_elevation`, `building_name`, `address`, `square_ft`

`approx_hgt` measures the **dominant roof mass**, not the architectural height.
It is reliable for flat-topped buildings and understates anything with a
slender crown, spire, or mast, because a thin structure returns too few LiDAR
points to register as roof.

Checked against published architectural heights:

| Building | LiDAR `approx_hgt` | Published | Reading |
|---|---:|---:|---|
| Comcast Center | 976 ft | 975 ft | Flat roof, matches to 1 ft |
| Comcast Technology Center | 914 ft | 1,121 ft | Spire not captured |
| Two Liberty Place | 754 ft | 848 ft | Crown not captured |
| BNY Mellon Center | 744 ft | 792 ft | Pyramid top partly captured |
| Three Logan Square | 727 ft | 739 ft | Close |
| FMC Tower | 716 ft | 730 ft | Close |
| One Liberty Place | 677 ft | 945 ft | Large pyramidal crown not captured |
| Independence Blue Cross | 617 ft | 625 ft | Close |
| **City Hall** | **170 ft** | **548 ft** | Measures the masonry block; the tower and the William Penn statue are absent |

City Hall is the sharpest case: 170 ft with a 153,719 sq ft footprint is the
main building's cornice line, and the tower that actually defines the skyline
is missing entirely.

### Crowns

**The measured value is never overwritten.** The five buildings whose published
architectural height exceeds their measured roof mass carry a separate crown
entry in `data/philly-crowns.json`, keyed by `objectid` so a crown can never
attach to the wrong building. `tools/build_dataset.py` reads that same file into
the `crown_ft` field of `philly-landmarks.json`, so the table the renderer draws
and the table the pipeline records cannot drift apart. A reader always sees both
numbers.

The renderer draws the surveyed mass exactly as surveyed, then stacks the crown
above it as separately sourced geometry (`viewer/js/crowns.js`,
`viewer/js/mesh.js`). The Godot export emits the same tiers as rows flagged
`crown: true` (`tools/export_godot.py`).

| Building | Measured | Published | Tiers | Added |
|---|---:|---:|---:|---:|
| Comcast Technology Center | 914 ft | 1,121 ft | 2 | +207 ft |
| One Liberty Place | 677 ft | 945 ft | 3 | +268 ft |
| Two Liberty Place | 754 ft | 848 ft | 2 | +94 ft |
| BNY Mellon Center | 744 ft | 792 ft | 1 | +48 ft |
| City Hall | 170 ft | 548 ft | 4 | +378 ft |

Three Logan Square (+12 ft) and the FMC Tower (+14 ft) are within the survey's
own noise and have no crown entry: the difference would not be visible, and
nothing in the layer sources those two figures.

**What is sourced and what is approximated.** The heights are published
architectural heights, and they are what the top tier reaches. The *shape* of
the stack is not surveyed: tier widths and the intermediate heights are chosen
to read correctly in silhouette. Two approximations are worth naming:

- Tiers are centred on the footprint. City Hall's tower therefore rises from
  the middle of the block rather than over one portal — a horizontal error of
  a few tens of metres on a 548 ft tower.
- City Hall's surveyed footprint is the whole 152 x 148 m block, so its tiers
  are squared to the block's own axes rather than scaled from its outline;
  scaling the outline would wrap the tower around the courtyard.

`to_ft` shares `approx_hgt`'s datum: height above the building's own grade. The
footprint's `base_elevation` is added back when the tier is placed, so City
Hall's 34.5 ft grade is not silently swallowed.

## Supporting layers

Same publisher and ArcGIS organisation, downloaded 2026-09-06:

| Layer | Service | Features |
|---|---|---:|
| Hydrography (rivers, water bodies) | `Hydrographic_Features_Poly` layer 1 | 7,979 |
| Street centrelines | `Street_Centerline` layer 0 | 41,271 |
| City boundary | `City_Limits` layer 0 | 1 |
| Parks | `PPR_Properties` layer 0 | pending, see Known gaps |

## Projection

Local ENU tangent plane, WGS-84 ellipsoid, so one scene unit is one real metre.

- Origin: **39.952583 N, -75.165222 W** — Philadelphia City Hall, the origin of
  the city's own street-numbering grid
- Metres per degree longitude at origin: 85,452.8936
- Metres per degree latitude at origin: 111,033.7215
- Implementation and round-trip test: `tools/geo.py`

Tangent-plane error over the 27.5 x 29.5 km extent of the county stays well
under a metre, far below the resolution of the source footprints.

## Street grid rotation

Measured from the city's own street centrelines, length-weighted circular mean
over Center City segments longer than 40 m:

| Street | Segments | Bearing (0 = due east, CCW) |
|---|---:|---:|
| Market | 36 | 170.986 |
| Arch | 32 | 170.852 |
| Chestnut | 39 | 170.793 |
| Spruce | 41 | 170.766 |
| Walnut | 44 | 170.752 |
| Broad | 93 | 80.516 |

**Penn's grid is rotated 9.21 degrees off cardinal.** The east-west streets
agree to within 0.25 degrees of each other, and Broad Street is perpendicular
to them to within 0.3 degrees.

## Solar geometry

NOAA Solar Calculator equations (Meeus low-precision form), `tools/solar.py`.
Validated against published values for Philadelphia:

| Check | Computed | Published |
|---|---:|---:|
| Sunset 2026-09-06 | elevation 0.096 deg at 23:22 UTC | 19:22 EDT |
| Summer solstice local noon | 73.49 deg | ~73.5 deg |
| Winter solstice local noon | 26.64 deg | ~26.6 deg |

### Phillyhenge

Combining the measured 9.21 degree grid rotation with the solar equations, the
setting sun aligns with the east-west street corridors (compass azimuth
279.21 degrees) on these 2026 dates:

- **6 - 21 April**
- **20 August - 5 September**

Best single frame: **2026-08-28, 19:14 EDT** — sun elevation 3.921 degrees,
azimuth 279.195 degrees, 0.01 degrees off the street axis.

The sunrise counterpart (azimuth 80.79 degrees) falls on the same date ranges.

This is a derived result, not a citation. It follows from two measured inputs
above; anyone can recompute it with `python3 tools/solar.py`.

## Known gaps

- `PPR_Properties` (parks) paginates on a field other than `objectid`; the
  fetch returned 0 features and needs a different key. Parks are therefore not
  yet in the model.
- 2,989 buildings of 546,459 (0.55%) have no measured height. They are given
  the citywide rowhouse median of 22 ft and flagged `FLAG_EST_HEIGHT` in the
  binary so they can be excluded or styled differently.
- 1,075 footprints under 8 m2 were dropped as survey noise.
- The LiDAR flight date is not published in the layer metadata. The dataset
  contains the Comcast Technology Center (completed 2018) and the FMC Tower
  (2016), so it postdates 2018.
