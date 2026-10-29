"""build_card.py -> the two Works / cover card images of the Sticker Sheet folder, from the current stickers (work/sticker-0N.png)

  public/works/illustration/thumb.webp   720 x 900   four stickers piled on the cream paper, each on its white backing with a soft shadow,
                                                      the top-left one with its corner peeling up (the same look as the baked sheet)
  public/works/illustration/peek.webp    430 x 632   sticker 06 (the detective) with a white die-cut border, transparent around

Uses the helpers of the sheet builder (sheetlib / peel / shapes). Run from anywhere:  python -X utf8 art-src/illustration/sheet/build_card.py
Layout: PILE below (sticker number, centre on the 1440 x 1800 working canvas, angle in degrees clockwise, scale, peel), drawn bottom to top."""
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from sheetlib import *  # noqa: E402,F401  (gblur, erode, dilate, place_sticker, backing_mask, load_premult, WORK)
from peel import peel  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'public', 'works', 'illustration')

W, H = 1440, 1800  # working canvas, shown at half size (720 x 900)
CREAM = np.array([255, 239, 223], np.float32) / 255
WHITE = np.array([255, 254, 250], np.float32) / 255
BROWN = np.array([74, 44, 24], np.float32) / 255
CUT = np.array([140, 100, 66], np.float32) / 255
R_BACK, SMOOTH = 19, 7
SHADOWS = [(3.0, 1.5, 3.0, 0.30), (9.0, 4.0, 9.0, 0.17), (26.0, 8.0, 22.0, 0.20)]  # (sigma, dx, dy, alpha)
PEEL_SHADOWS = [(1.8, 1.0, 2.5, 0.30), (6.0, 3.0, 7.0, 0.22)]

# bottom to top: the two upper stickers first, the two lower ones over them
PILE = [
    dict(n=7, c=(360, 520), angle=-2.0, scale=0.60, peel=dict(ang=45, depth=150)),
    dict(n=1, c=(1060, 470), angle=3.0, scale=0.60),
    dict(n=4, c=(380, 1290), angle=-3.0, scale=0.60),
    dict(n=5, c=(1060, 1230), angle=4.0, scale=0.60),
]


def shift(a, dx, dy):
    h, w = a.shape[:2]
    out = np.zeros_like(a)
    dx, dy = int(round(dx)), int(round(dy))
    ys, xs = slice(max(0, dy), h + min(0, dy)), slice(max(0, dx), w + min(0, dx))
    yd, xd = slice(max(0, -dy), h + min(0, -dy)), slice(max(0, -dx), w + min(0, -dx))
    out[ys, xs] = a[yd, xd]
    return out


def window(c, w, h):
    ox, oy = int(round(c[0] - w / 2)), int(round(c[1] - h / 2))
    ys, xs = slice(max(0, oy), min(H, oy + h)), slice(max(0, ox), min(W, ox + w))
    return ys, xs, slice(ys.start - oy, ys.stop - oy), slice(xs.start - ox, xs.stop - ox)


def thumb():
    rng = np.random.default_rng(7)
    fine = gblur(rng.normal(0, 1, (H, W)).astype(np.float32), 0.6)
    low = gblur(rng.normal(0, 1, (H, W)).astype(np.float32), 40.0)
    fine = (fine - fine.mean()) / (fine.std() + 1e-9)
    low = (low - low.mean()) / (low.std() + 1e-9)
    paper = 1 + 0.007 * fine + 0.006 * low
    canvas = (CREAM[None, None, :] * paper[..., None]).astype(np.float32)
    for it in PILE:
        pm = load_premult(os.path.join(WORK, 'sticker-%02d.png' % it['n']))
        S = place_sticker(pm, it['scale'], it['angle'], pad=110)
        B = backing_mask(S[..., 3], R_BACK, SMOOTH)
        h, w = B.shape
        ys, xs, wy, wx = window(it['c'], w, h)
        # the shadow this sheet casts on whatever is under it
        a_i = np.zeros_like(B)
        for sig, dx, dy, al in SHADOWS:
            s_ = al * shift(gblur(B, sig), dx, dy)
            a_i = 1 - (1 - a_i) * (1 - s_)
        reg = canvas[ys, xs]
        sa = a_i[wy, wx, None]
        reg = reg * (1 - sa) + (BROWN[None, None, :] * paper[ys, xs, None]) * sa
        # the white backing, its cut line, the vinyl-edge shadow, then the sticker
        pl = it.get('peel')
        if pl:
            S, flap_rgb, flapA, flap_edge = peel(S, pl['ang'], pl['depth'])
        alpha = S[..., 3]
        inner = erode(B, 2)
        cut = np.clip(B - inner, 0, 1) * 0.30
        m = (alpha > 0.5).astype(np.float32)
        ring = np.clip(shift(gblur(m, 1.8), 1.2, 2.2) - m, 0, 1) * 0.24 * B
        b = B[wy, wx, None]
        white = np.minimum(1.0, WHITE[None, None, :] * (1 + 0.5 * (paper[ys, xs, None] - 1)))
        reg = reg * (1 - b) + white * b
        c_ = cut[wy, wx, None]
        reg = reg * (1 - c_) + CUT * c_
        r_ = ring[wy, wx, None]
        reg = reg * (1 - r_) + BROWN * r_
        a_ = alpha[wy, wx, None]
        reg = reg * (1 - a_) + S[wy, wx, :3]
        if pl:
            for sig, dx, dy, al in PEEL_SHADOWS:
                s_ = (al * shift(gblur(flapA, sig), dx, dy))[wy, wx, None] * b
                reg = reg * (1 - s_) + BROWN * s_
            f_ = flapA[wy, wx, None]
            reg = reg * (1 - f_) + flap_rgb[wy, wx] * f_
            e_ = flap_edge[wy, wx, None] * 0.32
            reg = reg * (1 - e_) + CUT * e_
        canvas[ys, xs] = reg
    out = Image.fromarray((np.clip(canvas, 0, 1) * 255 + 0.5).astype(np.uint8)).resize((720, 900), Image.LANCZOS)
    out.save(os.path.join(OUT, 'thumb.webp'), 'WEBP', quality=84, method=6)
    print('thumb.webp', out.size, os.path.getsize(os.path.join(OUT, 'thumb.webp')) // 1024, 'KB')


def peek():
    """sticker 06 with a white die-cut border (the white backing of the sheet), transparent around, fitted into 430 x 632"""
    src = Image.open(os.path.join(WORK, 'sticker-06.png')).convert('RGBA')
    al = np.asarray(src.getchannel('A'))
    ys, xs = np.where(al > 90)
    src = src.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    border = 24  # px at the source scale, about 11 px on the final peek
    pad = border + 8
    big = Image.new('RGBA', (src.width + 2 * pad, src.height + 2 * pad), (0, 0, 0, 0))
    big.alpha_composite(src, (pad, pad))
    a = np.asarray(big.getchannel('A')).astype(np.float32) / 255
    backing = backing_mask(a, border, SMOOTH)
    pm = big.convert('RGBa')
    white = np.zeros(a.shape + (4,), np.float32)
    white[..., :3] = WHITE
    white[..., 3] = backing
    layer = Image.fromarray((white * 255 + 0.5).astype(np.uint8), 'RGBA')
    layer.alpha_composite(big)
    k = min(430 / layer.width, 632 / layer.height)
    size = (round(layer.width * k), round(layer.height * k))
    res = layer.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')
    canvas = Image.new('RGBA', (430, 632), (0, 0, 0, 0))
    canvas.alpha_composite(res, ((430 - size[0]) // 2, (632 - size[1]) // 2))
    canvas.save(os.path.join(OUT, 'peek.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
    print('peek.webp', canvas.size, os.path.getsize(os.path.join(OUT, 'peek.webp')) // 1024, 'KB')


if __name__ == '__main__':
    thumb()
    peek()
