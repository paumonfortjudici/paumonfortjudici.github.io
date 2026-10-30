"""Builds the two card pictures of the Gotet folder from the (new) cast: public/works/concept-brand/thumb.webp (720 x 900) and peek.webp (the
jumping glass, cut out with a cream die-cut halo and without its ground ellipse).

    python tools/build_gotet_cards.py

thumb: the brand's faint pattern as the ground, the huge red g and olive o of the wordmark (cut by the frame at the t), the cast in a row under them
(Xip cut by the right edge) and the scalloped Blau hem. peek: raw/gotet-b.png (the trimmed piece made by ingest_gotet.py) minus the flat ellipse.
Needs Pillow and numpy; run tools/ingest_gotet.py first.
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, 'public', 'works', 'concept-brand', 'art', 'brand')
MASC = os.path.join(ROOT, 'art-src', 'concept-brand', 'mascots')
OUT = os.path.join(ROOT, 'public', 'works', 'concept-brand')
ROSAT, BLAU, INK = (248, 210, 208), (35, 64, 192), (33, 23, 54)


def thumb():
    W, H = 720, 900
    im = Image.new('RGB', (W, H), ROSAT)
    tile = Image.open(os.path.join(BRAND, 'pattern-tile-faint.webp')).convert('RGB').resize((520, 520), Image.LANCZOS)
    for y in range(-60, H, 520):
        for x in range(-40, W, 520):
            im.paste(tile, (x, y))
    wm = Image.open(os.path.join(BRAND, 'logo-wordmark.webp')).convert('RGBA')
    s = 0.5155
    wm = wm.resize((round(wm.width * s), round(wm.height * s)), Image.LANCZOS)
    im.paste(wm, (15, 12), wm)
    k = 0.18
    ground = 745
    for name, cx in (('gotet-a', 128), ('oliva-a', 338), ('sifo-a', 560), ('xip-a', 805)):
        c = Image.open(os.path.join(MASC, 'png', name + '.png')).convert('RGBA')
        c = c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS)
        im.paste(c, (round(cx - c.width / 2), round(ground - 2138 * k)), c)
    # the scalloped Blau hem, drawn at 4x so the edge is smooth
    S = 4
    hem = Image.new('RGBA', (W * S, 70 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(hem)
    d.rectangle([0, 0, W * S, 70 * S], fill=BLAU + (255,))
    r = 30
    for i in range(-1, W // (2 * r) + 2):
        cx = i * 2 * r + r
        d.ellipse([(cx - r) * S, (-r - 4) * S, (cx + r) * S, (r - 4 + 6) * S], fill=ROSAT + (255,), outline=INK + (255,), width=5 * S)
    d.rectangle([0, 0, W * S, 6 * S], fill=ROSAT + (255,))
    hem = hem.resize((W, 70), Image.LANCZOS)
    im.paste(hem, (0, H - 70), hem)
    im.save(os.path.join(OUT, 'thumb.webp'), 'WEBP', quality=86, method=6)
    print('thumb', os.path.getsize(os.path.join(OUT, 'thumb.webp')) // 1024, 'KB')


def peek():
    g = Image.open(os.path.join(MASC, 'raw', 'gotet-b.png')).convert('RGBA')
    a = np.asarray(g).copy()
    # drop the flat ground ellipse: in this pose it floats far under the feet, so it is the last block of rows after an empty gap
    rows = (a[..., 3] > 40).any(axis=1)
    last = len(rows) - 1
    while last > 0 and rows[last]:
        last -= 1  # last is now the last empty row above the ellipse
    cut = last + 1 if last > 0 else len(rows)
    if cut < len(rows) - 1:
        a[cut:, :, 3] = 0
    g = Image.fromarray(a, 'RGBA')
    bb = g.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    g = g.crop(bb)
    H = 633
    s = (H - 2 * 18) / g.height
    g = g.resize((round(g.width * s), round(g.height * s)), Image.LANCZOS)
    W = g.width + 2 * 18
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    layer.paste(g, (18, 18), g)
    # the cream die-cut halo: the silhouette grown by 9 px, softened at the edge
    alpha = layer.getchannel('A').point(lambda v: 255 if v > 40 else 0)
    halo = alpha.filter(ImageFilter.MaxFilter(19)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cream = Image.new('RGBA', (W, H), (251, 242, 223, 255))
    out.paste(cream, (0, 0), halo)
    out.alpha_composite(layer)
    out.save(os.path.join(OUT, 'peek.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
    print('peek', out.size, os.path.getsize(os.path.join(OUT, 'peek.webp')) // 1024, 'KB')


if __name__ == '__main__':
    thumb()
    peek()
