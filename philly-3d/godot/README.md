# Real Philadelphia for Grand Theft Bureaucracy

A drop-in world builder that replaces the invented district with a real one:
449 building footprints at their LiDAR-measured heights, 12 sourced crown
tiers restoring the towers the survey cannot see, and 216 street
centrelines, straight from the City of Philadelphia survey.

## Why this fits without a rewrite

The engine already picks its world builder by path:

```gdscript
var builder_path := str(hub_profile.get("builder", "res://scripts/world_builder.gd"))
```

and already builds a building from a centre, a footprint and a height. That is
exactly the shape of the survey data. So this is not a mesh import, it is the
same builder contract fed by measurements instead of by `rng`.

`philadelphia_world_builder.gd` exposes the identical public surface -
`build()`, `landmark()`, `road_coords()`, `road_half()`, `world_half()`,
`blackspots()`, `block_bounds()` - so `mission_director`, `traffic_system`,
`minimap` and `hud` need no changes.

## Install

1. Copy `scripts/philadelphia_world_builder.gd` to `godot/scripts/`.
2. Copy `data/philadelphia_district.json` and `data/philadelphia_buildings.json`
   to `godot/data/`.
3. Point the hub profile at it:
   `hub_profile["builder"] = "res://scripts/philadelphia_world_builder.gd"`

## The rotation, and why it matters

Penn's grid runs **9.21 degrees off cardinal**, measured from 285 street
centreline segments. The engine's road constants, lane maths and window
punching are all axis-aligned, so the district is rotated by that bearing on
export. Market and Chestnut then run along X, the numbered streets along Z.

It works because Philadelphia is a planned grid: **94% of the exported
footprints land within 5 degrees of an axis, median offset 0.39 degrees.** The
bearing was derived from the street centrelines and is confirmed independently
by the buildings.

## Coordinates

Source data is Z-up, +X east, +Y north, metres from City Hall. Godot is Y-up
with -Z forward. The mapping is applied once, at export:

```
godot.x =  east
godot.y =  up
godot.z = -north
```

## What is real and what is inferred

**Real:** every footprint outline, every building height, every base
elevation, every street centreline and its width class, every landmark
address. All from `LI_BUILDING_FOOTPRINTS` and `Street_Centerline`.

**Inferred:** facade material. The survey gives one height per footprint and
nothing about the facade, so the builder bands by height - brick at rowhouse
scale, stone through the pre-war midrise, curtain wall above - and anything
more specific would be invention. Window rhythm, parapets, cornices and lit
windows are procedural, as in the shipped builder.

**Sourced separately:** the crowns. The LiDAR measures the dominant roof mass,
so a slender tower or spire returns too few points to register. Five buildings
therefore arrive short: City Hall as its 170 ft cornice rather than its 548 ft
tower. Their published architectural heights live in
`../data/philly-crowns.json` and export as extra rows flagged `crown: true`,
stacked on top of the measured mass, never replacing it. `_build_crown_tier`
draws them: no `_building_rects` entry, so a tier never blocks a spawn or a
pedestrian route at street level; material taken from the building below rather
than from the tier's own 24 m; and no punched windows on a spire.

The heights are sourced. The shape of the stack is not: tier widths read in
silhouette, and tiers are centred on the footprint, so City Hall's tower rises
from the middle of the block rather than over one portal.

**Not modelled:** roof shape. `approx_hgt` is a single number, so every
building is a flat-topped extrusion. See `../docs/SOURCES.md` for the full
table of where the survey understates a landmark.

## Landmarks

Prospect landmarks carry the spec homepage already built for that business:

```gdscript
var url := builder.landmark_site("reading_terminal")
# -> "philly-sites/reading-terminal/index.html"
```

which is what lets a mission reward open the real site for the business you
just saved.

## It has actually been run

`test/philly_smoke.gd` builds the district in a real headless Godot 4.2.2 and
asserts what comes out. The Node suite in `../test` only reads the exported JSON
and greps this GDScript; it executes nothing, so until this existed the builder
had never run at all.

```bash
cp scripts/philadelphia_world_builder.gd  <gtb>/godot/scripts/
cp data/philadelphia_*.json               <gtb>/godot/data/
cp test/philly_smoke.gd                   <gtb>/godot/
godot --headless --path <gtb>/godot --script philly_smoke.gd
```

Last run, Godot 4.2.2-stable: 22 checks passed. 462 MeshInstance3D and 462
StaticBody3D built in 247 ms, no mesh instance without a mesh, City Hall
44.7 m off the district centre where the projection puts it, 22 street axes,
both in-window prospects carrying their spec homepage.

Two things that run taught, which reading the code did not:

- `road_coords()` returns street AXIS coordinates, matching
  `District.ROAD_COORDS` in the shipped builder, not the road polylines. An
  840 m square of Penn's grid holds 22 of them.
- Only landmarks inside the 840 m window are exported, so the district carries
  City Hall plus two of the Philadelphia 25, not all 25.

Expect a wall of `Parameter "m" is null` from `mesh_get_surface_count`. That is
Godot's dummy renderer under `--headless`, one line per uniquely sized
`BoxMesh`, and it is not this builder: 462 identically sized boxes through stock
`civic_kit.box` produce one such line, 462 uniquely sized ones produce 462. Real
footprints are all different sizes, so `civic_kit`'s `box_mesh` cache never
hits. Quantising the sizes to reclaim it is not worth it either: 461 distinct
meshes only falls to 443 at a metre of rounding, so the cache is left alone.

## Regenerating

```bash
python3 ../tools/export_godot.py
```

Edit `CENTRE`, `HALF` and `MAX_BUILDINGS` at the top to move or resize the
district. The shipped GTB district is 248 m square; this one is 840 m.

`npm test` covers the export: frame declaration, physical plausibility, id
uniqueness, grid alignment, the real tower heights, road classes, landmark
sites, City Hall's position under the rotation, that every crown tier stacks on
a real building without gap or overlap and narrows as it rises, that City Hall
reaches exactly 548 ft above its own grade, and a guard that the GDScript only
calls `civic_kit` helpers and materials that actually exist.
