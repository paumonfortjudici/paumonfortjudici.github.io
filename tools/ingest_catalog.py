"""Files the ten Catalog friezes (CAT-01..CAT-10, drawn on the flat colour of their folder) into the site.

For each image: find the flat background colour, key it out with a soft edge (so the drawing sits on the real band colour, grain and all),
trim the empty margins to the drawing, and save public/works/<slug>/catalog-sketch.webp (transparent, about 2100 x 700, the exact size depends on the
drawing). The page shows it behind the title of the band, cropped to fill the whole folder (see catalog.css, .pm-cat-art).

    python tools/ingest_catalog.py <folder holding CAT-01.png .. CAT-10.png>

Needs Pillow and numpy. The sources stay where they are (the inbox is not published).
"""
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUGS = {
    1: 'contract',
    2: 'plana',
    3: 'fortyfour-lab',
    4: 'spelled-guilty',
    5: 'space-monkey',
    6: 'procreate',
    7: 'somia',
    8: 'concept-brand',
    9: 'concept-portfolio',
    10: 'illustration',
}
# the folder colours (src/lib/works.ts): the picture was drawn on this flat colour
BAND = {
    'contract': '#FF4B2B',
    'plana': '#1F5C46',
    'fortyfour-lab': '#FFB81C',
    'spelled-guilty': '#8A1B3D',
    'space-monkey': '#5B3DF5',
    'procreate': '#FF8FC1',
    'somia': '#0F9AA8',
    'concept-brand': '#86A22F',
    'concept-portfolio': '#FBE79A',
    'illustration': '#B79CFF',
}
D0, D1 = 16.0, 46.0  # colour distance under D0 is background, over D1 is drawing, in between is the soft edge


def hex_rgb(h):
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float64)


def background_of(a, band):
    """the flat colour the model actually painted: the median of the pixels near the requested colour, along the four edges"""
    h, w = a.shape[:2]
    edge = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    near = edge[np.linalg.norm(edge - band, axis=1) < 40]
    return np.median(near, axis=0) if len(near) > 50 else band


def key(path):
    img = Image.open(path).convert('RGB')
    a = np.asarray(img).astype(np.float64)
    return a


def smooth(d):
    t = np.clip((d - D0) / (D1 - D0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def run(src_dir):
    for n, slug in SLUGS.items():
        path = os.path.join(src_dir, 'CAT-%02d.png' % n)
        if not os.path.exists(path):
            print('missing', path)
            continue
        a = key(path)
        bg = background_of(a, hex_rgb(BAND[slug]))
        alpha = smooth(np.linalg.norm(a - bg, axis=2))
        # un-premultiply the soft edge: pixel = alpha * colour + (1 - alpha) * bg
        safe = np.maximum(alpha, 0.05)[..., None]
        rgb = np.clip((a - (1 - alpha)[..., None] * bg) / safe, 0, 255)
        rgb = np.where(alpha[..., None] < 0.05, a, rgb)
        out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
        im = Image.fromarray(out, 'RGBA')
        # trim the empty flat margins: the band shows the picture cropped to fill the whole folder, so no strip of bare colour may be left
        # at any edge (anything fainter than 35% alpha, a speck of grain, does not count as drawing)
        box = Image.fromarray((alpha > 0.35).astype(np.uint8) * 255).getbbox()
        if box:
            im = im.crop(box)
        dst_dir = os.path.join(ROOT, 'public', 'works', slug)
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, 'catalog-sketch.webp')
        im.save(dst, 'WEBP', quality=82, alpha_quality=92, method=6)
        print('%-18s bg=%s  %dx%d  %d KB' % (slug, tuple(int(v) for v in bg), im.width, im.height, os.path.getsize(dst) // 1024))


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '_inbox'))
