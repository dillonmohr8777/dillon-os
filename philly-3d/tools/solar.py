"""NOAA solar position for Philadelphia, so the shadows in a render fall where
they actually fell.

Implements the NOAA Solar Calculator equations (Meeus, low-precision form),
which are good to about 0.01 degrees for dates near the present - far better
than the sun disc is wide, and therefore invisible in a render.
"""
from __future__ import annotations

import datetime as _dt
import math

LAT = 39.952583
LON = -75.165222


def _julian_day(dt_utc: _dt.datetime) -> float:
    y, m = dt_utc.year, dt_utc.month
    d = (dt_utc.day + dt_utc.hour / 24 + dt_utc.minute / 1440
         + dt_utc.second / 86400)
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + a // 4
    return math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + d + b - 1524.5


def sun_position(dt_utc: _dt.datetime, lat: float = LAT, lon: float = LON):
    """-> (elevation_deg, azimuth_deg) with azimuth measured clockwise from north."""
    jd = _julian_day(dt_utc)
    t = (jd - 2451545.0) / 36525.0

    l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360.0
    m = 357.52911 + t * (35999.05029 - 0.0001537 * t)
    mrad = math.radians(m)
    c = (math.sin(mrad) * (1.914602 - t * (0.004817 + 0.000014 * t))
         + math.sin(2 * mrad) * (0.019993 - 0.000101 * t)
         + math.sin(3 * mrad) * 0.000289)
    true_long = l0 + c
    omega = 125.04 - 1934.136 * t
    app_long = true_long - 0.00569 - 0.00478 * math.sin(math.radians(omega))

    e0 = (23 + (26 + ((21.448 - t * (46.815 + t * (0.00059 - t * 0.001813)))) / 60) / 60)
    e = e0 + 0.00256 * math.cos(math.radians(omega))

    decl = math.degrees(math.asin(math.sin(math.radians(e))
                                  * math.sin(math.radians(app_long))))

    y = math.tan(math.radians(e / 2)) ** 2
    eq_time = 4 * math.degrees(
        y * math.sin(2 * math.radians(l0))
        - 2 * 0.016708634 * math.sin(mrad)
        + 4 * 0.016708634 * y * math.sin(mrad) * math.cos(2 * math.radians(l0))
        - 0.5 * y * y * math.sin(4 * math.radians(l0))
        - 1.25 * 0.016708634 ** 2 * math.sin(2 * mrad))

    minutes = dt_utc.hour * 60 + dt_utc.minute + dt_utc.second / 60
    true_solar = (minutes + eq_time + 4 * lon) % 1440
    ha = true_solar / 4 - 180 if true_solar / 4 >= -180 else true_solar / 4 + 180
    if ha < -180:
        ha += 360

    latr, declr, har = map(math.radians, (lat, decl, ha))
    cos_z = (math.sin(latr) * math.sin(declr)
             + math.cos(latr) * math.cos(declr) * math.cos(har))
    cos_z = max(-1.0, min(1.0, cos_z))
    zenith = math.degrees(math.acos(cos_z))
    elev = 90.0 - zenith

    if abs(math.cos(math.radians(zenith))) < 1.0:
        den = math.cos(latr) * math.sin(math.radians(zenith))
        if abs(den) > 1e-9:
            ca = ((math.sin(latr) * math.cos(math.radians(zenith))) - math.sin(declr)) / den
            ca = max(-1.0, min(1.0, ca))
            az = math.degrees(math.acos(ca))
            az = (180 + az) % 360 if ha > 0 else (540 - az) % 360
        else:
            az = 180.0
    else:
        az = 180.0

    # atmospheric refraction near the horizon
    if elev < 85:
        te = math.tan(math.radians(elev))
        if elev > 5:
            r = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5
        elif elev > -0.575:
            r = 1735 + elev * (-518.2 + elev * (103.4 + elev * (-12.79 + elev * 0.711)))
        else:
            r = -20.772 / te
        elev += r / 3600.0
    return elev, az


def blender_sun_rotation(elev_deg: float, az_deg: float):
    """Blender sun rotation_euler (XYZ) for an elevation/azimuth pair.

    A Blender sun with zero rotation emits along -Z. Under Euler XYZ
    (rx, 0, rz) the emission direction is

        (-cos(e) sin(rz),  cos(e) cos(rz),  -sin(e))     with rx = 90 - e

    so the direction *toward* the sun is (cos e sin rz, -cos e cos rz, sin e).
    In this scene +X is east and +Y is north, so toward-sun must equal
    (cos e sin A, cos e cos A, sin e) for compass azimuth A. Matching terms
    gives sin(rz) = sin A and cos(rz) = -cos A, hence rz = 180 - A.
    """
    return (math.radians(90.0 - elev_deg), 0.0, math.radians(180.0 - az_deg))


def nishita_sun_rotation(az_deg: float) -> float:
    """Blender Sky Texture (Nishita) sun_rotation, radians.

    That node measures azimuth counter-clockwise from +X, while compass
    azimuth runs clockwise from +Y, so the two differ by theta = 90 - A.
    """
    return math.radians(90.0 - az_deg)


if __name__ == "__main__":
    # Sanity: Philadelphia sunset on 2026-09-06 is 19:22 EDT (23:22 UTC).
    for hhmm in ("22:00", "23:00", "23:15", "23:22", "23:30"):
        h, mnt = map(int, hhmm.split(":"))
        e, a = sun_position(_dt.datetime(2026, 9, 6, h, mnt))
        print(f"2026-09-06 {hhmm} UTC  elev {e:7.3f}  az {a:7.2f}")
    print()
    # Summer solstice local noon should be near the annual maximum (~73.5 deg).
    e, a = sun_position(_dt.datetime(2026, 6, 21, 17, 1))
    print(f"solstice local noon  elev {e:.2f} (expect ~73.5)  az {a:.1f} (expect ~180)")
    e, a = sun_position(_dt.datetime(2026, 12, 21, 17, 1))
    print(f"winter   local noon  elev {e:.2f} (expect ~26.6)  az {a:.1f}")
