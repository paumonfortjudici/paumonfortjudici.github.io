"""layout_run.py layout.json -> relaxes the nine stickers on the 2400 x 3200 sheet (even gutters, margins about twice the gutters),
writes work/<name>.out.json (the positions in "c") and a quick preview PNG next to it.  Needs the sticker PNGs in work/ (render-stickers.mjs)."""
import os, sys, json, time
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shapes import *

cfgp = sys.argv[1]
cfg = json.load(open(cfgp))
t0 = time.time()
items = cfg['items']
shapes = []
for it in items:
    s = cfg['scale'] * it.get('mult', 1.0)
    shapes.append(Shape(it['n'], s, it['angle'], cfg['r_back'], cfg['smooth']))
    print('shape', it['n'], 'ready', round(time.time() - t0, 1), flush=True)
L = Layout(shapes, (cfg['W'], cfg['H']))
nominal = np.array([it['nom'] for it in items], float)
c0 = np.array([it.get('c', it['nom']) for it in items], float)
if cfg.get('relax', True):
    c = relax(L, c0, nominal, iters=cfg.get('iters', 3000), step0=cfg.get('step0', 30), seed=cfg.get('seed', 1),
              tau=cfg.get('tau', 12), margin_t=cfg.get('margin_t', 100), lam=cfg.get('lam', 0.15), wall_w=cfg.get('wall_w', 1.0))
else:
    c = c0
e, g, m = L.energy(c, nominal, cfg.get('tau', 12), cfg.get('margin_t', 100), cfg.get('lam', 0.15), cfg.get('wall_w', 1.0))
np.set_printoptions(linewidth=200, suppress=True)
gg = g.copy(); gg[gg > 999] = np.nan
print('gaps (px) between backings, rows/cols = stickers 1..9')
print(np.round(gg, 0))
print('margins L R T B per sticker'); print(np.round(m, 0))
iu = np.triu_indices(9, 1)
print('min gap', np.nanmin(gg[iu]), ' min margin', m.min())
for it, ci in zip(items, c):
    it['c'] = [round(float(ci[0]), 1), round(float(ci[1]), 1)]
os.makedirs(WORK, exist_ok=True)
base = os.path.join(WORK, os.path.basename(cfgp)[:-5])
out = base + '.out.json'
json.dump(cfg, open(out, 'w'), indent=1)

# quick preview: premultiplied stickers over white backings at 1/3 scale on cream
k = 3
prev = np.ones((cfg['H'] // k, cfg['W'] // k, 3), np.float32) * (np.array([255, 239, 223], np.float32) / 255)
for s, ci in zip(shapes, c):
    ox, oy = int(round(ci[0] - s.w / 2)), int(round(ci[1] - s.h / 2))
    Bd = box_down(s.B[:s.h // k * k, :s.w // k * k], k)
    Sd = box_down(s.S[:s.h // k * k, :s.w // k * k], k)
    x0, y0 = ox // k, oy // k
    hh, ww = Bd.shape
    ys, xs = slice(max(0, y0), min(prev.shape[0], y0 + hh)), slice(max(0, x0), min(prev.shape[1], x0 + ww))
    sy, sx = slice(ys.start - y0, ys.stop - y0), slice(xs.start - x0, xs.stop - x0)
    b = Bd[sy, sx, None]
    prev[ys, xs] = prev[ys, xs] * (1 - b) + b * np.array([1, 1, 1], np.float32)
    a = Sd[sy, sx, 3:4]
    prev[ys, xs] = prev[ys, xs] * (1 - a) + Sd[sy, sx, :3]
Image.fromarray((np.clip(prev, 0, 1) * 255).astype(np.uint8)).save(base + '.prev.png')
print('done', round(time.time() - t0, 1), 's')
