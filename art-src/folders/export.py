"""Files the printed folder interiors (art-src/folders/_build/<slug>.png) into the site as public/works/<slug>/inside.webp (900 x 1125).

    python art-src/folders/export.py [slug ...]      (default: every slug that has a PNG)
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
BUILD = os.path.join(HERE, '_build')
SLUGS = ['contract', 'plana', 'fortyfour-lab', 'spelled-guilty', 'space-monkey', 'procreate', 'somia', 'concept-brand', 'concept-portfolio', 'illustration']

for slug in sys.argv[1:] or SLUGS:
    src = os.path.join(BUILD, slug + '.png')
    if not os.path.exists(src):
        print('missing', slug)
        continue
    im = Image.open(src).convert('RGB').resize((900, 1125), Image.LANCZOS)
    dst = os.path.join(ROOT, 'public', 'works', slug, 'inside.webp')
    im.save(dst, 'WEBP', quality=84, method=6)
    print(slug, os.path.getsize(dst) // 1024, 'KB')
