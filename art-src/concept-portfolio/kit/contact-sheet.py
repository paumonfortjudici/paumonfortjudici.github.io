# Stack the five finished slides into ONE tall contact sheet (like the reference's vertical stack: teal / butter / deep / butter / teal).
#   <scratchpad>/venv/Scripts/python.exe -I -X utf8 kit/contact-sheet.py out.webp slide-1.webp slide-2.webp slide-3.webp slide-4.webp slide-5.webp [--width 720] [--q 80]
# Default: each slide scaled to 720 px wide, no gaps -> 720 x 6400. Run it once all five slide WebPs exist.
import io
import os
import sys
from PIL import Image

args = sys.argv[1:]
def opt(name, default):
    return type(default)(args[args.index(name) + 1]) if name in args else default
width, q = opt('--width', 720), opt('--q', 80)
files = [a for i, a in enumerate(args) if not a.startswith('--') and (i == 0 or not args[i - 1].startswith('--'))]
if len(files) < 3:
    print(__doc__)
    sys.exit(2)
out, srcs = files[0], files[1:]
tiles = []
for s in srcs:
    im = Image.open(s).convert('RGB')
    tiles.append(im.resize((width, round(im.height * width / im.width)), Image.LANCZOS))
sheet = Image.new('RGB', (width, sum(t.height for t in tiles)))
y = 0
for t in tiles:
    sheet.paste(t, (0, y))
    y += t.height
buf = io.BytesIO()
sheet.save(buf, 'WEBP', quality=q, method=6)
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
with open(out, 'wb') as f:
    f.write(buf.getvalue())
print(f'{out}: {sheet.size[0]} x {sheet.size[1]}, {len(buf.getvalue()) / 1024:.0f} KB')
