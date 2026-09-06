# Real Philadelphia for Grand Theft Bureaucracy

A drop-in world builder that replaces the invented district with a real one:
449 building footprints at their LiDAR-measured heights and 216 street
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

**Not modelled:** roof shape. `approx_hgt` is a single number, so every
building is a flat-topped extrusion. City Hall reads as its 170 ft cornice,
not its 548 ft tower. See `../docs/SOURCES.md` for the full table of where the
survey understates a landmark.

## Landmarks

Prospect landmarks carry the spec homepage already built for that business:

```gdscript
var url := builder.landmark_site("reading_terminal")
# -> "philly-sites/reading-terminal/index.html"
```

which is what lets a mission reward open the real site for the business you
just saved.

## Regenerating

```bash
python3 ../tools/export_godot.py
```

Edit `CENTRE`, `HALF` and `MAX_BUILDINGS` at the top to move or resize the
district. The shipped GTB district is 248 m square; this one is 840 m.

`npm test` covers the export: frame declaration, physical plausibility, id
uniqueness, grid alignment, the real tower heights, road classes, landmark
sites, City Hall's position under the rotation, and a guard that the GDScript
only calls `civic_kit` helpers and materials that actually exist.
