# PHLCITY3 binary format

A tiled, quantised container for city building massing. All integers are
little-endian.

Why not GeoJSON: 545,451 real footprints is roughly 277 MB of GeoJSON. The same
data here is 14.8 MB, or 27.1 bytes per building, and arrives pre-tiled so a
renderer can frustum-cull and stream without parsing the whole city first.

## Header, 64 bytes

| Offset | Type | Field |
|---:|---|---|
| 0 | char[8] | magic, `PHLCITY3` |
| 8 | uint32 | version, currently 3 |
| 12 | uint32 | flags, reserved |
| 16 | float64 | origin latitude |
| 24 | float64 | origin longitude |
| 32 | float32 | tile size, metres (1024) |
| 36 | float32 | quantisation step, metres (0.03125) |
| 40 | uint32 | tile count |
| 44 | uint32 | building count |
| 48 | int32 | min tile x |
| 52 | int32 | min tile y |
| 56 | int32 | max tile x |
| 60 | int32 | max tile y |

## Tile index, 20 bytes per tile

| Offset | Type | Field |
|---:|---|---|
| 0 | int32 | tile x |
| 4 | int32 | tile y |
| 8 | uint32 | building count in tile |
| 12 | uint32 | byte offset into the payload section |
| 16 | uint32 | compressed byte length |

## Payload

Concatenated zlib streams, one per tile. Each decompresses to a
struct-of-arrays, which compresses far better than interleaved records:

```
uint32              n
uint32[n]           objectid, delta-coded against the previous entry
uint16[n]           height above base, decimetres
int16[n]            base elevation, decimetres
uint16[n]           roof cap height above the flat top, decimetres (0 = flat roof)
uint8[n]            flags
uint8[n]            ring point count
int16[total_points] x, per-ring delta-coded
int16[total_points] y, per-ring delta-coded
```

### Roof field

`roof` is 0 for the large majority of buildings, which keep the flat-topped
extrusion this format has always drawn: `height` (from `approx_hgt`) is the
whole story. Where `max_hgt`, a second LiDAR height per footprint, exceeds
`approx_hgt` by more than the survey's own noise floor, `tools/build_dataset.py`
packs that gap here instead of folding it into `height`. A reader that sees
`roof[i] > 0` should draw a generated pitched cap from `height` up to
`height + roof`, not a taller flat box: the extra height is measured, the
pitched shape it takes is not. See docs/SOURCES.md.

Buildings within a tile are sorted by `objectid`, so the id deltas are small
and positive.

### Flags

| Bit | Meaning |
|---:|---|
| 1 | building has a name in the source data |
| 2 | landmark |
| 4 | point of interest |
| 8 | 120 ft or taller |
| 16 | height was estimated, not measured |

### Ring coordinates

Rings are open: the closing duplicate vertex is removed, and the reader wraps
from the last point back to the first.

Each ring stores its first point as an absolute value biased into int16 range
(`value - 32768`), then subsequent points as int16 deltas from the previous
point. To decode:

```
first += 32768
running = cumulative sum over the ring
metres = running * quant + coord_offset + tile_index * tile_size
```

`coord_offset` is -512.0 m, so tile-local coordinates span -512 to +1536 m.
That headroom lets a large building stay whole in the tile that contains its
centroid rather than being split across a boundary.

Quantisation is 1/32 m, giving a worst-case coordinate error of 1.56 cm per
axis. Footprints are simplified to 0.25 m before packing, so quantisation is
never the limiting factor. Verified by round-trip against the source GeoJSON:
748 of 748 buildings in the City Hall tile matched by id, worst error 2.18 cm
against a 2.21 cm theoretical bound.

### Winding

Ring winding in the source is inconsistent. Readers must compute the shoelace
signed area per ring and reverse the ring when it is negative, so that
counter-clockwise ordering can be assumed downstream. With CCW rings, a wall
quad `[bottom_j, bottom_j+1, top_j+1, top_j]` has an outward normal and a roof
n-gon in ring order faces +Z.
