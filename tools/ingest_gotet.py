"""Files the redrawn Gotet cast (GT-01..GT-13, each character drawn on flat cyan #00E5FF in the 90s rubber-hose style) into the site.

    python tools/ingest_gotet.py <folder holding GT-01.png .. GT-13.png> [--list]

1. Key the cyan out (cyan-ness = min(G, B) - R, soft edge, un-premultiply, rim colours borrowed from inside so no cyan fringe is left).
2. Poses (GT-01 Gotet A, 02 B, 04 Oliva A, 05 B, 07 Sifo A, 08 B, 10 Xip A, 11 B): trim; find the CORE of the character (the big pieces:
   body, limbs, shoes and the flat ground ellipse; sparkles and motion marks are small and stay outside the core).
   The two "clean" Sifo versions (no soda arc: the posters use them) are the same art with the arc and the bubbles erased (ERASE below).
3. Heads (GT-03, 06, 09, 12: four faces each, E1 Hola, E2 Xin-xin, E3 Psst, E4 Mmm): split into the four heads.
4. Every piece goes onto the same canvas as the old cast (poses 2000 x 2200 with the ground ellipse ending on y 2138 and the core centred on x 1000;
   heads 2000 x 2000), so nothing that uses the cast (the 20 mockups, the 3 posters, the board's live top zone, the hit areas) has to move.
   Scale: one factor per character (the core of pose A as tall as the old character was, but never wider than WMAX), shared by its poses.

Writes art-src/concept-brand/mascots/png/*.png (the canvases) and art-src/concept-brand/mascots/raw/*.png (trimmed pieces),
mascots.json (core boxes in canvas pixels: the hit areas of the board) and, with --publish, the WebPs of public/works/concept-brand/art/brand
(mascot-*.webp, s/pose-*.webp, s/head-*.webp) and the SVG wrappers that the mockups, posters and the board refer to.
Needs Pillow and numpy.
"""
import base64
import io
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASC = os.path.join(ROOT, 'art-src', 'concept-brand', 'mascots')
PUB = os.path.join(ROOT, 'public', 'works', 'concept-brand', 'art', 'brand')

M0, M1 = 45.0, 170.0  # cyan-ness under M0 is drawing, over M1 is background
CW, CH = 2000, 2200  # pose canvas
GROUND = 2138  # y where the old characters' ground ellipse ended
HW = 2000  # head canvas (square)
HBOX = (1780, 1740)  # the old heads filled about this much of their canvas
HCY = 1004

POSES = {
    'gotet-a': 'GT-01', 'gotet-b': 'GT-02',
    'oliva-a': 'GT-04', 'oliva-b': 'GT-05',
    'sifo-a': 'GT-07', 'sifo-b': 'GT-08',
    'xip-a': 'GT-10', 'xip-b': 'GT-11',
}
HEADS = {'gotet': 'GT-03', 'oliva': 'GT-06', 'sifo': 'GT-09', 'xip': 'GT-12'}
# the faces the site uses: head-1 and head-2 of each character are two of E1 Hola, E2 Xin-xin, E3 Psst, E4 Mmm (indexes into the sheet, left to right)
FACES = {'gotet': (3, 1), 'oliva': (0, 3), 'sifo': (0, 2), 'xip': (2, 1)}
# how tall each character's core was in the old pose A (canvas pixels), and the widest a core may get
OLD_H = {'gotet': 1392, 'oliva': 1568, 'sifo': 1922, 'xip': 1328}
WMAX = 1560
# the soda arc and its bubbles, erased for the "clean" Sifo (boxes in the pose's own pixels, x0, y0, x1, y1)
ERASE = {
    'sifo-a': [(700, 310, 1122, 700), (880, 700, 1122, 860)],
    'sifo-b': [(606, 40, 1122, 340), (980, 330, 1122, 440)],
}


def key(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float64)
    m = np.minimum(a[..., 1], a[..., 2]) - a[..., 0]
    t = np.clip((m - M0) / (M1 - M0), 0.0, 1.0)
    alpha = 1.0 - t * t * (3 - 2 * t)
    bg = np.array([0.0, 229.0, 255.0])
    safe = np.maximum(alpha, 0.05)[..., None]
    rgb = np.clip((a - (1 - alpha)[..., None] * bg) / safe, 0, 255)
    rgb = np.where(alpha[..., None] < 0.05, a, rgb)
    # rim: a half-transparent pixel next to the floor takes the colour of the solid pixels just inside it
    gone = (alpha < 0.02).astype(np.uint8) * 255
    near = np.asarray(Image.fromarray(gone).filter(ImageFilter.GaussianBlur(4))).astype(np.float64) / 255.0 > 0.02
    core = (alpha > 0.97) & ~near
    wsum = np.asarray(Image.fromarray(core.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(6))).astype(np.float64) / 255.0
    rim = near & (alpha < 0.97) & (wsum > 0.01)
    for c in range(3):
        ch = Image.fromarray((rgb[..., c] * core).astype(np.uint8))
        col = np.asarray(ch.filter(ImageFilter.GaussianBlur(6))).astype(np.float64) / np.maximum(wsum, 1e-3)
        rgb[..., c] = np.where(rim, np.clip(col, 0, 255), rgb[..., c])
    return rgb, alpha


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


def pieces(alpha, dil=1, min_area=40):
    """connected pieces of the drawing on a quarter-size map: [{'id', 'bbox' (full-res x0, y0, x1, y1), 'area' (full-res px)}], and the full-size label map"""
    G = 4
    H, W = alpha.shape
    solid = (alpha > 0.4).astype(np.uint8) * 255
    small = np.asarray(Image.fromarray(solid).resize((-(-W // G), -(-H // G)), Image.BOX)) > 60
    for _ in range(dil):
        p = np.pad(small, 1)
        small = p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    lab_s, n = label(small)
    lab = np.repeat(np.repeat(lab_s, G, axis=0), G, axis=1)[:H, :W]
    lab = np.where(alpha > 0.04, lab, 0)
    out = []
    for i in range(1, n + 1):
        ys, xs = np.where((lab == i) & (alpha > 0.4))
        if len(xs) < min_area * G * G // 4:
            continue
        out.append({'id': i, 'bbox': (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1), 'area': int(len(xs))})
    return out, lab


def core_box(ps, share=0.05):
    big = max(p['area'] for p in ps)
    keep = [p for p in ps if p['area'] >= big * share]
    return (min(p['bbox'][0] for p in keep), min(p['bbox'][1] for p in keep), max(p['bbox'][2] for p in keep), max(p['bbox'][3] for p in keep)), keep


def split_columns(alpha, n):
    """cut a row of n equal heads: the cut is the emptiest column near each equal division of the drawing's width (the heads of a sheet are drawn evenly spaced and can touch)"""
    mass = (alpha > 0.4).sum(axis=0).astype(np.float64)
    mass = np.convolve(mass, np.ones(9) / 9, mode='same')
    xs = np.where(mass > 0)[0]
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    cuts = [x0]
    span = x1 - x0
    for k in range(1, n):
        c = x0 + span * k / n
        lo, hi = int(c - span * 0.09), int(c + span * 0.09)
        cuts.append(lo + int(np.argmin(mass[lo:hi])))
    cuts.append(x1)
    return cuts


def rgba(rgb, alpha):
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')


def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(bb), bb


def erase(im, boxes):
    a = np.asarray(im).copy()
    for x0, y0, x1, y1 in boxes:
        a[y0:y1, x0:x1, 3] = 0
    return Image.fromarray(a, 'RGBA')


def place(im, core, scale, cx, bottom, canvas):
    """paste `im` (scaled) so that the core box is centred on x = cx and its bottom is on y = bottom"""
    w, h = round(im.width * scale), round(im.height * scale)
    big = im.resize((w, h), Image.LANCZOS)
    x = round(cx - (core[0] + core[2]) / 2 * scale)
    y = round(bottom - core[3] * scale)
    layer = Image.new('RGBA', canvas, (0, 0, 0, 0))
    layer.paste(big, (x, y), big)
    return layer


def run(src, list_only, publish):
    os.makedirs(os.path.join(MASC, 'raw'), exist_ok=True)
    os.makedirs(os.path.join(MASC, 'png'), exist_ok=True)
    info = {}
    raws = {}
    for name, gid in POSES.items():
        p = os.path.join(src, gid + '.png')
        rgb, alpha = key(p)
        full = rgba(rgb, alpha)
        im, bb = trim(full)
        ps, lab = pieces(np.asarray(im.getchannel('A')).astype(np.float64) / 255.0, dil=1)
        core, keep = core_box(ps)
        raws[name] = (im, core)
        info[name] = {'core': core, 'size': im.size, 'pieces': len(ps), 'kept': len(keep)}
        im.save(os.path.join(MASC, 'raw', name + '.png'))
        print(name, im.size, 'core', core, 'pieces', len(ps), 'kept', len(keep))
        base = name.split('-')[0]
        if base == 'sifo':
            clean = erase(full, ERASE[name])
            cim, cbb = trim(clean)
            # the clean one is placed with the SAME box as the one with the arc, so the two stay aligned on the canvas
            raws[name + '-clean'] = (cim, (core[0] - (cbb[0] - bb[0]), core[1] - (cbb[1] - bb[1]), core[2] - (cbb[0] - bb[0]), core[3] - (cbb[1] - bb[1])))
            cim.save(os.path.join(MASC, 'raw', name + '-clean.png'))
    # one scale per character, from its pose A core
    scale = {}
    for ch in OLD_H:
        im, core = raws[ch + '-a']
        ch_h, ch_w = core[3] - core[1], core[2] - core[0]
        s = OLD_H[ch] / ch_h
        if ch_w * s > WMAX:
            s = WMAX / ch_w
        scale[ch] = s
        print(ch, 'scale', round(s, 3), 'core on canvas', round(ch_w * s), 'x', round(ch_h * s))
    boxes = {}
    canvases = {}
    for name, (im, core) in raws.items():
        ch = name.split('-')[0]
        layer = place(im, core, scale[ch], 1000, GROUND, (CW, CH))
        canvases[name] = layer
        s = scale[ch]
        # the core box on the canvas (the hit area of the board)
        boxes[name] = [round(1000 - (core[2] - core[0]) / 2 * s), round(GROUND - (core[3] - core[1]) * s), round(1000 + (core[2] - core[0]) / 2 * s), GROUND]
        bb = layer.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        if bb[0] < 0 or bb[1] < 0 or bb[2] > CW or bb[3] > CH:
            print('  !! leaves the canvas', name, bb)
        layer.save(os.path.join(MASC, 'png', name + '.png'))
    # heads
    for ch, gid in HEADS.items():
        rgb, alpha = key(os.path.join(src, gid + '.png'))
        full = rgba(rgb, alpha)
        cuts = split_columns(alpha, 4)
        ps = []
        for k in range(4):
            sub = full.crop((cuts[k], 0, cuts[k + 1], full.height))
            sub, _ = trim(sub)
            ps.append(sub)
            sub.save(os.path.join(MASC, 'raw', 'head-%s-e%d.png' % (ch, k + 1)))
            raws['head-%s-e%d' % (ch, k + 1)] = (sub, None)
        # one scale for the four faces of a character (they are drawn the same size), so a head keeps its size between faces
        sizes = [im.size for im in ps]
        s = min(HBOX[0] / max(w for w, h in sizes), HBOX[1] / max(h for w, h in sizes))
        for n, face in enumerate(FACES[ch], 1):
            im = raws['head-%s-e%d' % (ch, face + 1)][0]
            w, h = round(im.width * s), round(im.height * s)
            big = im.resize((w, h), Image.LANCZOS)
            layer = Image.new('RGBA', (HW, HW), (0, 0, 0, 0))
            layer.paste(big, (round(1000 - w / 2), round(HCY - h / 2)), big)
            layer.save(os.path.join(MASC, 'png', '%s-head-%d.png' % (ch, n)))
            canvases['%s-head-%d' % (ch, n)] = layer
        # all four faces (the panel shows E1 to E4)
        for k in range(len(ps)):
            im = raws['head-%s-e%d' % (ch, k + 1)][0]
            w, h = round(im.width * s), round(im.height * s)
            big = im.resize((w, h), Image.LANCZOS)
            layer = Image.new('RGBA', (HW, HW), (0, 0, 0, 0))
            layer.paste(big, (round(1000 - w / 2), round(HCY - h / 2)), big)
            layer.save(os.path.join(MASC, 'png', '%s-face-e%d.png' % (ch, k + 1)))
    with open(os.path.join(MASC, 'mascots.json'), 'w', encoding='utf-8') as f:
        json.dump({'scale': scale, 'core': boxes}, f, indent=1)
    if list_only:
        return
    if publish:
        publish_all(canvases)


def b64(im, q=88):
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, alpha_quality=100, method=6)
    return base64.b64encode(buf.getvalue()).decode()


def publish_all(canvases):
    os.makedirs(os.path.join(PUB, 's'), exist_ok=True)
    for name, layer in canvases.items():
        if '-head-' in name:
            ch, _, n = name.split('-')
            out = 'mascot-%s-head-%s' % (ch, n)
            layer.save(os.path.join(PUB, out + '.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
            layer.resize((360, 360), Image.LANCZOS).save(os.path.join(PUB, 's', 'head-%s-%s.webp' % (ch, n)), 'WEBP', quality=86, alpha_quality=100, method=6)
            svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000"><title>%s</title><image href="data:image/webp;base64,%s" width="1000" height="1000"/></svg>' % (name, b64(layer))
            with open(os.path.join(MASC, 'heads', '%s-head-%s.svg' % (ch, n)), 'w', encoding='utf-8') as f:
                f.write(svg)
        else:
            out = 'mascot-' + name
            layer.save(os.path.join(PUB, out + '.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
            if not name.endswith('clean'):
                ch, pose = name.split('-')
                layer.resize((480, 528), Image.LANCZOS).save(os.path.join(PUB, 's', 'pose-%s-%s.webp' % (ch, pose)), 'WEBP', quality=86, alpha_quality=100, method=6)
            svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1100" width="1000" height="1100"><title>%s</title><image href="data:image/webp;base64,%s" width="1000" height="1100"/></svg>' % (name, b64(layer))
            with open(os.path.join(MASC, name + '.svg'), 'w', encoding='utf-8') as f:
                f.write(svg)
    print('published', len(canvases), 'pieces')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__)
        sys.exit(1)
    run(args[0], '--list' in sys.argv, '--publish' in sys.argv)
