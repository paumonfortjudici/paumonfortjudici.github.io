# Builds src/worlds/contract/atlas.webp: one 8 x 2 sprite sheet with a small picture of every position of the book
# (front cover, 14 two-page spreads, back cover) so the contact-sheet rail needs one request instead of thirty.
# Re-run with the venv python:  python -I -X utf8 src/worlds/contract/atlas.build.py   (from the repo root)
# Reads public/works/contract/manifest.json and pages/*.webp; frames are 192 x 128 px, row-major, in spread order.
import json
import os
from PIL import Image, ImageDraw

ROOT = os.path.join('public', 'works', 'contract')
OUT = os.path.join('src', 'worlds', 'contract', 'atlas.webp')
FW, FH = 192, 128
PW, PH = FW // 2, FH
COLS, ROWS = 8, 2

manifest = json.load(open(os.path.join(ROOT, 'manifest.json'), encoding='utf-8'))
pages = {p['n']: p for p in manifest['pages']}

def thumb(n):
    im = Image.open(os.path.join(ROOT, pages[n]['file'])).convert('RGB')
    return im.resize((PW, PH), Image.LANCZOS)

def gutter(frame):
    # a soft shade where the two pages meet, so a spread reads as a book and not as two loose pictures
    shade = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    px = shade.load()
    for x in range(PW - 7, PW + 7):
        a = int(70 * (1 - abs(x - PW + 0.5) / 7))
        for y in range(FH):
            px[x, y] = (30, 18, 8, max(0, a))
    frame.alpha_composite(shade)

sheet = Image.new('RGBA', (FW * COLS, FH * ROWS), (0, 0, 0, 0))
for i, sp in enumerate(manifest['spreads']):
    frame = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    if len(sp) == 1:
        frame.paste(thumb(sp[0]), (PW // 2, 0))
    else:
        frame.paste(thumb(sp[0]), (0, 0))
        frame.paste(thumb(sp[1]), (PW, 0))
        gutter(frame)
    sheet.paste(frame, ((i % COLS) * FW, (i // COLS) * FH))

sheet.save(OUT, 'WEBP', quality=72, method=6)
print(OUT, sheet.size, os.path.getsize(OUT), 'bytes', len(manifest['spreads']), 'frames')
