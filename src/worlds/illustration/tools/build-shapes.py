"""build-shapes.py - the vector footprint of every sticker, derived from its alpha channel (numpy + Pillow only).

Writes src/worlds/illustration/shapes.generated.ts with, per sticker (all numbers in sticker pixels, 1200 x 1600):
  d      the white vinyl outline: the die-cut grown by the printed margin (the same recipe as the baked sheet: disk offset of 19 px
         at scale 0.62, rounded like a cutter path), as ONE smooth closed SVG path (quadratic midpoints). The world uses it as the
         white margin of every sticker, as the die-cut ghost left on the sheet, as the hit area and as the PNG export outline.
  parts  convex pieces of that outline (ear clipping + Hertel-Mehlhorn merge). They are the collision shapes of Gravity mode
         (matter-js compound bodies) and the exact hull used to keep a rotated sticker inside the lid.
  box    bounds of the outline.

Run from the repo root:  python -I -X utf8 src/worlds/illustration/tools/build-shapes.py
Set the STICKER_DEBUG environment variable to a folder to also write overlay PNGs of the outline and the convex pieces.
"""
import os
import json
import math
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
ART = os.path.join(ROOT, 'public', 'works', 'illustration', 'art')
OUT = os.path.join(ROOT, 'src', 'worlds', 'illustration', 'shapes.generated.ts')
DEBUG = os.environ.get('STICKER_DEBUG')

W, H = 1200, 1600
HALF = 2                     # the mask is traced at 1/2 resolution (600 x 800) and scaled back
R_BACK = 19 / 0.62           # printed margin in sticker pixels (baked sheet: 19 px at scale 0.62)
SMOOTH = 7 / 0.62            # corner rounding, same recipe
DP_PATH = 2.4                # Douglas-Peucker tolerance of the drawn outline (sticker px)
DP_PHYS = 16.0               # tolerance of the collision polygon
PHYS_CLOSE = 34.0            # closing radius (sticker px) that fills the narrow gaps of the collision polygon
MIN_PART = 0.012             # convex pieces below this share of the total area are dropped


# ------------------------------------------------------------------------------------------------ convolution helpers
def fft_conv(a, k):
    hh, ww = a.shape
    kh, kw = k.shape
    sh = (hh + kh - 1, ww + kw - 1)
    c = np.fft.irfft2(np.fft.rfft2(a, s=sh) * np.fft.rfft2(k, s=sh), s=sh)
    y0, x0 = (kh - 1) // 2, (kw - 1) // 2
    return c[y0:y0 + hh, x0:x0 + ww]


def gblur(a, sigma):
    r = max(1, int(math.ceil(sigma * 3.2)))
    x = np.arange(-r, r + 1, dtype=np.float64)
    g = np.exp(-(x * x) / (2 * sigma * sigma))
    g /= g.sum()
    out = fft_conv(a.astype(np.float64), g[None, :])
    return fft_conv(out, g[:, None])


def disk(r):
    r = int(round(r))
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return ((x * x + y * y) <= (r + 0.25) ** 2).astype(np.float64)


def dilate(m, r):
    return (fft_conv(m.astype(np.float64), disk(r)) > 0.5).astype(np.float64)


def erode(m, r):
    return 1.0 - dilate(1.0 - m, r)


def fill_holes(m):
    """fill every hole of a binary mask (cells not connected to the border through background)"""
    h, w = m.shape
    mb = m > 0.5
    bg = np.zeros((h, w), bool)
    if mb[0, 0]:
        return m
    bg[0, 0] = True
    stack = [(0, 0)]
    while stack:
        y, x = stack.pop()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx] and not mb[ny, nx]:
                bg[ny, nx] = True
                stack.append((ny, nx))
    return (~bg).astype(np.float64)


# ------------------------------------------------------------------------------------------------ the vinyl mask
def vinyl_mask(alpha):
    """alpha: float (800, 600) in 0..1 at half resolution -> float mask of the white vinyl (smooth, 0..1)"""
    m = (alpha > 0.35).astype(np.float64)
    m = fill_holes(m)
    r = R_BACK / HALF
    sm = SMOOTH / HALF
    d = dilate(m, r + sm * 0.55)
    d = erode(dilate(d, 6), 6)                              # closing: no pinholes or hairline slits
    b = gblur(d, sm)
    return np.clip((b - 0.5) * 12 + 0.5, 0, 1)


# ------------------------------------------------------------------------------------------------ marching squares
def marching_squares(f, level=0.5):
    """closed contours of a float field. Returns a list of (N, 2) arrays of (x, y) in pixel coordinates."""
    b = f >= level
    tl, tr, br, bl = b[:-1, :-1], b[:-1, 1:], b[1:, 1:], b[1:, :-1]
    idx = tl * 8 + tr * 4 + br * 2 + bl * 1
    ii, jj = np.nonzero((idx != 0) & (idx != 15))

    # edge ids: ('h', row, col) = horizontal edge on grid row `row` between columns col..col+1,
    #           ('v', row, col) = vertical edge on grid column `col` between rows row..row+1
    def top(i, j): return ('h', i, j)
    def bottom(i, j): return ('h', i + 1, j)
    def left(i, j): return ('v', i, j)
    def right(i, j): return ('v', i, j + 1)

    table = {1: [(left, bottom)], 2: [(bottom, right)], 3: [(left, right)], 4: [(top, right)], 6: [(top, bottom)],
             7: [(top, left)], 8: [(top, left)], 9: [(top, bottom)], 11: [(top, right)], 12: [(left, right)],
             13: [(right, bottom)], 14: [(left, bottom)]}
    adj = {}
    for i, j in zip(ii, jj):
        c = int(idx[i, j])
        if c in (5, 10):
            center = (f[i, j] + f[i, j + 1] + f[i + 1, j] + f[i + 1, j + 1]) / 4 >= level
            if c == 5:
                segs = [(top, right), (left, bottom)] if center else [(top, left), (bottom, right)]
            else:
                segs = [(top, left), (bottom, right)] if center else [(top, right), (left, bottom)]
        else:
            segs = table[c]
        for ea, eb in segs:
            a, bb = ea(i, j), eb(i, j)
            adj.setdefault(a, []).append(bb)
            adj.setdefault(bb, []).append(a)

    def point(e):
        kind, r, c = e
        if kind == 'h':
            f0, f1 = f[r, c], f[r, c + 1]
            t = (level - f0) / (f1 - f0) if f1 != f0 else 0.5
            return (c + t, r)
        f0, f1 = f[r, c], f[r + 1, c]
        t = (level - f0) / (f1 - f0) if f1 != f0 else 0.5
        return (c, r + t)

    seen, loops = set(), []
    for start in adj:
        if start in seen:
            continue
        loop, cur, prev = [], start, None
        while True:
            seen.add(cur)
            loop.append(point(cur))
            nxt = [n for n in adj[cur] if n != prev and n not in seen]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
        if len(loop) > 8:
            loops.append(np.array(loop))
    return loops


def shoelace(poly):
    x, y = poly[:, 0], poly[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


# ------------------------------------------------------------------------------------------------ simplification
def dp(points, eps):
    """Douglas-Peucker on an open polyline (N, 2) -> indices to keep"""
    n = len(points)
    keep = np.zeros(n, bool)
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        p, q = points[a], points[b]
        seg = q - p
        length = math.hypot(seg[0], seg[1])
        pts = points[a + 1:b]
        if length < 1e-9:
            d = np.hypot(pts[:, 0] - p[0], pts[:, 1] - p[1])
        else:
            d = np.abs(seg[0] * (pts[:, 1] - p[1]) - seg[1] * (pts[:, 0] - p[0])) / length
        k = int(np.argmax(d))
        if d[k] > eps:
            m = a + 1 + k
            keep[m] = True
            stack.append((a, m))
            stack.append((m, b))
    return np.nonzero(keep)[0]


def simplify_closed(poly, eps):
    far = int(np.argmax(np.hypot(poly[:, 0] - poly[0, 0], poly[:, 1] - poly[0, 1])))
    a = poly[:far + 1]
    b = np.vstack([poly[far:], poly[:1]])
    pa = a[dp(a, eps)]
    pb = b[dp(b, eps)][1:-1]
    return np.vstack([pa, pb]) if len(pb) else pa


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def seg_intersect(p1, p2, p3, p4):
    d1, d2 = cross(p3, p4, p1), cross(p3, p4, p2)
    d3, d4 = cross(p1, p2, p3), cross(p1, p2, p4)
    return (d1 * d2 < 0) and (d3 * d4 < 0)


def is_simple(poly):
    n = len(poly)
    for i in range(n):
        a, b = poly[i], poly[(i + 1) % n]
        for j in range(i + 2, n):
            if (j + 1) % n == i:
                continue
            if seg_intersect(a, b, poly[j], poly[(j + 1) % n]):
                return False
    return True


def smooth_path(poly, nd=1):
    """closed quadratic path through the edge midpoints with the polygon vertices as control points: a smooth blob"""
    n = len(poly)

    def f(v):
        s = ('%.' + str(nd) + 'f') % v
        return s.rstrip('0').rstrip('.') if '.' in s else s

    def mid(a, b):
        return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)

    m0 = mid(poly[-1], poly[0])
    s = 'M' + f(m0[0]) + ' ' + f(m0[1])
    for i in range(n):
        c = poly[i]
        e = mid(poly[i], poly[(i + 1) % n])
        s += 'Q' + f(c[0]) + ' ' + f(c[1]) + ' ' + f(e[0]) + ' ' + f(e[1])
    return s + 'Z'


# ------------------------------------------------------------------------------------------------ convex decomposition
def point_in_tri(p, a, b, c):
    d1, d2, d3 = cross(a, b, p), cross(b, c, p), cross(c, a, p)
    neg = d1 < 0 or d2 < 0 or d3 < 0
    pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (neg and pos)


def min_angle(a, b, c):
    """smallest interior angle (radians) of the triangle abc"""
    def ang(p, q, r):
        v1 = (q[0] - p[0], q[1] - p[1])
        v2 = (r[0] - p[0], r[1] - p[1])
        d = math.hypot(*v1) * math.hypot(*v2)
        if d < 1e-12:
            return 0.0
        return math.acos(max(-1.0, min(1.0, (v1[0] * v2[0] + v1[1] * v2[1]) / d)))
    return min(ang(a, b, c), ang(b, c, a), ang(c, a, b))


def ear_clip(pts):
    """pts: simple polygon with positive shoelace area. Returns triangles as index triples. Every step clips the ear with the
    largest smallest-angle, so the triangulation stays chunky (the Hertel-Mehlhorn merge then leaves fewer, fatter pieces)."""
    idx = list(range(len(pts)))
    tris = []
    guard = 0
    while len(idx) > 3 and guard < 100000:
        guard += 1
        n = len(idx)
        found = False
        best = None
        for k in range(n):
            i0, i1, i2 = idx[k - 1], idx[k], idx[(k + 1) % n]
            a, b, c = pts[i0], pts[i1], pts[i2]
            if cross(a, b, c) <= 1e-9:
                continue
            ok = True
            for m in idx:
                if m in (i0, i1, i2):
                    continue
                if point_in_tri(pts[m], a, b, c):
                    ok = False
                    break
            if ok:
                score = min_angle(a, b, c)
                if best is None or score > best[0]:
                    best = (score, k, (i0, i1, i2))
        if best:
            tris.append(best[2])
            idx.pop(best[1])
            found = True
        if not found:
            for k in range(len(idx)):
                i0, i1, i2 = idx[k - 1], idx[k], idx[(k + 1) % len(idx)]
                if abs(cross(pts[i0], pts[i1], pts[i2])) <= 1e-6:
                    idx.pop(k)
                    found = True
                    break
            if not found:
                raise RuntimeError('ear clipping stuck')
    tris.append(tuple(idx))
    return tris


def convex_at(pts, prev, cur, nxt):
    return cross(pts[prev], pts[cur], pts[nxt]) >= -1e-9


def hertel_mehlhorn(pts, tris):
    polys = [list(t) for t in tris]
    while True:
        owner = {}
        for pi, p in enumerate(polys):
            for k in range(len(p)):
                owner[(p[k], p[(k + 1) % len(p)])] = pi
        best = None
        for (a, b), pi in owner.items():
            qi = owner.get((b, a))
            if qi is None or qi == pi:
                continue
            P, Q = polys[pi], polys[qi]
            ka = P.index(a)
            P2 = P[ka + 1:] + P[:ka + 1]          # starts at b (a's successor in P), ends at a
            kb = Q.index(b)
            Q2 = Q[kb + 1:] + Q[:kb + 1]          # starts at a, ends at b
            merged = P2 + Q2[1:-1]
            n = len(merged)
            ia = P2.index(a)
            if convex_at(pts, merged[ia - 1], merged[ia], merged[(ia + 1) % n]) and convex_at(pts, merged[-1], merged[0], merged[1 % n]):
                # prefer the merge that leaves the biggest piece: merge the larger areas first
                score = -(abs(poly_area(pts[P])) + abs(poly_area(pts[Q])))
                if best is None or score < best[0]:
                    best = (score, pi, qi, merged)
        if not best:
            return polys
        _, pi, qi, merged = best
        polys[pi] = merged
        polys.pop(qi)


def poly_area(poly):
    x, y = poly[:, 0], poly[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


def poly_centroid(poly):
    x, y = poly[:, 0], poly[:, 1]
    x1, y1 = np.roll(x, -1), np.roll(y, -1)
    cr = x * y1 - x1 * y
    a = 0.5 * cr.sum()
    return np.array([((x + x1) * cr).sum() / (6 * a), ((y + y1) * cr).sum() / (6 * a)])


# ------------------------------------------------------------------------------------------------ label spot
def label_spot(vm, pad):
    """Where the number and the caption go on the die-cut ghost: the longest horizontal run of the silhouette in its middle band
    (rows between 25 % and 80 % of its height, central rows preferred). Returns [cx, cy, run] in sticker pixels."""
    m = vm > 0.5
    ys, xs = np.nonzero(m)
    y0, y1 = int(ys.min()), int(ys.max())
    mid = (y0 + y1) / 2.0
    best = None
    for y in range(int(y0 + 0.25 * (y1 - y0)), int(y0 + 0.8 * (y1 - y0)), 2):
        row = m[y].astype(np.int8)
        d = np.diff(np.concatenate([[0], row, [0]]))
        for st, en in zip(np.nonzero(d == 1)[0], np.nonzero(d == -1)[0]):
            run = int(en - st)
            score = run - 0.22 * abs(y - mid)
            if best is None or score > best[0]:
                best = (score, (st + en) / 2.0, y, run)
    _, cx, cy, run = best
    return [round((cx - pad) * HALF, 1), round((cy - pad) * HALF, 1), round(run * HALF, 1)]


# ------------------------------------------------------------------------------------------------ main
def build(n):
    im = Image.open(os.path.join(ART, 'sticker-%02d.webp' % n)).convert('RGBA')
    a = np.asarray(im, dtype=np.float32)[:, :, 3] / 255.0
    a2 = a.reshape(H // HALF, HALF, W // HALF, HALF).mean((1, 3))
    pad = 8
    a2 = np.pad(a2, pad)
    vm = vinyl_mask(a2)
    loops = marching_squares(vm, 0.5)
    loops.sort(key=lambda lp: -abs(shoelace(lp)))
    outer = (loops[0] - pad) * HALF                      # to sticker pixels
    if shoelace(outer) < 0:
        outer = outer[::-1]
    dpoly = simplify_closed(outer, DP_PATH)
    d = smooth_path(dpoly)
    # collision polygon: the vinyl mask CLOSED by a disk (narrow gaps between limbs fill in, so the polygon has few reflex
    # vertices and decomposes into a handful of fat convex pieces), traced again and simplified
    bm = (vm > 0.5).astype(np.float64)
    cm = erode(dilate(bm, PHYS_CLOSE / HALF), PHYS_CLOSE / HALF)
    cm = gblur(cm, 2.0)
    cl = marching_squares(np.clip((cm - 0.5) * 12 + 0.5, 0, 1), 0.5)
    cl.sort(key=lambda lp: -abs(shoelace(lp)))
    cpoly = (cl[0] - pad) * HALF
    if shoelace(cpoly) < 0:
        cpoly = cpoly[::-1]
    eps = DP_PHYS
    while True:
        phys = simplify_closed(cpoly, eps)
        if is_simple(phys) or eps < 2:
            break
        eps *= 0.8
    tris = ear_clip(phys)
    polys = hertel_mehlhorn(phys, tris)
    areas = [abs(poly_area(phys[p])) for p in polys]
    tot0 = sum(areas)
    # tiny leftovers carry no weight in a pile: drop them (their area lies next to a bigger piece anyway)
    polys = [p for p, a_ in zip(polys, areas) if a_ >= MIN_PART * tot0]
    parts, total, cen = [], 0.0, np.zeros(2)
    for p in polys:
        pp = phys[p]
        ar = abs(poly_area(pp))
        total += ar
        cen += poly_centroid(pp) * ar
        parts.append(pp)
    com = cen / total
    box = [float(outer[:, 0].min()), float(outer[:, 1].min()), float(outer[:, 0].max()), float(outer[:, 1].max())]
    print('sticker %d: outline %d pts (%d chars), collision polygon %d pts -> %d convex parts, area %.0f' % (n, len(dpoly), len(d), len(phys), len(parts), total))
    if DEBUG:
        os.makedirs(DEBUG, exist_ok=True)
        bg = Image.new('RGBA', (W, H), (255, 242, 218, 255))
        bg.alpha_composite(im)
        dr = ImageDraw.Draw(bg)
        dr.line([tuple(p) for p in list(dpoly) + [dpoly[0]]], fill=(20, 20, 20, 255), width=3)
        cols = [(255, 0, 80), (0, 120, 255), (0, 170, 90), (255, 150, 0), (140, 0, 220), (0, 190, 200), (200, 0, 160), (90, 90, 0), (255, 60, 0), (0, 80, 160)]
        for k, pp in enumerate(parts):
            dr.polygon([tuple(p) for p in pp], outline=cols[k % len(cols)] + (255,))
        dr.ellipse((com[0] - 8, com[1] - 8, com[0] + 8, com[1] + 8), fill=(255, 0, 0, 255))
        bg.convert('RGB').resize((600, 800)).save(os.path.join(DEBUG, 'shape-%02d.png' % n))
    return {
        'n': n,
        'lab': label_spot(vm, pad),
        'd': d,
        'parts': [[int(round(v)) for v in pp.reshape(-1)] for pp in parts],
        'com': [round(float(com[0]), 1), round(float(com[1]), 1)],
        'box': [round(v, 1) for v in box],
    }


def main():
    data = [build(n) for n in range(1, 10)]
    lines = [
        '// GENERATED by src/worlds/illustration/tools/build-shapes.py from public/works/illustration/art/sticker-0N.webp. Do not edit.',
        '// Units: sticker pixels (1200 x 1600). d = white vinyl outline (SVG path), parts = convex collision pieces [x0,y0,x1,y1,...],',
        '// com = their centre of mass, lab = where the label goes on the ghost [cx, cy, longest run], box = bounds of the outline [x0, y0, x1, y1].',
        '',
        'export interface ShapeData {',
        '  d: string',
        '  parts: number[][]',
        '  com: [number, number]',
        '  lab: [number, number, number]',
        '  box: [number, number, number, number]',
        '}',
        '',
        'export const SHAPES: Record<number, ShapeData> = {',
    ]
    for s in data:
        lines.append('  %d: {' % s['n'])
        lines.append("    d: '%s'," % s['d'])
        lines.append('    parts: ' + json.dumps(s['parts'], separators=(',', ':')) + ',')
        lines.append('    com: ' + json.dumps(s['com']) + ',')
        lines.append('    lab: ' + json.dumps(s['lab']) + ',')
        lines.append('    box: ' + json.dumps(s['box']) + ',')
        lines.append('  },')
    lines.append('}')
    with open(OUT, 'w', encoding='utf8', newline='\n') as f:
        f.write('\n'.join(lines) + '\n')
    print('wrote', OUT, os.path.getsize(OUT), 'bytes')


if __name__ == '__main__':
    main()
