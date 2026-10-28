"""sheetlib - building blocks for the die-cut sticker sheet (numpy + Pillow only).

Pipeline per sticker: premultiplied RGBA -> rotate (at source resolution) -> downscale (LANCZOS) -> die-cut alpha ->
backing sheet mask (disk offset of the die-cut, then rounded like a cutter path) -> shadows -> composite.
Everything that is a blur / dilation uses FFT convolution, so no scipy is needed.
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# rendered sticker PNGs, the shape cache and the previews live here (git-ignored); override with the STICKER_WORK env var
WORK = os.environ.get('STICKER_WORK') or os.path.join(HERE, 'work')

# ---------------------------------------------------------------------------------------------------- convolution helpers
def _fft_conv(a, k):
    """'same' convolution of 2-D float array a with small kernel k (kernel centred)."""
    H, W = a.shape
    kh, kw = k.shape
    sh = (H + kh - 1, W + kw - 1)
    c = np.fft.irfft2(np.fft.rfft2(a, s=sh) * np.fft.rfft2(k, s=sh), s=sh)
    y0, x0 = (kh - 1) // 2, (kw - 1) // 2
    return c[y0:y0 + H, x0:x0 + W]


def gauss_kernel(sigma):
    r = max(1, int(np.ceil(sigma * 3.2)))
    x = np.arange(-r, r + 1, dtype=np.float64)
    g = np.exp(-(x * x) / (2 * sigma * sigma))
    g /= g.sum()
    return g


def gblur(a, sigma):
    """separable gaussian blur through two 1-D FFT convolutions (a: 2-D float32/64)."""
    if sigma <= 0:
        return a
    g = gauss_kernel(sigma)
    out = _fft_conv(a.astype(np.float64), g[None, :])
    out = _fft_conv(out, g[:, None])
    return out.astype(np.float32)


def disk(r):
    r = int(round(r))
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return ((x * x + y * y) <= (r + 0.25) ** 2).astype(np.float64)


def dilate(mask, r):
    """binary dilation by a disk of radius r (mask: float/bool 2-D)"""
    c = _fft_conv(mask.astype(np.float64), disk(r))
    return (c > 0.5).astype(np.float32)


def erode(mask, r):
    return 1.0 - dilate(1.0 - mask, r)


def smooth_edge(m, sigma, slope=10.0):
    """blur + steep threshold: rounds corners like a cutter path, keeps an antialiased edge"""
    b = gblur(m.astype(np.float32), sigma)
    return np.clip((b - 0.5) * slope + 0.5, 0, 1).astype(np.float32)


def box_down(a, f):
    """area-average downsample by integer factor f (2-D or 3-D with channels last)"""
    if f == 1:
        return a
    H, W = a.shape[:2]
    H2, W2 = H // f, W // f
    a = a[:H2 * f, :W2 * f]
    if a.ndim == 2:
        return a.reshape(H2, f, W2, f).mean((1, 3))
    return a.reshape(H2, f, W2, f, a.shape[2]).mean((1, 3))


def up2(a):
    return np.kron(a, np.ones((2, 2), dtype=a.dtype)) if a.ndim == 2 else np.repeat(np.repeat(a, 2, 0), 2, 1)


# ---------------------------------------------------------------------------------------------------- stickers
def load_premult(path):
    """sticker PNG/WebP -> PIL 'RGBa' (premultiplied) image"""
    return Image.open(path).convert('RGBA').convert('RGBa')


def place_sticker(pm, scale, angle_cw, pad=0):
    """rotate (clockwise degrees, like CSS) at source resolution, then downscale; returns float32 premultiplied RGBA array
    (h, w, 4) in 0..1.  An optional transparent pad (px, at the final scale) is added around it."""
    rot = pm.rotate(-angle_cw, resample=Image.BICUBIC, expand=True)
    w, h = rot.size
    sm = rot.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    arr = np.asarray(sm, dtype=np.float32) / 255.0
    if pad:
        arr = np.pad(arr, ((pad, pad), (pad, pad), (0, 0)))
    return arr


def backing_mask(alpha, r_back, smooth_sigma, ss=2):
    """white backing-sheet outline: disk offset of the die-cut by r_back px, rounded by smooth_sigma px.
    Computed at `ss` x supersampling for a clean antialiased edge. alpha: float (h, w) 0..1 (already padded)."""
    m = (alpha > 0.35).astype(np.float32)
    if ss > 1:
        m = up2(m) if ss == 2 else np.kron(m, np.ones((ss, ss), np.float32))
    r = r_back * ss
    d = dilate(m, r + smooth_sigma * ss * 0.55)  # slightly over-dilate: the smoothing retracts convex tips
    d = erode(dilate(d, 6 * ss), 6 * ss)     # closing: a cutter path has no 1-3 px pinholes or hairline slits (big openings stay)
    b = smooth_edge(d, smooth_sigma * ss, 12.0)
    return box_down(b, ss).astype(np.float32)


# ---------------------------------------------------------------------------------------------------- signed distance (for the layout relaxer)
def boundary_points(mask):
    """pixel coordinates (y, x) of the boundary pixels of a boolean mask"""
    m = mask.astype(bool)
    e = m.copy()
    e[1:, :] &= m[:-1, :]
    e[:-1, :] &= m[1:, :]
    e[:, 1:] &= m[:, :-1]
    e[:, :-1] &= m[:, 1:]
    return np.argwhere(m & ~e)


def signed_distance(mask, pad):
    """signed distance (positive outside) from every cell of the padded grid to the shape boundary, brute force.
    mask: bool (h, w). Returns array (h+2pad, w+2pad) in mask-pixel units."""
    h, w = mask.shape
    bp = boundary_points(mask).astype(np.float32) + pad
    H, W = h + 2 * pad, w + 2 * pad
    yy, xx = np.mgrid[0:H, 0:W]
    G = np.stack([yy.ravel(), xx.ravel()], 1).astype(np.float32)
    d = np.empty(len(G), np.float32)
    CH = 4000
    for s in range(0, len(G), CH):
        g = G[s:s + CH]
        dy = g[:, 0:1] - bp[None, :, 0]
        dx = g[:, 1:2] - bp[None, :, 1]
        d[s:s + CH] = np.sqrt((dy * dy + dx * dx).min(1))
    d = d.reshape(H, W)
    inside = np.zeros((H, W), bool)
    inside[pad:pad + h, pad:pad + w] = mask
    d[inside] *= -1
    return d
