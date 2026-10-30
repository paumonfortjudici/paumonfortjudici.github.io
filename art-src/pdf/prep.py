"""Prepares the pictures of the portfolio PDF: art-src/pdf/prep.py

Chrome embeds a JPEG as it is but re-encodes every WebP as raw pixels, so a PDF built straight from the site's .webp files would weigh
tens of MB. This script converts each picture the PDF uses to a JPEG (opaque) or a PNG (has transparency) at the size it is shown at,
into art-src/pdf/_build/img/<key>.<ext>, and writes _build/img/index.json (key -> file, width, height) for build.mjs.

Run:  python -I -X utf8 art-src/pdf/prep.py
Only pictures that are already published on the site are used (public/), so nothing here adds a claim or a private file.
"""
import json
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.normpath(os.path.join(HERE, '..', '..', 'public'))
OUT = os.path.join(HERE, '_build', 'img')
os.makedirs(OUT, exist_ok=True)

SLUGS = ['contract', 'plana', 'fortyfour-lab', 'spelled-guilty', 'space-monkey', 'procreate', 'somia', 'concept-brand', 'concept-portfolio', 'illustration']

# key -> (path under public/, longest side in px). Each side is about 1.7x what the picture measures on the 1920 px page (see ART in
# build.mjs): sharp on a 4K screen, and the whole PDF stays under 5 MB (SEEK and many application forms refuse more).
PICS = {
    'about-portrait': ('about/poster.webp', 1000),
    'p-contract-cover': ('works/contract/cover.webp', 860),
    'p-contract-l': ('works/contract/pages/p-150.webp', 570),
    'p-contract-r': ('works/contract/pages/p-151.webp', 570),
    'p-plana-web': ('works/plana/board/mockup-website.webp', 1020),
    'p-plana-stationery': ('works/plana/board/mockup-stationery.webp', 1020),
    'p-fortyfour-lab-devil': ('works/fortyfour-lab/logo/lockup-cutout.webp', 650),
    'p-fortyfour-lab-rug1': ('works/fortyfour-lab/posts/2023-03-08-CpiPiE6I2on-01.webp', 700),
    'p-fortyfour-lab-rug2': ('works/fortyfour-lab/posts/2023-03-14-CpxGI67D-xW-01.webp', 640),
    'p-spelled-guilty-wrap': ('works/spelled-guilty/cover-wrap.webp', 1020),
    'p-spelled-guilty-pages': ('works/spelled-guilty/marketing/one-case-two-pages.webp', 1050),
    'p-space-monkey-tyler': ('works/space-monkey/tyler.webp', 760),
    'p-space-monkey-smith': ('works/space-monkey/smith.webp', 700),
    'p-space-monkey-patch': ('works/space-monkey/logo-monkey-patch@3x.png', 400),
    'p-procreate-a': ('works/procreate/book/p-04.webp', 750),
    'p-procreate-b': ('works/procreate/book/p-08.webp', 680),
    'p-procreate-c': ('works/procreate/book/p-10.webp', 600),
    'p-somia-hero': ('works/somia/web/home-desktop-hero@2x.webp', 1020),
    'p-somia-collection': ('works/somia/web/masked/collection-vincles-desktop-01.webp', 640),
    'p-somia-mobile': ('works/somia/web/home-mobile-01.webp', 700),
    'p-concept-brand-board': ('works/concept-brand/art/board.webp', 1130),
    'p-concept-brand-logo': ('works/concept-brand/art/brand/logo-primary.webp', 720),
    'p-concept-brand-poster': ('works/concept-brand/art/posters/poster-1.webp', 540),
    'p-concept-portfolio-1': ('works/concept-portfolio/art/slide-1.webp', 790),
    'p-concept-portfolio-2': ('works/concept-portfolio/art/slide-2.webp', 790),
    'p-concept-portfolio-3': ('works/concept-portfolio/art/slide-3.webp', 790),
    'p-illustration-sheet': ('works/illustration/art/sheet.webp', 1000),
    'p-illustration-s3': ('works/illustration/art/sticker-03.webp', 500),
    'p-illustration-s8': ('works/illustration/art/sticker-08.webp', 520),
}
for s in SLUGS:
    PICS[f'in-{s}'] = (f'works/{s}/inside.webp', 900)
for n in range(1, 5):
    PICS[f'process-{n}'] = (f'process/scene-0{n}.webp', 560)

# the Process scenes sit on the cream of their page: flatten them (a JPEG is five times lighter than their soft-edged PNG)
FLATTEN = {f'process-{n}': (255, 242, 218) for n in range(1, 5)}


def has_alpha(im: Image.Image) -> bool:
    if im.mode not in ('RGBA', 'LA', 'PA'):
        return False
    lo, _ = im.getchannel('A').getextrema()
    return lo < 250


index = {}
total = 0
for key, (rel, side) in PICS.items():
    src = os.path.join(PUBLIC, *rel.split('/'))
    if not os.path.exists(src):
        print('MISSING', rel)
        sys.exit(1)
    im = Image.open(src)
    im.load()
    if max(im.size) > side:
        k = side / max(im.size)
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    if key in FLATTEN and im.mode in ('RGBA', 'LA', 'PA'):
        flat = Image.new('RGBA', im.size, FLATTEN[key] + (255,))
        flat.alpha_composite(im.convert('RGBA'))
        im = flat
    if has_alpha(im):
        name = f'{key}.png'
        im.convert('RGBA').save(os.path.join(OUT, name), optimize=True)
    else:
        name = f'{key}.jpg'
        im.convert('RGB').save(os.path.join(OUT, name), quality=72, optimize=True, progressive=True)
    size = os.path.getsize(os.path.join(OUT, name))
    total += size
    index[key] = {'file': name, 'w': im.width, 'h': im.height}
    print(f'{name:38s} {im.width:5d}x{im.height:<5d} {size // 1024:5d} KB')

with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf8') as fp:
    json.dump(index, fp, indent=1)
print(f'{len(index)} pictures, {total // 1024} KB')
