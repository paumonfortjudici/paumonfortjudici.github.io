"""Files the four Process scenes (PR-01..PR-04, drawn on the flat colour of their film frame) into the site.

For each image: find the flat background colour (painted with brush marks, so a soft threshold), key it out so the picture lies on the real frame
colour, pad it to the 14:15 box of the scene, and save public/process/scene-0N.webp (1400 x 1500) and scene-0N-800.webp (800 x 857), transparent.
The bench draws it in place of the vector scene when its step is listed in SCENE_IMAGES (src/components/sections/process/images.ts).

    python tools/ingest_process.py <folder holding PR-01.png .. PR-04.png>

Needs Pillow and numpy. The sources stay where they are (the inbox is not published).
"""
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D0, D1 = 22.0, 56.0  # colour distance under D0 is background (brush marks included), over D1 is drawing, in between is the soft edge
BOX = (1400, 1500)  # the scene box is 14:15
SMALL = (800, 857)


def background_of(a):
    """the flat colour the model painted: the dominant colour along the four edges, refined to its median"""
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
    # un-premultiply the soft edge: pixel = alpha * colour + (1 - alpha) * bg
    safe = np.maximum(alpha, 0.05)[..., None]
    rgb = np.clip((a - (1 - alpha)[..., None] * bg) / safe, 0, 255)
    rgb = np.where(alpha[..., None] < 0.05, a, rgb)
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA'), bg


def fit_box(im):
    """pad (never crop) with transparency to the 14:15 ratio, centred"""
    w, h = im.size
    want = BOX[0] / BOX[1]
    if w / h > want:  # too wide: add height
        nh = round(w / want)
        out = Image.new('RGBA', (w, nh), (0, 0, 0, 0))
        out.paste(im, (0, (nh - h) // 2))
    else:
        nw = round(h * want)
        out = Image.new('RGBA', (nw, h), (0, 0, 0, 0))
        out.paste(im, ((nw - w) // 2, 0))
    return out


def run(src_dir):
    dst_dir = os.path.join(ROOT, 'public', 'process')
    os.makedirs(dst_dir, exist_ok=True)
    for n in range(1, 5):
        path = os.path.join(src_dir, 'PR-%02d.png' % n)
        if not os.path.exists(path):
            print('missing', path)
            continue
        im, bg = key(path)
        im = fit_box(im)
        for size, suffix in ((BOX, ''), (SMALL, '-800')):
            dst = os.path.join(dst_dir, 'scene-%02d%s.webp' % (n, suffix))
            im.resize(size, Image.LANCZOS).save(dst, 'WEBP', quality=84, alpha_quality=92, method=6)
            print('PR-%02d  bg=%s  %dx%d  %d KB  %s' % (n, tuple(int(v) for v in bg), size[0], size[1], os.path.getsize(dst) // 1024, os.path.basename(dst)))


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '_inbox'))
