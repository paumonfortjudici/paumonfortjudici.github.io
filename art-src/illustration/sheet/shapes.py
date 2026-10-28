"""shapes.py - per-sticker sheet assets (placed sticker + backing mask + coarse signed-distance field), cached on disk,
plus the gap / margin evaluation and the position relaxer used to lay the 3 x 3 sheet out with even gutters."""
import os, json
import numpy as np
from sheetlib import *

CACHE = os.path.join(WORK, 'cache') + os.sep
os.makedirs(CACHE, exist_ok=True)
PAD = 110          # transparent padding around each placed sticker (room for the shadows)
Q = 4              # the relaxer works on a 1/Q grid


class Shape:
    def __init__(self, n, scale, angle, r_back, smooth, src=None):
        self.n, self.scale, self.angle = n, scale, angle
        key = f'v6_{n}_{scale:.4f}_{angle:.2f}_{r_back}_{smooth}'
        f = CACHE + key + '.npz'
        src = src or os.path.join(WORK, 'sticker-%02d.png' % n)
        # the source mtime is part of the key so a re-exported sticker invalidates the cache
        mt = int(os.path.getmtime(src))
        if os.path.exists(f):
            z = np.load(f)
            if int(z['mt']) == mt:
                self.S, self.B = z['S'].astype(np.float32), z['B']
                self._finish()
                return
        pm = load_premult(src)
        self.S = place_sticker(pm, scale, angle, pad=PAD)
        self.B = backing_mask(self.S[..., 3], r_back, smooth)
        np.savez_compressed(f, S=self.S.astype(np.float16), B=self.B, mt=mt)
        self._finish()

    def _finish(self):
        self.h, self.w = self.B.shape
        h4, w4 = self.h // Q, self.w // Q
        b4 = box_down(self.B[:h4 * Q, :w4 * Q], Q) > 0.5
        self.bp = boundary_points(b4)
        self.sdf = signed_distance(b4, 40)
        ys, xs = np.where(self.B > 0.5)
        self.bbox = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)   # inside the window, full-res px
        self.shape_wh = (self.bbox[2] - self.bbox[0], self.bbox[3] - self.bbox[1])


def _sample(sdf, v, u):
    """bilinear sample of sdf at float cell coordinates (v rows, u cols), clamped"""
    H, W = sdf.shape
    v = np.clip(v, 0, H - 1.001)
    u = np.clip(u, 0, W - 1.001)
    v0, u0 = v.astype(int), u.astype(int)
    fv, fu = v - v0, u - u0
    return (sdf[v0, u0] * (1 - fv) * (1 - fu) + sdf[v0, u0 + 1] * (1 - fv) * fu +
            sdf[v0 + 1, u0] * fv * (1 - fu) + sdf[v0 + 1, u0 + 1] * fv * fu)


def gap(a, pa, b, pb):
    """smallest distance (px) between backings a and b; windows' top-left corners at pa, pb (sheet px). < 0 = overlap"""
    def one(a, pa, b, pb):
        px = pa[0] + Q * a.bp[:, 1] + Q / 2
        py = pa[1] + Q * a.bp[:, 0] + Q / 2
        u = (px - pb[0]) / Q - 0.5 + 40
        v = (py - pb[1]) / Q - 0.5 + 40
        return _sample(b.sdf, v, u).min() * Q - Q / 2
    return min(one(a, pa, b, pb), one(b, pb, a, pa))


class Layout:
    def __init__(self, shapes, canvas=(2400, 3200)):
        self.sh = shapes
        self.W, self.H = canvas
        self.near = None

    def origin(self, i, c):
        s = self.sh[i]
        return (c[i][0] - s.w / 2.0, c[i][1] - s.h / 2.0)

    def margins(self, c):
        out = []
        for i, s in enumerate(self.sh):
            ox, oy = self.origin(i, c)
            x0, y0, x1, y1 = s.bbox
            out.append((ox + x0, self.W - (ox + x1), oy + y0, self.H - (oy + y1)))
        return np.array(out)

    def gaps(self, c):
        n = len(self.sh)
        g = np.full((n, n), 1e4)
        for i in range(n):
            for j in range(i + 1, n):
                oi, oj = self.origin(i, c), self.origin(j, c)
                # cheap reject: bbox distance
                bi = (oi[0] + self.sh[i].bbox[0], oi[1] + self.sh[i].bbox[1], oi[0] + self.sh[i].bbox[2], oi[1] + self.sh[i].bbox[3])
                bj = (oj[0] + self.sh[j].bbox[0], oj[1] + self.sh[j].bbox[1], oj[0] + self.sh[j].bbox[2], oj[1] + self.sh[j].bbox[3])
                dx = max(bj[0] - bi[2], bi[0] - bj[2], 0)
                dy = max(bj[1] - bi[3], bi[1] - bj[3], 0)
                if max(dx, dy) > 260:
                    continue
                g[i, j] = g[j, i] = gap(self.sh[i], oi, self.sh[j], oj)
        return g

    def energy(self, c, nominal, tau=12.0, margin_t=None, lam=0.15, wall_w=1.0, wall_scale=0.5):
        """pair term exp(-gap/tau) + wall term exp(-(margin - margin_t) * wall_scale / tau): with wall_scale .5 the margins settle
        at about twice the gutters (the usual optical rule for a sheet of objects)"""
        g = self.gaps(c)
        iu = np.triu_indices(len(self.sh), 1)
        e = np.exp(-np.clip(g[iu], -50, 400) / tau).sum()
        m = self.margins(c)
        mt = margin_t if margin_t is not None else 0
        e += wall_w * np.exp(-(np.clip(m, -50, 400) - mt) * wall_scale / tau).sum()
        d = (np.asarray(c) - np.asarray(nominal)) / 100.0
        e += lam * (d * d).sum()
        return e, g, m


def relax(layout, c0, nominal, iters=4000, step0=30.0, seed=1, tau=12.0, margin_t=100, lam=0.15, wall_w=1.0, verbose=True):
    rng = np.random.default_rng(seed)
    c = np.array(c0, float)
    e, g, m = layout.energy(c, nominal, tau, margin_t, lam, wall_w)
    best = (e, c.copy())
    n = len(c)
    for it in range(iters):
        step = step0 * (1 - it / iters) + 2.0
        i = rng.integers(n)
        cand = c.copy()
        cand[i] += rng.normal(0, step, 2)
        ec, gc, mc = layout.energy(cand, nominal, tau, margin_t, lam, wall_w)
        if ec < e:
            c, e, g, m = cand, ec, gc, mc
            if e < best[0]:
                best = (e, c.copy())
        if verbose and it % 500 == 0:
            iu = np.triu_indices(n, 1)
            print(it, round(e, 4), 'min gap', round(g[iu].min(), 1), 'min margin', round(m.min(), 1), flush=True)
    return best[1]
