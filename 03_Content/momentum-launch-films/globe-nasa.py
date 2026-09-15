#!/usr/bin/env python3
"""Photoreal rotating Earth from real NASA public-domain satellite imagery.

Written for the Momentum launch films after Dillon rejected the stylised dotted
sphere: "I want a realistic world ... as realistic, but, like, still professional,
animated."  This does not render an illustration of a planet — it projects actual
VIIRS night-lights and Blue Marble daylight mosaics onto a sphere, so what you see
is photography.

Run it in the Higgsfield sandbox (numpy + Pillow are preinstalled).  At SZ=1000 it
renders roughly one frame per second, so the 240-frame default needs about four
minutes: launch it with background:true and poll the log.

    curl -sSLO https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg
    curl -sSLO https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg
    python3 globe-nasa.py
    ffmpeg -framerate 30 -i fr/%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 4M globe.webm

The webm carries alpha, so it composites over any background in higgsedit.
"""

import math
import os

import numpy as np
from PIL import Image, ImageFilter

SZ = 1000                            # output square, px
R = SZ * 0.375                       # globe radius, px
FR = 240                             # frames (8 s at 30 fps)
LAT0 = 22.0                          # camera latitude — puts North America high in frame
LON_START, LON_SWEEP = -55.0, 42.0   # US east coast centred, slow drift

night = np.asarray(
    Image.open('dnb_land_ocean_ice.2012.3600x1800.jpg').convert('RGB')
).astype(np.float32) / 255.0
day = np.asarray(
    Image.open('world.topo.bathy.200412.3x5400x2700.jpg')
    .convert('RGB').resize((3600, 1800), Image.LANCZOS)
).astype(np.float32) / 255.0
MH, MW = night.shape[0], night.shape[1]

# ---- orthographic projection, solved once for the whole grid ----------------
yy, xx = np.mgrid[0:SZ, 0:SZ].astype(np.float32)
X = (xx - SZ / 2) / R
Y = -(yy - SZ / 2) / R
rho = np.sqrt(X * X + Y * Y)
disc = rho <= 1.0
rho_s = np.where(disc, np.clip(rho, 1e-6, 1.0), 1.0)
c = np.arcsin(np.clip(rho_s, 0, 1))
sin_c, cos_c = np.sin(c), np.cos(c)
lat0 = math.radians(LAT0)
lat = np.arcsin(np.clip(
    cos_c * math.sin(lat0) + (Y * sin_c * math.cos(lat0)) / rho_s, -1, 1))
lon_off = np.arctan2(
    X * sin_c, rho_s * cos_c * math.cos(lat0) - Y * sin_c * math.sin(lat0))

# surface normal, for a real terminator rather than a flat cutout
nz = np.sqrt(np.clip(1.0 - rho * rho, 0, 1))
L = np.array([-0.45, 0.35, 0.82])
L = L / np.linalg.norm(L)
lam = np.clip(X * L[0] + Y * L[1] + nz * L[2], 0, 1)


def sample(mp, la, lo):
    """Bilinear sample of an equirectangular map at lat/lon arrays."""
    v = (0.5 - la / math.pi) * (MH - 1)
    u = ((lo / (2 * math.pi)) % 1.0) * (MW - 1)
    u0, v0 = np.floor(u).astype(np.int32), np.floor(v).astype(np.int32)
    u1, v1 = (u0 + 1) % MW, np.clip(v0 + 1, 0, MH - 1)
    fu, fv = (u - u0)[..., None], (v - v0)[..., None]
    return (mp[v0, u0] * (1 - fu) * (1 - fv) + mp[v0, u1] * fu * (1 - fv) +
            mp[v1, u0] * (1 - fu) * fv + mp[v1, u1] * fu * fv)


# atmosphere: a soft blue shell just outside the limb, plus a tight rim
halo = np.clip((rho - 0.995) / 0.16, 0, 1)
halo = np.exp(-halo * 3.2) * (rho > 0.985)
rim = np.exp(-np.clip((rho - 1.0) / 0.045, 0, 6) ** 2) * (rho > 0.96)

os.makedirs('fr', exist_ok=True)
for f in range(FR):
    lon0 = math.radians(LON_START + LON_SWEEP * (f / (FR - 1)))
    lon = lon0 + lon_off
    nite = sample(night, lat, lon)
    dayc = sample(day, lat, lon)
    lamb = lam[..., None]

    # daylit hemisphere, falling off naturally toward the terminator
    surf = dayc * (0.18 + 0.92 * lamb)
    # night side: city lights, warm, only where the sun is not
    nightmask = np.clip(1.0 - lamb * 2.6, 0, 1)
    lights = np.clip(nite * 1.35, 0, 1) * nightmask
    rgb = np.clip(surf + lights * np.array([1.0, 0.86, 0.62]), 0, 1)

    rgb *= (0.55 + 0.45 * np.clip(nz, 0, 1))[..., None]          # limb darkening
    atmo = (np.stack([halo * 0.16, halo * 0.42, halo * 0.95], -1) +
            np.stack([rim * 0.30, rim * 0.62, rim * 1.0], -1) * 0.9)
    rgb = np.clip(rgb + atmo, 0, 1)

    a = np.clip(disc.astype(np.float32) + halo * 0.85 + rim * 0.9, 0, 1)
    im = Image.fromarray((np.dstack([rgb, a]) * 255).astype(np.uint8), 'RGBA')
    im = Image.alpha_composite(im.filter(ImageFilter.GaussianBlur(9)), im)  # bloom
    im.save(f'fr/{f:04d}.png')

print('frames done')
