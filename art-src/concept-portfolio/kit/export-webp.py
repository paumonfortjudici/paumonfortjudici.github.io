# Export a rendered slide PNG to WebP, picking the HIGHEST quality that fits the size budget (default 260 KB).
#   <scratchpad>/venv/Scripts/python.exe -I -X utf8 kit/export-webp.py in.png out.webp [--max-kb 260] [--qmax 84] [--qmin 60]
# Render the PNG at --scale 1 (1080 x 1920) for the final export. Prints the chosen quality and size; exits 1 if even qmin is too big
# (then thin the texture: fewer halftone patches / gouache holes / smaller vignette, never lower qmin).
import io
import os
import sys
from PIL import Image

args = sys.argv[1:]
if len(args) < 2:
    print(__doc__)
    sys.exit(2)
src, dst = args[0], args[1]
def opt(name, default):
    return type(default)(args[args.index(name) + 1]) if name in args else default
max_kb, qmax, qmin = opt('--max-kb', 260), opt('--qmax', 84), opt('--qmin', 60)

im = Image.open(src).convert('RGB')
if im.size != (1080, 1920):
    print(f'WARNING: image is {im.size}, expected (1080, 1920). Render with --scale 1.')
best = None
for q in range(qmax, qmin - 1, -2):
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=6)
    kb = len(buf.getvalue()) / 1024
    if kb <= max_kb:
        best = (q, kb, buf.getvalue())
        break
if best is None:
    print(f'FAILED: even quality {qmin} is {kb:.0f} KB > {max_kb} KB. Thin the texture.')
    sys.exit(1)
q, kb, data = best
os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
with open(dst, 'wb') as f:
    f.write(data)
print(f'{dst}: quality {q}, {kb:.0f} KB')
