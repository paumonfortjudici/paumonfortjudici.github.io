"""Files the nine Sticker Sheet characters (ST-01..ST-09, drawn on flat cream with a die-cut halo of their accent colour) into the site.

For each image:
  1. the background is the cream connected to the border (a flood fill, NOT a colour key: the figures carry cream details of their own, soles, a
     muzzle, a sock stripe, and those must stay opaque);
  2. the halo colour is read from the ring just inside the border; the edge pixels get alpha from how much halo / cream they mix, and the colour
     of the halo exactly;
  3. every accent-coloured pixel (the halo, the skin, the clothes, whatever lighter or darker tone the model drifted to) is set to the exact
     accent hex of the sticker, keeping the antialiasing between ink and fill; ink (#17101B) and cream details are left alone;
  4. a cream pocket enclosed by the figure and bordered by the halo (a gap between an arm and the body that the halo did not fill) is cut out;
  5. the figure is trimmed and fitted into the frame the previous sticker occupied (FRAME below), centred in it, on a 1200 x 1600 transparent
     canvas, so the sizes on the sheet and the physics keep working (Sticker `mult` / `k` in src/worlds/illustration/data.ts).
Writes public/works/illustration/art/sticker-0N.webp (1200 x 1600) and thumb-0N.webp (300 x 400), and the lossless PNGs the sheet builder reads
(art-src/illustration/sheet/work/sticker-0N.png). Afterwards: `python -I -X utf8 src/worlds/illustration/tools/build-shapes.py`.

    python tools/ingest_stickers.py <folder holding ST-01.png .. ST-09.png> [--list]

--list only reports what it finds (the halo colour, the pockets) and writes nothing. Needs Pillow and numpy.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'public', 'works', 'illustration', 'art')
WORK = os.path.join(ROOT, 'art-src', 'illustration', 'sheet', 'work')

HEX = {1: '#C6B1FE', 2: '#FFA65F', 3: '#85CEF9', 4: '#8EEBC3', 5: '#FCE67A', 6: '#FE7D6C', 7: '#FF9FC5', 8: '#66CBC7', 9: '#C5EB7C'}
INK = np.array([23.0, 16.0, 27.0])
# the box (x0, y0, x1, y1 on the 1200 x 1600 canvas) the previous art of each sticker occupied
FRAME = {
    1: (67, 76, 1133, 1525), 2: (132, 86, 1069, 1516), 3: (121, 77, 1069, 1526), 4: (89, 86, 1111, 1514), 5: (103, 72, 1092, 1521),
    6: (122, 67, 1101, 1532), 7: (66, 93, 1136, 1506), 8: (64, 78, 1136, 1523), 9: (66, 66, 1128, 1533),
}
OFF_LINE = 18.0  # a pixel this far (RGB) from the cream-to-ink line is accent: cream details and their ink antialiasing lie on that line,
#                  accent does not, even when the model painted it pale (a washed-out mint is still 40 away)
SAT_RING = 0.20  # the halo colour is read from ring pixels more saturated than this
GRID = 4  # the pockets are searched on a quarter-size map
POCKET_MIN = 700  # px on the full-size image: smaller cream areas are details of the figure
HOLE_BORDER = 0.72  # a pocket is a hole when this share of its border is accent colour (a detail is bordered by ink)


def hex_rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float64)


def sat(a):
    mx = a.max(axis=-1)
    return (mx - a.min(axis=-1)) / np.maximum(mx, 1)


def luma(a):
    return a @ np.array([0.299, 0.587, 0.114])


def off_line(a, bg):
    """distance of every pixel from the straight line between the cream and the ink"""
    d = INK - bg
    u = a - bg
    r = (u @ d) / (d @ d)
    return np.linalg.norm(u - r[..., None] * d, axis=-1)


def label(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and lab[y, x] == 0:
                n += 1
                lab[y, x] = n
                stack = [(y, x)]
                while stack:
                    cy, cx = stack.pop()
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and lab[ny, nx] == 0:
                            lab[ny, nx] = n
                            stack.append((ny, nx))
    return lab, n


def grow(mask, r):
    """square dilation of a boolean mask by r px"""
    return np.asarray(Image.fromarray(mask.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(2 * r + 1))) > 0


def process(path, n, list_only):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float64)
    h, w = a.shape[:2]
    m = max(6, int(min(h, w) * 0.005))
    edge = np.concatenate([a[:m].reshape(-1, 3), a[-m:].reshape(-1, 3), a[:, :m].reshape(-1, 3), a[:, -m:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)

    # 1. the cream connected to the border
    marker = im.copy()
    for xy in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)):
        ImageDraw.floodfill(marker, xy, (255, 0, 255), thresh=40)
    mk = np.asarray(marker).astype(int)
    outside = (mk[:, :, 0] == 255) & (mk[:, :, 1] == 0) & (mk[:, :, 2] == 255)

    # 2. the halo colour, from the ring 10 to 22 px inside the edge
    ring = grow(outside, 22) & ~grow(outside, 10)
    px = a[ring]
    keep = (sat(px) > SAT_RING) & (luma(px) > 100)
    halo = np.median(px[keep], axis=0)
    H = hex_rgb(HEX[n])
    band = grow(outside, 3) & ~outside
    alpha = np.ones((h, w))
    alpha[outside] = 0.0
    dv = halo - bg
    t = np.clip(((a - bg) @ dv) / (dv @ dv), 0.0, 1.0)
    alpha[band] = t[band]

    # 3. the accent, exactly
    y_k, y_f = luma(INK), luma(halo)
    s = np.clip((luma(a) - y_k) / (y_f - y_k), 0.0, 1.0)
    fill_like = off_line(a, bg) > OFF_LINE
    out = a.copy()
    remap = INK + s[..., None] * (H - INK)
    out[fill_like] = remap[fill_like]
    out[band] = H  # the border pixels are halo (the cream they mix with is carried by alpha)

    # 4. pockets of cream enclosed by the figure
    cream = (np.linalg.norm(a - bg, axis=2) < 28) & ~outside
    low = np.asarray(Image.fromarray(cream.astype(np.uint8) * 255).resize((-(-w // GRID), -(-h // GRID)), Image.BOX)) > 127
    lab, cnt = label(low)
    acc_low = np.asarray(Image.fromarray((fill_like & (luma(a) > 110)).astype(np.uint8) * 255).resize(low.shape[::-1], Image.BOX)) > 127
    pockets = []
    for i in range(1, cnt + 1):
        comp = lab == i
        area = int(comp.sum()) * GRID * GRID
        if area < POCKET_MIN:
            continue
        rim = grow(comp, 1) & ~comp
        total = int(rim.sum())
        frac = float((rim & acc_low).sum()) / max(total, 1)
        ys, xs = np.where(comp)
        pockets.append((i, area, frac, int(xs.mean() * GRID), int(ys.mean() * GRID)))
        if frac > HOLE_BORDER:
            big = np.repeat(np.repeat(comp, GRID, axis=0), GRID, axis=1)[:h, :w]
            hole = grow(big & cream, 1)
            alpha[hole & ~fill_like] = 0.0
    print('ST-%02d bg=%s halo=%s -> %s | pockets (area, border-accent share, x, y): %s' % (
        n, tuple(int(v) for v in bg), tuple(int(v) for v in halo), HEX[n], [(p[1], round(p[2], 2), p[3], p[4]) for p in pockets] or 'none'))
    if list_only:
        return None
    rgba = np.dstack([np.clip(out, 0, 255), alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def place(im, n):
    """trim, fit into the frame of the previous sticker, centre, on a 1200 x 1600 canvas (premultiplied while scaling)"""
    al = np.asarray(im.getchannel('A'))
    ys, xs = np.where(al > 90)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    im = im.crop(box)
    fx0, fy0, fx1, fy1 = FRAME[n]
    fw, fh = fx1 - fx0, fy1 - fy0
    k = min(fw / im.width, fh / im.height)
    size = (round(im.width * k), round(im.height * k))
    pm = im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')
    canvas = Image.new('RGBA', (1200, 1600), (0, 0, 0, 0))
    canvas.alpha_composite(pm, (round((fx0 + fx1) / 2 - size[0] / 2), round((fy0 + fy1) / 2 - size[1] / 2)))
    return canvas


def run(src_dir, list_only):
    if not list_only:
        os.makedirs(WORK, exist_ok=True)
    for n in range(1, 10):
        path = os.path.join(src_dir, 'ST-%02d.png' % n)
        if not os.path.exists(path):
            print('missing', path)
            continue
        im = process(path, n, list_only)
        if im is None:
            continue
        canvas = place(im, n)
        canvas.save(os.path.join(WORK, 'sticker-%02d.png' % n))
        canvas.save(os.path.join(ART, 'sticker-%02d.webp' % n), 'WEBP', quality=88, alpha_quality=100, method=6)
        canvas.convert('RGBa').resize((300, 400), Image.LANCZOS).convert('RGBA').save(os.path.join(ART, 'thumb-%02d.webp' % n), 'WEBP', quality=86, alpha_quality=100, method=6)
        print('   written sticker-%02d.webp (%d KB)' % (n, os.path.getsize(os.path.join(ART, 'sticker-%02d.webp' % n)) // 1024))


if __name__ == '__main__':
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    run(args[0] if args else os.path.join(ROOT, '_inbox'), '--list' in sys.argv)
