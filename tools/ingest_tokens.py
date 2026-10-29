"""Files the seven tool icons of "On my desk" (TK-01..TK-07, parts sheets drawn on flat jade) and the bin (BIN-01) into the site.

For each sheet: find the flat background colour, key it out with a soft edge, split the sheet into its separate pieces (parts closer than about 20 px
are one piece, so a splatter drop stays with its brush stroke), name every piece by where it sits on the sheet, and save it as a transparent WebP:
public/process/tk/<token>-<part>.webp. A JSON file with the size of every piece (and a few anchor points: the hole of a paint chip, the top of a
string, the foot of a flag pole) goes to src/components/sections/process/tokens.sprites.ts; tokens.tsx assembles the pieces. The bin becomes
public/process/bin.webp (one picture, trimmed).

    python tools/ingest_tokens.py <folder holding TK-01.png .. TK-07.png and BIN-01.png> [--list]

--list only prints what it finds and writes a numbered preview next to the sources (use it to check the naming rules below).
Needs Pillow and numpy. The sources stay where they are (the inbox is not published).
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D0, D1 = 22.0, 56.0  # colour distance under D0 is background, over D1 is drawing, in between is the soft edge
SCALE = 0.6  # sources are about 1254 px square; the pieces are kept at 60 percent (they are shown at 100 to 150 css px)
GRID = 4  # the pieces are found on a quarter-size map
GROW = 0  # ... and not grown at all: the AI leaves only about 25 px between some parts, and nothing inside a part is split by a gap
MERGE_AREA = 16000  # a piece smaller than this (a splatter drop, a speck of ink) joins the nearest piece when it is closer than MERGE_GAP px
MERGE_GAP = 80

SHEETS = {
    'adobe': 'TK-01',
    'pencil': 'TK-02',
    'procreate': 'TK-03',
    'nomad': 'TK-04',
    'ai': 'TK-05',
    'pinterest': 'TK-06',
    'vscode': 'TK-07',
}


def background_of(a):
    h, w = a.shape[:2]
    m = max(6, int(min(h, w) * 0.02))
    edge = np.concatenate([a[:m].reshape(-1, 3), a[-m:].reshape(-1, 3), a[:, :m].reshape(-1, 3), a[:, -m:].reshape(-1, 3)])
    vals, counts = np.unique((edge // 10).astype(int), axis=0, return_counts=True)
    mode = vals[counts.argmax()] * 10 + 5
    near = edge[np.linalg.norm(edge - mode, axis=1) < 30]
    return np.median(near, axis=0)


def key(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float64)
    bg = background_of(a)
    t = np.clip((np.linalg.norm(a - bg, axis=2) - D0) / (D1 - D0), 0.0, 1.0)
    alpha = t * t * (3 - 2 * t)
    safe = np.maximum(alpha, 0.05)[..., None]
    rgb = np.clip((a - (1 - alpha)[..., None] * bg) / safe, 0, 255)
    rgb = np.where(alpha[..., None] < 0.05, a, rgb)
    return rgb, alpha, bg


def label(mask):
    """4-connected labels of a boolean map (small, so plain loops are fine)"""
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


def split(alpha):
    """the separate pieces of a sheet: [{'id', 'bbox': (x0, y0, x1, y1), 'area', 'cx', 'cy'}] in 0..1 sheet units, and the full-size label map"""
    H, W = alpha.shape
    solid = (alpha > 0.35).astype(np.uint8) * 255
    small = Image.fromarray(solid).resize((-(-W // GRID), -(-H // GRID)), Image.BOX).point(lambda v: 255 if v > 90 else 0)  # a cell counts when a third of it is drawing: print grain does not
    grown = small.filter(ImageFilter.MaxFilter(GROW * 2 + 1))
    lab_small, n = label(np.asarray(grown) > 0)
    lab = np.repeat(np.repeat(lab_small, GRID, axis=0), GRID, axis=1)[:H, :W]
    lab = np.where(alpha > 0.04, lab, 0)
    boxes = {}
    for i in range(1, n + 1):
        ys, xs = np.where((lab == i) & (alpha > 0.35))
        if len(xs) < 300:  # specks of grain
            lab[lab == i] = 0
            continue
        boxes[i] = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1, int(len(xs))]
    # small pieces close to a bigger one belong to it (the drops of a splatter)
    for i in sorted(boxes, key=lambda k: boxes[k][4]):
        x0, y0, x1, y1, area = boxes[i]
        if area >= MERGE_AREA:
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
        if best is not None and gap < MERGE_GAP:
            lab[lab == i] = best
            b = boxes[best]
            boxes[best] = [min(b[0], x0), min(b[1], y0), max(b[2], x1), max(b[3], y1), b[4] + area]
            del boxes[i]
    pieces = []
    for i, (x0, y0, x1, y1, area) in boxes.items():
        ys, xs = np.where((lab == i) & (alpha > 0.35))
        pieces.append({'id': i, 'bbox': (x0, y0, x1, y1), 'area': area, 'cx': float(xs.mean() / W), 'cy': float(ys.mean() / H), 'w': (x1 - x0) / W, 'h': (y1 - y0) / H})
    return pieces, lab


def by_x(ps):
    return sorted(ps, key=lambda p: p['cx'])


def by_y(ps):
    return sorted(ps, key=lambda p: p['cy'])


def name_pieces(token, ps):
    """the naming rules: where each piece sits on its sheet (checked with --list)"""
    out = {}
    banner = max(ps, key=lambda p: (p['cy'] > 0.7) * p['w'])
    out['banner'] = banner
    rest = [p for p in ps if p is not banner]
    if token == 'adobe':
        chips = sorted([p for p in rest if p['h'] > 0.3], key=lambda p: p['cx'])
        out['chipL'], out['chipM'], out['chipR'] = chips
        out['rivet'] = [p for p in rest if p not in chips][0]
    elif token == 'pencil':
        r = by_y(rest)
        out['paper'], out['scribble'], out['pencil'] = r
    elif token == 'procreate':
        top = by_x([p for p in rest if p['cy'] < 0.4])
        out['card'], out['tab'] = top
        out['stroke'] = [p for p in rest if p not in top][0]
    elif token == 'nomad':
        out['clay'] = max(rest, key=lambda p: p['area'])
        others = [p for p in rest if p is not out['clay']]
        out['flag'] = min(others, key=lambda p: p['cy'])
        out['tool'] = [p for p in others if p is not out['flag']][0]
    elif token == 'ai':
        out['tag'] = max(rest, key=lambda p: p['area'])
        out['tick'] = [p for p in rest if p is not out['tag']][0]
    elif token == 'pinterest':
        out['card'] = max(rest, key=lambda p: p['area'])
        out['pin'] = [p for p in rest if p is not out['card']][0]
    elif token == 'vscode':
        top = by_x([p for p in rest if p['cy'] < 0.45])
        out['base'], out['cap'] = top
        braces = by_x([p for p in rest if p not in top])
        out['braceL'], out['braceR'] = braces
    return out


def enclosed_holes(alpha_small):
    """centres (0..1 of the piece) of transparent regions that do not reach the border: the hole of a paint chip"""
    h, w = alpha_small.shape
    lab, n = label(alpha_small < 0.1)
    border = set(lab[0].tolist()) | set(lab[-1].tolist()) | set(lab[:, 0].tolist()) | set(lab[:, -1].tolist())
    holes = []
    for i in range(1, n + 1):
        if i in border:
            continue
        ys, xs = np.where(lab == i)
        if len(xs) > 30:
            holes.append({'x': round(float(xs.mean() / w), 4), 'y': round(float(ys.mean() / h), 4), 'area': int(len(xs))})
    return holes


def run(src_dir, list_only):
    sprites_dir = os.path.join(ROOT, 'public', 'process', 'tk')
    os.makedirs(sprites_dir, exist_ok=True)
    manifest = {}
    for token, sheet in SHEETS.items():
        path = os.path.join(src_dir, sheet + '.png')
        if not os.path.exists(path):
            print('missing', path)
            continue
        rgb, alpha, bg = key(path)
        pieces, lab = split(alpha)
        named = name_pieces(token, pieces)
        print('%-10s %s  bg=%s  %d pieces: %s' % (token, sheet, tuple(int(v) for v in bg), len(pieces), ', '.join('%s(%.2f,%.2f %.2fx%.2f)' % (k, p['cx'], p['cy'], p['w'], p['h']) for k, p in named.items())))
        if list_only:
            im = Image.open(path).convert('RGB')
            d = ImageDraw.Draw(im)
            for k, p in named.items():
                d.rectangle(p['bbox'], outline=(255, 0, 255), width=4)
                d.text((p['bbox'][0] + 8, p['bbox'][1] + 8), k, fill=(255, 0, 255))
            im.save(os.path.join(src_dir, '_list_%s.png' % sheet))
            continue
        manifest[token] = {}
        for k, p in named.items():
            x0, y0, x1, y1 = p['bbox']
            pad = 3
            x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(alpha.shape[1], x1 + pad), min(alpha.shape[0], y1 + pad)
            own = lab[y0:y1, x0:x1] == p['id']
            a = np.where(own, alpha[y0:y1, x0:x1], 0.0)
            im = Image.fromarray(np.dstack([rgb[y0:y1, x0:x1], a * 255]).astype(np.uint8), 'RGBA')
            size = (max(1, round(im.width * SCALE)), max(1, round(im.height * SCALE)))
            im = im.resize(size, Image.LANCZOS)
            dst = os.path.join(sprites_dir, '%s-%s.webp' % (token, k))
            im.save(dst, 'WEBP', quality=88, alpha_quality=100, method=6)
            info = {'w': size[0], 'h': size[1], 'kb': os.path.getsize(dst) // 1024}
            al = np.asarray(im.getchannel('A')).astype(np.float64) / 255
            holes = enclosed_holes(al[::2, ::2])
            if holes:
                info['holes'] = holes
            ys, xs = np.where(al > 0.5)
            info['top'] = {'x': round(float(xs[ys == ys.min()].mean() / size[0]), 4), 'y': 0.0}  # where the highest solid pixel is (a string's loop, a pole's tip)
            info['foot'] = {'x': round(float(xs[ys == ys.max()].mean() / size[0]), 4), 'y': 1.0}  # and the lowest (a pole's foot)
            manifest[token][k] = info
    # the bin: one picture
    bpath = os.path.join(src_dir, 'BIN-01.png')
    if os.path.exists(bpath) and not list_only:
        rgb, alpha, bg = key(bpath)
        ys, xs = np.where(alpha > 0.35)
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        im = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA').crop((x0, y0, x1, y1))
        im = im.resize((round(im.width * 0.62), round(im.height * 0.62)), Image.LANCZOS)
        dst = os.path.join(ROOT, 'public', 'process', 'bin.webp')
        im.save(dst, 'WEBP', quality=88, alpha_quality=100, method=6)
        manifest['bin'] = {'w': im.width, 'h': im.height, 'kb': os.path.getsize(dst) // 1024}
        print('bin        BIN-01  %dx%d  %d KB' % (im.width, im.height, os.path.getsize(dst) // 1024))
    if not list_only:
        out = os.path.join(ROOT, 'src', 'components', 'sections', 'process', 'tokens.sprites.ts')
        with open(out, 'w', encoding='utf-8', newline='\n') as f:
            f.write('// Generated by tools/ingest_tokens.py: the size in pixels of every piece of the tool icons (and a few anchor points). Do not edit.\n')
            f.write('export const SPRITES = ')
            json.dump(manifest, f, indent=1)
            f.write(' as const\n')
        total = sum(v['kb'] for t, parts in manifest.items() if t != 'bin' for v in parts.values())
        print('pieces written, %d KB in all' % total)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    run(args[0] if args else os.path.join(ROOT, '_inbox'), '--list' in sys.argv)
