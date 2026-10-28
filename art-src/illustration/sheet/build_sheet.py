"""build_sheet.py [layout.json] [out.png] -> the finished 2400 x 3200 die-cut sticker sheet (lossless PNG in work/)

How the sheet is made (numpy + Pillow, no scipy: pip install numpy pillow):
  1. node art-src/illustration/sheet/render-stickers.mjs      sticker-0N.svg -> work/sticker-0N.png (1200 x 1600, transparent)
  2. python art-src/illustration/sheet/layout_run.py layout.json     optional: re-relax the positions (-> work/layout.out.json)
  3. python art-src/illustration/sheet/build_sheet.py [layout.json]  -> work/sheet.png (about 3 minutes the first time, shapes are cached)
  4. python art-src/illustration/sheet/finalize.py                   -> public/works/illustration/art/{sheet,thumb}.webp, manifest.json, sheet-layout.json
layout.json holds the final positions ("c" = window centre in sheet px), rotations (degrees clockwise), per-sticker scale multipliers,
the peeled corner of sticker 07 and the "look" (shadows, paper).

Layers, bottom to top: cream paper (grain + mottle + vignette) -> table shadows of every backing sheet -> white backing sheets with a
cut line -> vinyl-edge shadow on the backing -> the stickers themselves (premultiplied, exact pixels of the approved art)."""
import os, sys, json, time
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shapes import *
from peel import peel

CREAM = np.array([255, 239, 223], np.float32) / 255
WHITE = np.array([255, 254, 250], np.float32) / 255
BROWN = np.array([74, 44, 24], np.float32) / 255
CUT = np.array([140, 100, 66], np.float32) / 255

LOOK = dict(
    cut_a=0.30, cut_w=1.6, edge_a=0.24,
    shadows=[(3.0, 1.5, 3.0, 0.30), (9.0, 4.0, 9.0, 0.17), (26.0, 8.0, 22.0, 0.20)],   # (sigma, dx, dy, alpha)
    grain=0.007, mottle=0.007, vignette=0.035, seed=7,
    peel_shadows=[(1.8, 1.0, 2.5, 0.30), (6.0, 3.0, 7.0, 0.22)],
)

cfgp = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'layout.json')
outp = sys.argv[2] if len(sys.argv) > 2 else os.path.join(WORK, 'sheet.png')
os.makedirs(os.path.dirname(os.path.abspath(outp)), exist_ok=True)
cfg = json.load(open(cfgp))
LOOK.update(cfg.get('look', {}))
W, H = cfg['W'], cfg['H']
t0 = time.time()


def shift(a, dx, dy):
    h, w = a.shape[:2]
    out = np.zeros_like(a)
    dx, dy = int(round(dx)), int(round(dy))
    ys, xs = slice(max(0, dy), h + min(0, dy)), slice(max(0, dx), w + min(0, dx))
    yd, xd = slice(max(0, -dy), h + min(0, -dy)), slice(max(0, -dx), w + min(0, -dx))
    out[ys, xs] = a[yd, xd]
    return out


def norm(a):
    a = a - a.mean()
    return (a / (a.std() + 1e-9)).astype(np.float32)


# ---------------------------------------------------------------- paper
rng = np.random.default_rng(LOOK['seed'])
fine = norm(gblur(rng.normal(0, 1, (H, W)).astype(np.float32), 0.6))
mid = norm(gblur(rng.normal(0, 1, (H, W)).astype(np.float32), 5.0))
low = norm(gblur(rng.normal(0, 1, (H, W)).astype(np.float32), 40.0))
paper = 1 + LOOK['grain'] * fine + LOOK['mottle'] * (0.6 * mid + 0.8 * low)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r2 = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
vig = 1 - LOOK['vignette'] * (r2 / 2.0)
canvas = (CREAM[None, None, :] * (paper * vig)[..., None]).astype(np.float32)
print('paper', round(time.time() - t0, 1), flush=True)

# ---------------------------------------------------------------- shapes
shapes, cs = [], []
for it in cfg['items']:
    s = cfg['scale'] * it.get('mult', 1.0)
    shapes.append(Shape(it['n'], s, it['angle'], cfg['r_back'], cfg['smooth']))
    cs.append(it['c'])
print('shapes', round(time.time() - t0, 1), flush=True)

wins = []
for sh, c in zip(shapes, cs):
    ox, oy = int(round(c[0] - sh.w / 2)), int(round(c[1] - sh.h / 2))
    ys, xs = slice(max(0, oy), min(H, oy + sh.h)), slice(max(0, ox), min(W, ox + sh.w))
    wy, wx = slice(ys.start - oy, ys.stop - oy), slice(xs.start - ox, xs.stop - ox)
    wins.append((ys, xs, wy, wx))

# ---------------------------------------------------------------- shadows on the table (union of all sheets)
sa = np.zeros((H, W), np.float32)
for sh, (ys, xs, wy, wx) in zip(shapes, wins):
    B = sh.B
    a_i = np.zeros_like(B)
    for sig, dx, dy, al in LOOK['shadows']:
        s_ = al * shift(gblur(B, sig), dx, dy)
        a_i = 1 - (1 - a_i) * (1 - s_)
    sa[ys, xs] = 1 - (1 - sa[ys, xs]) * (1 - a_i[wy, wx])
canvas = canvas * (1 - sa[..., None]) + (BROWN[None, None, :] * paper[..., None]) * sa[..., None]
print('shadows', round(time.time() - t0, 1), flush=True)

# ---------------------------------------------------------------- backing sheets, cut lines, vinyl edge, stickers
for it, sh, (ys, xs, wy, wx) in zip(cfg['items'], shapes, wins):
    B, S = sh.B, sh.S
    pl = it.get('peel')
    if pl:
        S, flap_rgb, flapA, flap_edge = peel(S, pl['ang'], pl['depth'])
    alpha = S[..., 3]
    inner = erode(B, max(1, round(LOOK['cut_w'])))
    cut = np.clip(B - inner, 0, 1) * LOOK['cut_a']
    m = (alpha > 0.5).astype(np.float32)
    ring = np.clip(shift(gblur(m, 1.8), 1.2, 2.2) - m, 0, 1) * LOOK['edge_a'] * B
    reg = canvas[ys, xs]
    b = B[wy, wx, None]
    white = np.minimum(1.0, WHITE[None, None, :] * (1 + 0.5 * (paper[ys, xs, None] - 1)))
    reg = reg * (1 - b) + white * b
    c_ = cut[wy, wx, None]
    reg = reg * (1 - c_) + CUT * c_
    r_ = ring[wy, wx, None]
    reg = reg * (1 - r_) + BROWN * r_
    a_ = alpha[wy, wx, None]
    reg = reg * (1 - a_) + S[wy, wx, :3]
    if pl:   # the lifted corner: its shadow on the sticker, then the white back of the vinyl with a paper edge
        for sig, dx, dy, al in LOOK['peel_shadows']:
            s_ = (al * shift(gblur(flapA, sig), dx, dy))[wy, wx, None] * b
            reg = reg * (1 - s_) + BROWN * s_
        f_ = flapA[wy, wx, None]
        reg = reg * (1 - f_) + flap_rgb[wy, wx] * f_
        e_ = flap_edge[wy, wx, None] * 0.32
        reg = reg * (1 - e_) + CUT * e_
    canvas[ys, xs] = reg
print('composite', round(time.time() - t0, 1), flush=True)

out = Image.fromarray((np.clip(canvas, 0, 1) * 255 + 0.5).astype(np.uint8))
out.save(outp)
print('saved', outp, out.size, round(time.time() - t0, 1), 's')
