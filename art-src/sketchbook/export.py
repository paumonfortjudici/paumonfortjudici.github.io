"""Files the printed pages of the sketchbook: python -I -X utf8 art-src/sketchbook/export.py

art-src/sketchbook/_build/<id>.png (render.mjs, 1200 x 1600)  ->  public/works/procreate/book/<id>.webp
Every page keeps its grain, so the WebP quality is a trade between weight and the paper tooth (q80 keeps both).
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, '_build')
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'public', 'works', 'procreate', 'book'))
os.makedirs(OUT, exist_ok=True)

IDS = ['cover'] + [f'p-{n:02d}' for n in range(2, 18)] + ['back']
only = sys.argv[1:]
total = 0
for pid in IDS:
    if only and pid not in only:
        continue
    src = os.path.join(BUILD, pid + '.png')
    if not os.path.exists(src):
        print('MISSING', src)
        sys.exit(1)
    im = Image.open(src).convert('RGB')
    dst = os.path.join(OUT, pid + '.webp')
    im.save(dst, 'WEBP', quality=80, method=6)
    size = os.path.getsize(dst)
    total += size
    print(f'{pid:8s} {im.width}x{im.height} {size // 1024:4d} KB')
print(f'{total // 1024} KB')
