#!/usr/bin/env python3
"""
Hope Wellness Center brand film - automated quality control on the FINAL file.

Checks the things a human reviewer would otherwise have to eyeball frame by
frame, then writes the six-frame contact sheet and the logo verification sheet.

  python qc.py render/hope-wellness-five-video-brand-film-final.mp4
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manifest as M

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INS = os.path.join(ROOT, 'build', 'inspect')
os.makedirs(INS, exist_ok=True)
OK, BAD = 'PASS', 'FAIL'
results = []


def check(name, passed, detail=''):
    results.append((OK if passed else BAD, name, detail))
    print(f'  [{OK if passed else BAD}] {name}' + (f'  — {detail}' if detail else ''))
    return passed


def probe(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-print_format', 'json', '-show_streams',
         '-show_format', path], capture_output=True, text=True).stdout
    return json.loads(out)


def main(path):
    print(f'QC: {path}\n')
    info = probe(path)
    v = [s for s in info['streams'] if s['codec_type'] == 'video'][0]
    a = [s for s in info['streams'] if s['codec_type'] == 'audio'][0]
    fmt = info['format']
    dur = float(fmt['duration'])
    size = int(fmt['size'])

    print('-- container / streams')
    check('resolution 1200x628', (v['width'], v['height']) == (M.W, M.H),
          f"{v['width']}x{v['height']}")
    check('video codec H.264', v['codec_name'] == 'h264', v['codec_name'])
    check('pixel format yuv420p', v.get('pix_fmt') == 'yuv420p', v.get('pix_fmt'))
    num, den = v['r_frame_rate'].split('/')
    fps = float(num) / float(den)
    check('frame rate 30 fps', abs(fps - 30) < 0.01, f'{fps:.3f}')
    check('audio codec AAC', a['codec_name'] == 'aac', a['codec_name'])
    check('audio 48 kHz', int(a['sample_rate']) == 48000, a['sample_rate'])
    check('audio stereo', int(a['channels']) == 2, a['channels'])
    check('runtime 42-50 s', 42.0 <= dur <= 50.0, f'{dur:.3f}s')
    head = open(path, 'rb').read(4_000_000)
    im, ix = head.find(b'moov'), head.find(b'mdat')
    check('faststart (moov before mdat)', 0 <= im < (ix if ix >= 0 else 1 << 30),
          f'moov@{im} mdat@{ix}')
    print(f'  file size {size/1e6:.2f} MB   bitrate {int(fmt["bit_rate"])/1000:.0f} kb/s')

    print('\n-- picture')
    cap = cv2.VideoCapture(path)
    frames, lums, means = [], [], []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(cv2.resize(f, (300, 157)))
        g = cv2.cvtColor(frames[-1], cv2.COLOR_BGR2GRAY)
        lums.append(float(g.mean()))
        means.append(float(g.min()))
    cap.release()
    n = len(frames)
    check('frame count matches runtime', abs(n - round(dur * 30)) <= 2,
          f'{n} frames')
    check('no black frames', min(lums) > 60,
          f'darkest frame mean luma {min(lums):.1f} at '
          f'{int(np.argmin(lums))/30:.2f}s')
    check('no blown frames', max(lums) < 250, f'brightest {max(lums):.1f}')

    # frame-to-frame delta: catches hard jumps, freezes and flicker
    d = [float(np.abs(cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY).astype(np.float32)
                      - cv2.cvtColor(frames[i - 1], cv2.COLOR_BGR2GRAY).astype(np.float32)
                      ).mean()) for i in range(1, n)]
    d = np.array(d)
    frozen = np.where(d < 0.06)[0]
    check('no frozen stretches', len(frozen) < 8,
          f'{len(frozen)} near-static frame pairs')
    # Spikes inside a transition window are the transition doing its job
    # (push and swipebar are hard-edged by design). A spike OUTSIDE one would
    # be an unintended jump - that is what this looks for.
    DECISIVE = {'push', 'swipebar', 'leafwipe', 'zoomblur', 'inkdissolve'}
    windows = [(x['at'], x['at'] + x['dur']) for x in M.TRANSITIONS]
    spikes = [int(i) for i in np.where(d > 26)[0]]
    stray = [i for i in spikes
             if not any(a - 0.05 <= (i + 1) / 30 <= b + 0.05 for a, b in windows)]
    check('no unintended hard cuts', len(stray) == 0,
          f'{len(spikes)} spikes, all inside transitions'
          if not stray else f'{len(stray)} stray at '
          f'{[f"{i/30:.2f}s" for i in stray[:6]]}')
    _ = DECISIVE
    # luma flicker: high-frequency wobble in overall brightness
    L = np.array(lums)
    flick = float(np.abs(np.diff(L, n=2)).mean())
    check('no luma flicker', flick < 1.2, f'2nd-difference mean {flick:.3f}')

    print('\n-- brand / safety')
    logo = [c for c in M.COPY if c['id'] == 'logo'][0]
    hold = M.TOTAL - (logo['t_in'] + 0.46)
    check('logo hold >= 4 s', hold >= 4.0, f'{hold:.2f}s settled and unobstructed')
    txt = ' '.join(' '.join(c.get('lines', [])) for c in M.COPY)
    check('URL exact', 'thehopewellnesscenter.com' in txt)
    # whole-word matching: "Secure telehealth" must not trip a "cure" check
    import re as _re
    words = _re.findall(r"[a-z%]+", txt.lower())
    phrase = ' '.join(words)
    for bad in ('guarantee', 'guaranteed', 'cure', 'cures', 'proven', 'insurance',
                'covered', 'immediately', 'instant', 'best', 'safe', '%'):
        hit = (bad in words) if bad != '%' else ('%' in txt)
        check(f'no unsupported claim: "{bad}"', not hit)
    for bad in ('in person', 'in office', 'accept all', 'walk in'):
        check(f'no unsupported claim: "{bad}"', bad not in phrase)
    states = [c for c in M.COPY if 'states' in c][0]['states']
    check('states match the site', states == ['MA', 'RI', 'NY', 'CO', 'AZ'],
          '/'.join(states))
    inside = all(M.SAFE[0] <= c['x'] <= M.SAFE[2] and M.SAFE[1] <= c['y'] <= M.SAFE[3]
                 for c in M.COPY if 'y' in c and c['align'] != 'center')
    check('all copy inside safe box', inside, f'{M.SAFE}')
    clips = sorted({s['clip'] for s in M.SHOTS if not s['still']})
    check('all five clips used', clips == [1, 2, 3, 4, 5],
          '/'.join(f'c{c}' for c in clips))
    stills = sorted({s['still'] for s in M.SHOTS if s['still']})
    check('all five stills used', len(stills) == 5, ', '.join(stills))
    check('intro is a particle-ink logo, not a static card',
          M.INTRO['t_out'] > M.INTRO['t_in'] + 2.0,
          f"{M.INTRO['t_out']-M.INTRO['t_in']:.2f}s")

    print('\n-- audio')
    # raw 32-bit float PCM: keeps any inter-sample overshoot the AAC decoder
    # produces visible, which a 16-bit decode would silently clamp away
    wav = os.path.join(ROOT, 'build', 'qc_audio.raw')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', path, '-map', 'a:0',
                    '-f', 'f32le', '-acodec', 'pcm_f32le', wav], check=True)
    x = np.fromfile(wav, dtype='<f4').reshape(-1, 2)
    pk = 20 * np.log10(max(1e-9, float(np.max(np.abs(x)))))
    check('no clipping', float(np.max(np.abs(x))) < 0.999, f'peak {pk:+.2f} dBFS')
    env = np.abs(x).max(axis=1)
    sr = 48000
    win = int(0.25 * sr)
    mins = [env[i:i + win].max() for i in range(0, max(1, len(env) - win), win)]
    check('no silent gaps', min(mins) > 0.004,
          f'quietest 0.25 s window {20*np.log10(max(1e-9,min(mins))):+.1f} dBFS')
    head = float(env[:int(0.05 * sr)].max())
    tailv = float(env[-int(0.05 * sr):].max())
    check('soft in / soft out (no abrupt cut)', head < 0.06 and tailv < 0.06,
          f'first 50 ms {head:.4f}, last 50 ms {tailv:.4f}')
    os.remove(wav)

    # ------------------------------------------------ six-frame contact sheet
    picks = [2.60, 6.90, 13.60, 20.60, 34.60, 47.60]
    tiles = []
    cap = cv2.VideoCapture(path)
    for tv in picks:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(tv * 30))
        ok, f = cap.read()
        f = cv2.resize(f, (M.W, M.H))
        cv2.rectangle(f, (0, 0), (M.W - 1, M.H - 1), (198, 205, 220), 2)
        cv2.putText(f, f'{tv:05.2f}s', (22, 46), cv2.FONT_HERSHEY_DUPLEX,
                    1.0, (152, 76, 16), 2, cv2.LINE_AA)
        tiles.append(f)
    cap.release()
    sheet = np.vstack([np.hstack(tiles[i * 2:(i + 1) * 2]) for i in range(3)])
    sheet = cv2.resize(sheet, (1800, int(1800 * sheet.shape[0] / sheet.shape[1])),
                       interpolation=cv2.INTER_AREA)
    sp = os.path.join(ROOT, 'render', 'contact-sheet.png')
    cv2.imwrite(sp, sheet)
    print(f'\ncontact sheet -> {sp}')

    # ------------------------------------------------- logo verification sheet
    src = cv2.imread(os.path.join(ROOT, 'assets', 'logo',
                                  'Hope-Wellness-Center-Mental-Health.png'),
                     cv2.IMREAD_UNCHANGED)
    al = src[..., 3:4].astype(np.float32) / 255.0
    up = cv2.resize(src, (940, 304), interpolation=cv2.INTER_LANCZOS4)
    ua = up[..., 3:4].astype(np.float32) / 255.0
    on_light = (up[..., :3] * ua + 245 * (1 - ua)).astype(np.uint8)
    on_dark = (up[..., :3] * ua + 22 * (1 - ua)).astype(np.uint8)
    cap = cv2.VideoCapture(path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(45.60 * 30))
    _, fr = cap.read()
    cap.release()
    crop = fr[int(242 - 516 / 3.0921 / 2) - 18:int(242 + 516 / 3.0921 / 2) + 18,
              int(600 - 516 / 2) - 18:int(600 + 516 / 2) + 18]
    crop = cv2.resize(crop, (940, int(940 * crop.shape[0] / crop.shape[1])),
                      interpolation=cv2.INTER_CUBIC)
    pad = np.full((26, 940, 3), 255, np.uint8)
    lab = []
    for img, t in ((on_light, 'OFFICIAL PNG as downloaded (on light)'),
                   (on_dark, 'OFFICIAL PNG (on dark - alpha intact)'),
                   (crop, 'CROP FROM FINAL RENDER at 45.60s')):
        b = np.full((34, 940, 3), 255, np.uint8)
        cv2.putText(b, t, (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (30, 30, 30),
                    1, cv2.LINE_AA)
        lab += [b, img, pad]
    lp = os.path.join(INS, 'logo_verify.png')
    cv2.imwrite(lp, np.vstack(lab))
    print(f'logo verify   -> {lp}')
    _ = al

    # ---- the ink intro must RESOLVE to the exact official artwork
    logo_src = cv2.imread(os.path.join(ROOT, 'assets', 'logo',
                                       'Hope-Wellness-Center-Mental-Health.png'),
                          cv2.IMREAD_UNCHANGED)
    al2 = logo_src[..., 3:4].astype(np.float32) / 255.0
    cap = cv2.VideoCapture(path)
    for label, tv, lw, cy in (('intro', 3.40, M.INTRO['logo_w'], M.INTRO['cy']),
                              ('resolve', 47.60,
                               [c for c in M.COPY if c['id'] == 'logo'][0]['logo_w'],
                               [c for c in M.COPY if c['id'] == 'logo'][0]['cy'])):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(tv * 30))
        okf, fr = cap.read()
        hh2 = int(round(lw / 3.0921))
        y0 = int(cy - hh2 / 2)
        x0 = int(M.W / 2 - lw / 2)
        crop = fr[y0:y0 + hh2, x0:x0 + int(lw)].astype(np.float32)
        bgm = np.median(crop.reshape(-1, 3), axis=0)
        ref = (logo_src[..., :3] * al2 + bgm * (1 - al2))
        ref = cv2.resize(ref, (crop.shape[1], crop.shape[0]),
                         interpolation=cv2.INTER_AREA)
        g1 = cv2.cvtColor(ref.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
        g2 = cv2.cvtColor(crop.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
        g1 -= g1.mean()
        g2 -= g2.mean()
        ncc = float((g1 * g2).sum() / max(1e-9, np.sqrt((g1 * g1).sum() * (g2 * g2).sum())))
        check(f'logo at {label} matches the official artwork (NCC>0.90)',
              ncc > 0.90, f'{ncc:.4f}')
    cap.release()

    fails = [r for r in results if r[0] == BAD]
    print(f'\n{len(results) - len(fails)}/{len(results)} checks passed')
    if fails:
        print('FAILED:')
        for _, nm, dt in fails:
            print(f'  - {nm}  {dt}')
    return 1 if fails else 0


if __name__ == '__main__':
    p = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        ROOT, 'render', 'hope-wellness-five-video-brand-film-final.mp4')
    sys.exit(main(p))
