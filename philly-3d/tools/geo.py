"""Local tangent-plane projection for Philadelphia.

Origin is Philadelphia City Hall (Broad & Market), the origin of the city's
own street-numbering grid. We use a local ENU (east-north-up) tangent plane
rather than Web Mercator so that 1 unit == 1 real metre everywhere in the
scene. Over the ~30 km extent of Philadelphia County the tangent-plane error
stays well under a metre, which is far below the resolution of the source
footprints.

WGS-84 ellipsoid constants.
"""
from __future__ import annotations

import math

# City Hall tower base. Source: City of Philadelphia street grid origin.
ORIGIN_LAT = 39.952583
ORIGIN_LON = -75.165222

_A = 6378137.0                 # WGS-84 semi-major axis, metres
_F = 1.0 / 298.257223563       # WGS-84 flattening
_E2 = _F * (2.0 - _F)          # first eccentricity squared

_lat0 = math.radians(ORIGIN_LAT)
_sin0 = math.sin(_lat0)
_cos0 = math.cos(_lat0)
_w = math.sqrt(1.0 - _E2 * _sin0 * _sin0)

# Prime-vertical and meridional radii of curvature at the origin latitude.
R_N = _A / _w                          # east-west
R_M = _A * (1.0 - _E2) / (_w ** 3)     # north-south

_M_PER_DEG_LON = math.radians(1.0) * R_N * _cos0
_M_PER_DEG_LAT = math.radians(1.0) * R_M

FEET_TO_M = 0.3048


def to_local(lon: float, lat: float) -> tuple[float, float]:
    """(lon, lat) degrees -> (x east, y north) metres from City Hall."""
    return ((lon - ORIGIN_LON) * _M_PER_DEG_LON,
            (lat - ORIGIN_LAT) * _M_PER_DEG_LAT)


def to_lonlat(x: float, y: float) -> tuple[float, float]:
    """Inverse of to_local."""
    return (ORIGIN_LON + x / _M_PER_DEG_LON,
            ORIGIN_LAT + y / _M_PER_DEG_LAT)


def meters_per_degree() -> tuple[float, float]:
    return _M_PER_DEG_LON, _M_PER_DEG_LAT


if __name__ == "__main__":
    print(f"m/deg lon = {_M_PER_DEG_LON:.4f}")
    print(f"m/deg lat = {_M_PER_DEG_LAT:.4f}")
    # Sanity: Comcast Center, 1701 JFK Blvd
    print("Comcast Center ->", [round(v, 1) for v in to_local(-75.16899, 39.95446)])
    # Round trip
    x, y = to_local(-75.2, 40.05)
    print("roundtrip err deg:", to_lonlat(x, y)[0] + 75.2, to_lonlat(x, y)[1] - 40.05)
