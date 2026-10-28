"""peel.py - lift one corner of a placed sticker.

The corner beyond a straight crease is removed from the sticker (the white backing sheet shows through) and mirrored back over
the sticker as a flap: the white back of the vinyl, darker at the crease where it curls, with a thin paper edge and a soft shadow.
All arrays are window-sized floats (premultiplied RGBA for the sticker)."""
import numpy as np
from sheetlib import gblur


def _bilinear(a, y, x):
    H, W = a.shape
    y = np.clip(y, 0, H - 1.001)
    x = np.clip(x, 0, W - 1.001)
    y0, x0 = y.astype(int), x.astype(int)
    fy, fx = y - y0, x - x0
    return (a[y0, x0] * (1 - fy) * (1 - fx) + a[y0, x0 + 1] * (1 - fy) * fx +
            a[y0 + 1, x0] * fy * (1 - fx) + a[y0 + 1, x0 + 1] * fy * fx)


def peel(S, ang_deg, depth, back=(247, 245, 240), curl_px=18):
    """S: premultiplied RGBA (h, w, 4).  The normal n = (cos a, sin a) points INTO the sticker (a = 45 lifts the top-left corner).
    The lifted corner is the die-cut point with the smallest projection on n; the crease sits `depth` px further along n.
    Returns S_new (corner removed), flap colour (h, w, 3), flap alpha (h, w), flap edge-line alpha (h, w)."""
    h, w = S.shape[:2]
    a = S[..., 3]
    n = np.array([np.cos(np.radians(ang_deg)), np.sin(np.radians(ang_deg))], np.float32)
    ys, xs = np.where(a > 0.5)
    k = xs * n[0] + ys * n[1]
    i = np.argmin(k)
    ex, ey = float(xs[i]), float(ys[i])
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = (xx - ex) * n[0] + (yy - ey) * n[1]
    t = float(depth)
    keep = np.clip((d - t) / 1.2 + 0.5, 0, 1)
    S_new = S * keep[..., None]
    removed = a * (1 - keep)
    dm = d - t                                   # distance from the crease, positive on the sticker side
    mx, my = xx - 2 * dm * n[0], yy - 2 * dm * n[1]
    flapA = (_bilinear(removed, my, mx) * np.clip(dm / 1.2 + 0.5, 0, 1)).astype(np.float32)
    g = np.clip(dm / max(t, 1.0), 0, 1)
    u = np.clip(dm / curl_px, 0, 1)
    shade = 0.965 + 0.035 * g - 0.085 * (1 - u) ** 1.6 + 0.020 * np.exp(-((dm - 0.55 * curl_px) / 4.5) ** 2)
    flap_rgb = (np.array(back, np.float32) / 255.0)[None, None, :] * shade[..., None]
    edge = np.clip(flapA * (1 - gblur(flapA, 1.5)) * 1.8, 0, 1)
    # no edge line along the crease itself (the paper bends there, it does not end)
    edge = edge * np.clip(dm / 6.0, 0, 1)
    return S_new, flap_rgb.astype(np.float32), flapA, edge.astype(np.float32)
