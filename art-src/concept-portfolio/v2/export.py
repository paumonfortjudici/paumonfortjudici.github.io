"""Exports the printed slides (v2/_build/slide-N.png) into the site: slide-1..5.webp, sheet.webp (the five side by side), contact-sheet.webp (stacked),
thumb.webp (the cover), the card pictures thumb.webp and peek.webp (from card.mjs), and prints the sizes.

    python art-src/concept-portfolio/v2/export.py        (after: node render.mjs, node card.mjs)
"""
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
BUILD = os.path.join(HERE, '_build')
ART = os.path.join(ROOT, 'public', 'works', 'concept-portfolio', 'art')
CARD = os.path.join(ROOT, 'public', 'works', 'concept-portfolio')
INK = (16, 24, 32)

slides = [Image.open(os.path.join(BUILD, 'slide-%d.png' % n)).convert('RGB') for n in range(1, 6)]
for n, im in enumerate(slides, 1):
    p = os.path.join(ART, 'slide-%d.webp' % n)
    im.save(p, 'WEBP', quality=84, method=6)
    print('slide', n, os.path.getsize(p) // 1024, 'KB')

# the wide sheet: five slides 504 x 896 with 20 px ink gutters (2600 x 896)
sheet = Image.new('RGB', (5 * 504 + 4 * 20, 896), INK)
for i, im in enumerate(slides):
    sheet.paste(im.resize((504, 896), Image.LANCZOS), (i * 524, 0))
sheet.save(os.path.join(ART, 'sheet.webp'), 'WEBP', quality=82, method=6)

# the contact sheet: the five slides stacked, 720 x 1280 each
cs = Image.new('RGB', (720, 6400), INK)
for i, im in enumerate(slides):
    cs.paste(im.resize((720, 1280), Image.LANCZOS), (0, i * 1280))
cs.save(os.path.join(ART, 'contact-sheet.webp'), 'WEBP', quality=80, method=6)

slides[0].resize((700, 1244), Image.LANCZOS).save(os.path.join(ART, 'thumb.webp'), 'WEBP', quality=84, method=6)

t = os.path.join(BUILD, 'card-thumb.png')
if os.path.exists(t):
    Image.open(t).convert('RGB').save(os.path.join(CARD, 'thumb.webp'), 'WEBP', quality=86, method=6)
k = os.path.join(BUILD, 'card-peek.png')
if os.path.exists(k):
    Image.open(k).convert('RGBA').save(os.path.join(CARD, 'peek.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
for f in ('sheet', 'contact-sheet', 'thumb'):
    print(f, os.path.getsize(os.path.join(ART, f + '.webp')) // 1024, 'KB')
