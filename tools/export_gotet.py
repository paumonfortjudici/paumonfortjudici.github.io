"""Exports the rendered Gotet brand board and its pieces into the site (public/works/concept-brand/art).

Render first (from the repo root):
    for f in art-src/concept-brand/mockups/m*.svg; do node tools/render-svg.mjs --in $f --out art-src/concept-brand/board/mockups/$(basename $f .svg).png --scale 2 --transparent; done
    for n in 1 2 3; do node tools/render-svg.mjs --in art-src/concept-brand/posters/poster-$n.svg --out "art-src/concept-brand/board/posters/poster-$n@2x.png" --scale 2; done
    node tools/render-svg.mjs --in art-src/concept-brand/board.html --out art-src/concept-brand/board/board.png --selector "#board"
    node tools/render-svg.mjs --in art-src/concept-brand/mascots/cast.svg --out art-src/concept-brand/board/cast.png --scale 2 --transparent
    node tools/render-svg.mjs --in art-src/concept-brand/mascots/cast-sheet.svg --out art-src/concept-brand/board/cast-sheet.png
Then:  python tools/export_gotet.py

Writes: art/board.webp (3000 x 4243), board-small.webp (1000 x 1414), board-bottom.webp (rows 1560 to 4243), board-bottom-small.webp (1000 x 894),
art/mockups/m01..m20.webp (the 2x PNGs), art/posters/poster-N.webp (1200 x 1700), art/brand/cast.webp, art/brand/s/cast.webp (1400 wide),
art/brand/cast-sheet.webp. The mascot files themselves come from tools/ingest_gotet.py and the card pictures from tools/build_gotet_cards.py.
"""
import glob
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src', 'concept-brand', 'board')
ART = os.path.join(ROOT, 'public', 'works', 'concept-brand', 'art')


def save(im, path, q=84, alpha=False):
    if alpha:
        im.save(path, 'WEBP', quality=q, alpha_quality=100, method=6)
    else:
        im.convert('RGB').save(path, 'WEBP', quality=q, method=6)
    print(os.path.relpath(path, ART), im.size, os.path.getsize(path) // 1024, 'KB')


board = Image.open(os.path.join(SRC, 'board.png')).convert('RGB')
save(board, os.path.join(ART, 'board.webp'))
save(board.resize((1000, 1414), Image.LANCZOS), os.path.join(ART, 'board-small.webp'), 82)
bottom = board.crop((0, 1560, 3000, 4243))
save(bottom, os.path.join(ART, 'board-bottom.webp'))
save(bottom.resize((1000, 894), Image.LANCZOS), os.path.join(ART, 'board-bottom-small.webp'), 82)
for p in sorted(glob.glob(os.path.join(SRC, 'mockups', 'm*.png'))):
    save(Image.open(p).convert('RGBA'), os.path.join(ART, 'mockups', os.path.basename(p)[:-4] + '.webp'), 84, alpha=True)
for n in (1, 2, 3):
    im = Image.open(os.path.join(SRC, 'posters', 'poster-%d@2x.png' % n)).convert('RGB').resize((1200, 1700), Image.LANCZOS)
    save(im, os.path.join(ART, 'posters', 'poster-%d.webp' % n))
cast = Image.open(os.path.join(SRC, 'cast.png')).convert('RGBA')
save(cast, os.path.join(ART, 'brand', 'cast.webp'), 86, alpha=True)
save(cast.resize((1400, round(1400 * cast.height / cast.width)), Image.LANCZOS), os.path.join(ART, 'brand', 's', 'cast.webp'), 84, alpha=True)
save(Image.open(os.path.join(SRC, 'cast-sheet.png')).convert('RGB'), os.path.join(ART, 'brand', 'cast-sheet.webp'), 82)
