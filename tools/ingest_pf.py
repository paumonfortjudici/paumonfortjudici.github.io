"""Files the pieces Pau generated for the "A Portfolio for a Client" deck (K-01..K-07, T-01..T-05, S1-01..S5-02) as transparent WebPs.

Every piece was drawn on flat hot magenta. For each source: find the background, key it out with a soft edge (magenta-ness, so a darker magenta
floor shadow counts as background too), un-premultiply and de-spill the edge, trim. Sheets (sunbursts, sound bursts, prints, marks, sparks, the
neighbour, the paper and wall souvenirs) are split into their separate pieces and numbered in reading order; ALIAS gives the ones the slides
use a real name. The three comic panels (S3-xx) are full bleed pictures: they are only re-encoded.

    python tools/ingest_pf.py <folder holding the PNGs> [--list]

--list writes numbered previews of every sheet next to the sources, so the numbering and ALIAS can be checked. The pieces go to
art-src/concept-portfolio/pieces/ (with pieces.json: the size of each). Needs Pillow and numpy. The inbox is not published.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'art-src', 'concept-portfolio', 'pieces')

M0, M1 = 55.0, 175.0  # magenta-ness (min(R, B) - G) under M0 is drawing, over M1 is background, in between is the soft edge
LONG = 1500  # the longest side of a piece is kept under this

SINGLES = {
    'S1-01': 'mic',
    'S2-01': 'ona-clap',
    'S4-01': 'ona-desk',
    'S5-01': 'ona-away',
    'S2-02': 'celery',
    'S2-03': 'candy',
    'S2-04': 'cabbage',
    'S2-05': 'umbrella',
    'S2-06': 'melon',
    'S4-02': 'console',
    'S4-03': 'speaker',
    'S5-02': 'skyline',
    'T-01': 'title-cover',
    'T-02': 'title-ona',
    'T-03': 'title-projects',
    'T-04': 'title-exp',
    'T-05': 'title-thanks',
    'K-01': 'ona-sheet',
}
PANELS = {'S3-01': 'panel-salt', 'S3-02': 'panel-kettle', 'S3-03': 'panel-moon'}
# sheet -> (prefix, dilation in 3 px cells, min area, small-piece area, small-piece gap)
SHEETS = {
    'K-02': ('sun', 1, 600, 3000, 60),
    'K-03': ('burst', 1, 3000, 20000, 40),
    'K-04': ('print', 1, 1500, 12000, 50),
    'K-05': ('mark', 2, 500, 2500, 40),
    'K-06': ('spark', 2, 400, 2500, 40),
    'K-07': ('neighbour', 1, 3000, 20000, 40),
    'S4-04': ('paper', 3, 3000, 20000, 60),
    'S4-05': ('wall', 3, 3000, 20000, 60),
}
# (sheet, number in reading order) -> the name the compositions use (checked on the --list previews)
ALIAS = {}
for _sheet, _names in {
    'K-02': ['sun-big', 'sun-cone', 'sun-half', 'sun-eye-1', 'sun-eye-2', 'sun-eye-3', 'sun-eye-4', 'star-1', 'star-2', 'star-3', 'star-ink', 'star-4'],
    'K-03': ['burst-snap', 'burst-wheee', 'burst-crunch', 'burst-creak', 'burst-clop', 'burst-thump', 'burst-bye'],
    'K-07': ['neighbour-peek', 'neighbour-mug', 'neighbour-wave', 'neighbour-sleep'],
    'S4-04': ['paper-call', 'paper-ticket-red', 'paper-ticket-yellow', 'paper-wave', 'paper-postcard', 'paper-film'],
    'S4-05': ['wall-cassette', 'wall-reel', 'wall-polaroid-boots', 'wall-polaroid-kettle', 'wall-polaroid-moon'],
}.items():
    for _i, _n in enumerate(_names, 1):
        ALIAS[(_sheet, _i)] = _n
ALIAS.update({('K-04', 13): 'print-foot', ('K-04', 14): 'socks-a', ('K-04', 15): 'socks-b', ('K-04', 16): 'paws'})
for _i, _n in {1: 'arrow-curve', 2: 'arrow-bold', 3: 'arrow-zig', 4: 'arrow-loop', 5: 'arrow-double', 10: 'underline-scribble', 14: 'bang', 17: 'qbang', 21: 'question',
               27: 'ring-a', 28: 'ring-b', 32: 'ring-c', 33: 'ring-d'}.items():
    ALIAS[('K-05', _i)] = _n
for _i, _n in {1: 'sparkle-y1', 3: 'sparkle-y2', 5: 'sparkle-y3', 7: 'sparkle-y4', 2: 'sparkle-k1', 4: 'sparkle-k2', 6: 'sparkle-pair', 22: 'thumb-1', 23: 'thumb-2', 24: 'coffee-ring',
               8: 'wave-1', 9: 'wave-2', 10: 'wave-3', 11: 'wave-4', 12: 'wave-5', 13: 'wave-6', 14: 'note-1', 15: 'note-2', 16: 'note-3', 17: 'note-4',
               18: 'splat-1', 19: 'splat-2', 20: 'splat-3', 21: 'splat-4', 25: 'whiteout-1', 27: 'whiteout-2', 29: 'whiteout-3', 31: 'whiteout-4',
               26: 'smudge-1', 28: 'smudge-2', 30: 'smudge-3'}.items():
    ALIAS[('K-06', _i)] = _n


def key(path, extend=True):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float64)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g
    t = np.clip((m - M0) / (M1 - M0), 0.0, 1.0)
    alpha = 1.0 - t * t * (3 - 2 * t)
    # the background colour of the image (for the un-premultiply): the median of its magenta border
    h, w = alpha.shape
    e = max(6, int(min(h, w) * 0.015))
    edge = np.concatenate([a[:e].reshape(-1, 3), a[-e:].reshape(-1, 3), a[:, :e].reshape(-1, 3), a[:, -e:].reshape(-1, 3)])
    bg = np.median(edge[(np.minimum(edge[:, 0], edge[:, 2]) - edge[:, 1]) > 150], axis=0) if len(edge) else np.array([255.0, 0, 255.0])
    safe = np.maximum(alpha, 0.04)[..., None]
    rgb = np.clip((a - (1 - alpha)[..., None] * bg) / safe, 0, 255)
    # de-spill the soft edge: magenta that is left in a half-transparent pixel goes
    soft = (alpha > 0.02) & (alpha < 0.96)
    spill = np.clip(np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1], 0, None) * 0.75
    for c in (0, 2):
        rgb[..., c] = np.where(soft, rgb[..., c] - spill, rgb[..., c])
    rgb = np.clip(rgb, 0, 255)
    rgb = np.where(alpha[..., None] < 0.03, a, rgb)
    if extend:
        rgb = extend_edge(rgb, alpha)
    return rgb, alpha


def extend_edge(rgb, alpha):
    """the soft rim of a piece takes the colour of the solid pixels just inside it, so no trace of the magenta floor is left (fur, hair, glass)"""
    gone = (alpha < 0.02).astype(np.uint8) * 255
    near_gone = np.asarray(Image.fromarray(gone).filter(ImageFilter.GaussianBlur(7))).astype(np.float64) / 255.0 > 0.02  # within about 15 px of the floor
    core = (alpha > 0.97) & ~near_gone  # solid pixels well inside the piece: the colours to borrow
    cmask = core.astype(np.uint8) * 255
    wsum = np.asarray(Image.fromarray(cmask).filter(ImageFilter.GaussianBlur(9))).astype(np.float64) / 255.0
    tint = np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]  # magenta that is left in a pixel
    out = rgb.copy()
    rim = near_gone & ((alpha < 0.97) | (tint > 18)) & (wsum > 0.01)
    for c in range(3):
        ch = Image.fromarray((rgb[..., c] * core).astype(np.uint8))
        col = np.asarray(ch.filter(ImageFilter.GaussianBlur(9))).astype(np.float64) / np.maximum(wsum, 1e-3)
        out[..., c] = np.where(rim, np.clip(col, 0, 255), rgb[..., c])
    return out


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


def dilate(mask, k):
    out = mask.copy()
    for _ in range(k):
        p = np.pad(out, 1)
        out = p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    return out


def split(alpha, dil, min_area, small_area, small_gap):
    G = 3
    H, W = alpha.shape
    solid = (alpha > 0.4).astype(np.uint8) * 255
    small = np.asarray(Image.fromarray(solid).resize((-(-W // G), -(-H // G)), Image.BOX)) > 70
    lab_s, n = label(dilate(small, dil))
    lab = np.repeat(np.repeat(lab_s, G, axis=0), G, axis=1)[:H, :W]
    lab = np.where(alpha > 0.04, lab, 0)
    boxes = {}
    for i in range(1, n + 1):
        ys, xs = np.where((lab == i) & (alpha > 0.4))
        if len(xs) < min_area:
            lab[lab == i] = 0
            continue
        boxes[i] = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1, int(len(xs))]
    for i in sorted(boxes, key=lambda k: boxes[k][4]):  # a small piece close to a bigger one belongs to it
        x0, y0, x1, y1, area = boxes[i]
        if area >= small_area:
            continue
        best, gap = None, 1e9
        for j, b in boxes.items():
            if j == i or b[4] <= area:
                continue
            dx = max(b[0] - x1, x0 - b[2], 0)
            dy = max(b[1] - y1, y0 - b[3], 0)
            d = (dx * dx + dy * dy) ** 0.5
            if d < gap:
                best, gap = j, d
        if best is not None and gap < small_gap:
            lab[lab == i] = best
            b = boxes[best]
            boxes[best] = [min(b[0], x0), min(b[1], y0), max(b[2], x1), max(b[3], y1), b[4] + area]
            del boxes[i]
    pieces = [{'id': i, 'bbox': (b[0], b[1], b[2], b[3]), 'cx': (b[0] + b[2]) / 2 / W, 'cy': (b[1] + b[3]) / 2 / H, 'area': b[4]} for i, b in boxes.items()]
    # reading order: rows (a row ends where the next piece starts clearly lower), then left to right
    pieces.sort(key=lambda p: p['cy'])
    rows, cur = [], []
    for p in pieces:
        if cur and p['bbox'][1] > max(q['bbox'][3] for q in cur) - 0.35 * (cur[0]['bbox'][3] - cur[0]['bbox'][1]):
            rows.append(cur)
            cur = []
        cur.append(p)
    if cur:
        rows.append(cur)
    ordered = [p for r in rows for p in sorted(r, key=lambda q: q['cx'])]
    return ordered, lab


def save(rgb, alpha, bbox, name, manifest, lab=None, pid=None):
    x0, y0, x1, y1 = bbox
    pad = 6
    H, W = alpha.shape
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    a = alpha[y0:y1, x0:x1].copy()
    if lab is not None:
        l = lab[y0:y1, x0:x1]
        a = np.where((l == pid) | (l == 0), a, 0)  # the neighbours that fall in the crop go; the soft edge (label 0) stays
    ys, xs = np.where(a > 0.04)
    if len(xs) == 0:
        return
    tx0, ty0, tx1, ty1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    rgba = np.dstack([rgb[y0:y1, x0:x1], a * 255])[ty0:ty1, tx0:tx1].astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    if max(im.size) > LONG:
        k = LONG / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
    manifest[name] = {'w': im.width, 'h': im.height}


def run(src, list_only, only=None):
    os.makedirs(OUT, exist_ok=True)
    mpath = os.path.join(OUT, 'pieces.json')
    manifest = json.load(open(mpath, encoding='utf-8')) if only and os.path.exists(mpath) else {}
    font = ImageFont.load_default(size=34)
    for sid, name in SINGLES.items():
        p = os.path.join(src, sid + '.png')
        if only and sid not in only:
            continue
        if not os.path.exists(p):
            print('missing', sid)
            continue
        rgb, alpha = key(p, extend=sid != 'S2-03')  # the cellophane of the candy is see-through on purpose
        h, w = alpha.shape
        save(rgb, alpha, (0, 0, w, h), name, manifest)
        print('single', sid, '->', name, manifest[name])
    for sid, (prefix, dil, min_area, small_area, small_gap) in SHEETS.items():
        p = os.path.join(src, sid + '.png')
        if only and sid not in only:
            continue
        if not os.path.exists(p):
            print('missing', sid)
            continue
        rgb, alpha = key(p)
        pieces, lab = split(alpha, dil, min_area, small_area, small_gap)
        prev = Image.open(p).convert('RGB')
        d = ImageDraw.Draw(prev)
        for n, pc in enumerate(pieces, 1):
            name = ALIAS.get((sid, n), '%s-%02d' % (prefix, n))
            x0, y0, x1, y1 = pc['bbox']
            d.rectangle([x0, y0, x1, y1], outline=(0, 255, 0), width=2)
            d.text((x0 + 3, y0 + 1), str(n), fill=(255, 255, 255), font=font, stroke_width=4, stroke_fill=(0, 0, 0))
            save(rgb, alpha, pc['bbox'], name, manifest, lab, pc['id'])
        prev.save(os.path.join(src, 'preview_%s.jpg' % sid), quality=80)
        print('sheet', sid, len(pieces), 'pieces')
    for sid, name in PANELS.items():
        p = os.path.join(src, sid + '.png')
        if (not only or sid in only) and os.path.exists(p):
            im = Image.open(p).convert('RGB')
            im.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=92, method=6)
            manifest[name] = {'w': im.width, 'h': im.height}
    with open(os.path.join(OUT, 'pieces.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1)
    print(len(manifest), 'pieces in', OUT)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__)
        sys.exit(1)
    only = [a[7:] for a in sys.argv[1:] if a.startswith('--only=')]
    run(args[0], '--list' in sys.argv, only[0].split(',') if only else None)
