"""finalize.py [sheet.png] [layout.json] [webp quality] [--out DIR]
  -> public/works/illustration/art/{sheet.webp (2400 x 3200), thumb.webp (700 px wide), manifest.json, sheet-layout.json}
manifest.json: [{n, file, thumb, caption, accent, hex, w, h, alt}], file / thumb relative to public/works/illustration/art/."""
import sys, json, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shapes import *

PUBLIC = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'public', 'works', 'illustration', 'art'))
argv = sys.argv[1:]
OUT = PUBLIC
if '--out' in argv:
    i = argv.index('--out')
    OUT = os.path.abspath(argv[i + 1])
    del argv[i:i + 2]
OUT += os.sep
STICKERS = PUBLIC + os.sep   # the nine sticker webps + their thumbs
os.makedirs(OUT, exist_ok=True)
sheet_png = argv[0] if len(argv) > 0 else os.path.join(WORK, 'sheet.png')
layout_json = argv[1] if len(argv) > 1 else os.path.join(HERE, 'layout.json')
Q_SHEET = int(argv[2]) if len(argv) > 2 else 88

im = Image.open(sheet_png).convert('RGB')
assert im.size == (2400, 3200), im.size
im.save(OUT + 'sheet.webp', 'WEBP', quality=Q_SHEET, method=6)
th = im.resize((700, 933), Image.LANCZOS)
th.save(OUT + 'thumb.webp', 'WEBP', quality=82, method=6)
print('sheet.webp', os.path.getsize(OUT + 'sheet.webp') // 1024, 'KB; thumb.webp', os.path.getsize(OUT + 'thumb.webp') // 1024, 'KB')

CAP = {1: 'Boombox ollie', 2: 'Just one more chapter', 3: 'Coffee first, pixels later', 4: 'Small me, big plant',
       5: 'Quiet on set!', 6: 'Case of the missing sock', 7: 'Tuft happens', 8: 'Houston, we have bananas', 9: 'Headphones on, world off'}
ACC = {1: ('lilac', '#C6B1FE'), 2: ('tangerine', '#FFA65F'), 3: ('sky', '#85CEF9'), 4: ('mint', '#8EEBC3'), 5: ('butter', '#FCE67A'),
       6: ('tomato', '#FE7D6C'), 7: ('pink', '#FF9FC5'), 8: ('teal', '#66CBC7'), 9: ('lime', '#C5EB7C')}
ALT = json.load(open(os.path.join(HERE, 'alt.json'), encoding='utf-8'))

man = []
for n in range(1, 10):
    f = STICKERS + 'sticker-%02d.webp' % n
    t = STICKERS + 'thumb-%02d.webp' % n
    wi = Image.open(f)
    ti = Image.open(t)
    assert wi.size == (1200, 1600) and ti.size == (300, 400), (n, wi.size, ti.size)
    man.append({'n': n, 'file': 'sticker-%02d.webp' % n, 'thumb': 'thumb-%02d.webp' % n, 'caption': CAP[n],
                'accent': ACC[n][0], 'hex': ACC[n][1], 'w': wi.size[0], 'h': wi.size[1], 'alt': ALT[str(n)]})
json.dump(man, open(OUT + 'manifest.json', 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('manifest.json', len(man), 'items')

# where every sticker sits on the sheet (for hover / click hotspots): backing bbox in sheet px and in percent
cfg = json.load(open(layout_json))
lay = []
for it in cfg['items']:
    sh = Shape(it['n'], cfg['scale'] * it.get('mult', 1.0), it['angle'], cfg['r_back'], cfg['smooth'])
    ox, oy = round(it['c'][0] - sh.w / 2), round(it['c'][1] - sh.h / 2)
    x0, y0, x1, y1 = ox + sh.bbox[0], oy + sh.bbox[1], ox + sh.bbox[2], oy + sh.bbox[3]
    lay.append({'n': it['n'], 'rotate': it['angle'], 'x': round(100 * x0 / 2400, 2), 'y': round(100 * y0 / 3200, 2),
                'w': round(100 * (x1 - x0) / 2400, 2), 'h': round(100 * (y1 - y0) / 3200, 2),
                'px': [int(x0), int(y0), int(x1), int(y1)]})
json.dump({'sheet': 'sheet.webp', 'w': 2400, 'h': 3200,
           'alt': 'A sheet of nine die-cut doodle stickers on cream paper, each on its own white backing with a soft shadow: a skater with a boombox, a reader with a cat on a tower of books, a designer hugging a giant coffee, a gardener carrying a huge monstera, a film director with a megaphone, a detective with a magnifying glass, a rug maker with a tufting gun, an astronaut monkey and a dancer in headphones; one corner is peeling up.',
           'note': 'x/y/w/h are percentages of the sheet; px = [x0, y0, x1, y1] of the white backing sheet; rotate = degrees clockwise',
           'stickers': lay}, open(OUT + 'sheet-layout.json', 'w', encoding='utf-8'), indent=2)
print('sheet-layout.json written')
