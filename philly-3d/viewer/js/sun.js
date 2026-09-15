// Solar position and cast shadows, ported from tools/solar.py and
// tools/shadow.py so the viewer and the offline renders agree.
'use strict';

const PHL_LAT = 39.952583;
const PHL_LON = -75.165222;

function julianDay(d) {
  let y = d.getUTCFullYear(), m = d.getUTCMonth() + 1;
  const day = d.getUTCDate() + d.getUTCHours() / 24
    + d.getUTCMinutes() / 1440 + d.getUTCSeconds() / 86400;
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1))
    + day + b - 1524.5;
}

// NOAA Solar Calculator (Meeus low-precision). Returns degrees; azimuth is
// measured clockwise from north.
function sunPosition(date, lat = PHL_LAT, lon = PHL_LON) {
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const t = (julianDay(date) - 2451545.0) / 36525.0;

  const l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const mr = m * rad;
  const c = Math.sin(mr) * (1.914602 - t * (0.004817 + 0.000014 * t))
    + Math.sin(2 * mr) * (0.019993 - 0.000101 * t)
    + Math.sin(3 * mr) * 0.000289;
  const trueLong = l0 + c;
  const omega = 125.04 - 1934.136 * t;
  const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(omega * rad);

  const e0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const e = e0 + 0.00256 * Math.cos(omega * rad);
  const decl = Math.asin(Math.sin(e * rad) * Math.sin(appLong * rad)) * deg;

  const yv = Math.tan((e / 2) * rad) ** 2;
  const ecc = 0.016708634;
  const eqTime = 4 * deg * (
    yv * Math.sin(2 * l0 * rad)
    - 2 * ecc * Math.sin(mr)
    + 4 * ecc * yv * Math.sin(mr) * Math.cos(2 * l0 * rad)
    - 0.5 * yv * yv * Math.sin(4 * l0 * rad)
    - 1.25 * ecc * ecc * Math.sin(2 * mr));

  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes()
    + date.getUTCSeconds() / 60;
  const trueSolar = (minutes + eqTime + 4 * lon + 1440) % 1440;
  let ha = trueSolar / 4 - 180;
  if (ha < -180) ha += 360;

  const latr = lat * rad, dr = decl * rad, har = ha * rad;
  let cosZ = Math.sin(latr) * Math.sin(dr)
    + Math.cos(latr) * Math.cos(dr) * Math.cos(har);
  cosZ = Math.max(-1, Math.min(1, cosZ));
  const zenith = Math.acos(cosZ) * deg;
  let elev = 90 - zenith;

  let az = 180;
  const den = Math.cos(latr) * Math.sin(zenith * rad);
  if (Math.abs(den) > 1e-9) {
    let ca = ((Math.sin(latr) * Math.cos(zenith * rad)) - Math.sin(dr)) / den;
    ca = Math.max(-1, Math.min(1, ca));
    const a = Math.acos(ca) * deg;
    az = ha > 0 ? (180 + a) % 360 : (540 - a) % 360;
  }

  if (elev < 85) {                                  // atmospheric refraction
    const te = Math.tan(elev * rad);
    let r;
    if (elev > 5) r = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
    else if (elev > -0.575) {
      r = 1735 + elev * (-518.2 + elev * (103.4 + elev * (-12.79 + elev * 0.711)));
    } else r = -20.772 / te;
    elev += r / 3600;
  }
  return { elevation: elev, azimuth: az };
}

// Unit vector pointing at the sun in the scene frame: +X east, +Y north, +Z up.
function sunVector(elevDeg, azDeg) {
  const e = elevDeg * Math.PI / 180, a = azDeg * Math.PI / 180;
  return [Math.cos(e) * Math.sin(a), Math.cos(e) * Math.cos(a), Math.sin(e)];
}

// Horizon sweep, same algorithm as tools/shadow.py. One running maximum across
// a height field replaces a per-face ray march, which matters because at low
// sun a 300 m tower shadows 4 km of city.
function shadowCeiling(height, w, h, cell, elevDeg, azDeg) {
  const el = elevDeg * Math.PI / 180, az = azDeg * Math.PI / 180;
  const sx = -Math.sin(az), sy = -Math.cos(az);       // away from the sun
  const out = new Float32Array(w * h);

  const alongX = Math.abs(sx) >= Math.abs(sy);
  const n = alongX ? w : h;
  const cross = alongX ? h : w;
  const slope = alongX ? sy / Math.abs(sx) : sx / Math.abs(sy);
  const forward = alongX ? sx > 0 : sy > 0;
  const drop = cell * Math.tan(el) * Math.sqrt(1 + slope * slope);

  const at = (i, j) => (alongX ? j * w + i : i * w + j);   // i along, j across
  let prev = new Float32Array(cross);
  let cur = new Float32Array(cross);

  for (let k = 0; k < n; k++) {
    const i = forward ? k : n - 1 - k;
    const shift = k === 0 ? 0
      : Math.round(slope * k) - Math.round(slope * (k - 1));
    for (let j = 0; j < cross; j++) {
      const hj = height[at(i, j)];
      if (k === 0) { cur[j] = hj; continue; }
      let src = j - shift * (forward ? 1 : -1);
      if (src < 0) src += cross; else if (src >= cross) src -= cross;
      const carried = prev[src] - drop;
      cur[j] = hj > carried ? hj : carried;
    }
    for (let j = 0; j < cross; j++) out[at(i, j)] = cur[j];
    const t = prev; prev = cur; cur = t;
  }
  return out;
}

globalThis.sunPosition = sunPosition;
globalThis.sunVector = sunVector;
globalThis.shadowCeiling = shadowCeiling;
globalThis.PHL_LAT = PHL_LAT;
globalThis.PHL_LON = PHL_LON;
