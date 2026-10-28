"""Seamless kraft-paper and cork tiles for the Procreate world (procedural, deterministic, Pillow + numpy only).
They are the two textures the wall is built from: ../kraft.webp (the paper wall) and ../cork.webp (the frame and the ledge).
Run:  python -I -X utf8 make_textures.py <out_dir> [contact_sheet.png]     (out_dir = src/worlds/procreate)
Both are 512 px tiles drawn at 256 css px in procreate.css. Same seed, same pixels: change the numbers, not the seeds, to retune.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1]
CONTACT = sys.argv[2] if len(sys.argv) > 2 else None
N = 512


def fft_noise(shape, sx, sy, seed):
    """tileable noise: white noise filtered by an anisotropic gaussian in the frequency domain (sx, sy = feature size px)"""
    rng = np.random.default_rng(seed)
    h, w = shape
    white = rng.standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    filt = np.exp(-((fx * sx) ** 2 + (fy * sy) ** 2) * 6.0)
    out = np.fft.ifft2(np.fft.fft2(white) * filt).real
    out -= out.mean()
    out /= out.std() + 1e-9
    return out


def to_img(arr):
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')


def wrap_draw(fn):
    for ox in (-N, 0, N):
        for oy in (-N, 0, N):
            fn(ox, oy)


# ---------------------------------------------------------------- kraft
def kraft():
    rng = np.random.default_rng(11)
    base = np.array([201, 167, 120], dtype=np.float64)
    mott = fft_noise((N, N), 46, 46, 1)            # very soft cloudiness
    mid = fft_noise((N, N), 9, 9, 7)               # pulp clumps
    fine = fft_noise((N, N), 2.4, 2.4, 3)          # paper tooth
    mach = fft_noise((N, N), 60, 5, 2)             # faint machine-direction streaks
    grain = rng.standard_normal((N, N))
    lum = 1 + 0.005 * mott + 0.009 * mid + 0.020 * fine + 0.008 * mach + 0.011 * grain
    img = base[None, None, :] * lum[:, :, None]
    drift = fft_noise((N, N), 70, 70, 4)
    img[:, :, 0] *= 1 + 0.005 * drift
    img[:, :, 2] *= 1 - 0.012 * drift
    im = to_img(img).convert('RGBA')

    over = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for _ in range(260):  # dark pulp flecks
        x, y = rng.uniform(0, N, 2)
        r = rng.uniform(0.5, 1.3)
        a = int(rng.uniform(40, 120))
        ang = rng.uniform(0, np.pi)
        dx, dy = np.cos(ang) * r * 1.6, np.sin(ang) * r * 1.6
        col = (98, 68, 36, a)
        wrap_draw(lambda ox, oy: d.line((x + ox - dx, y + oy - dy, x + ox + dx, y + oy + dy), fill=col, width=int(1 + r > 1.1)))
    for _ in range(190):  # light flecks
        x, y = rng.uniform(0, N, 2)
        r = rng.uniform(0.5, 1.2)
        a = int(rng.uniform(50, 130))
        ang = rng.uniform(0, np.pi)
        dx, dy = np.cos(ang) * r * 1.5, np.sin(ang) * r * 1.5
        col = (236, 212, 170, a)
        wrap_draw(lambda ox, oy: d.line((x + ox - dx, y + oy - dy, x + ox + dx, y + oy + dy), fill=col, width=1))
    for _ in range(130):  # hairs, any direction, slightly more horizontal
        x, y = rng.uniform(0, N, 2)
        ln = rng.uniform(7, 26)
        ang = rng.normal(0, 0.9) if rng.random() < 0.5 else rng.uniform(-np.pi, np.pi)
        dx, dy = np.cos(ang) * ln, np.sin(ang) * ln
        dark = rng.random() < 0.55
        col = (112, 80, 46, int(rng.uniform(30, 70))) if dark else (238, 216, 176, int(rng.uniform(40, 90)))
        wrap_draw(lambda ox, oy: d.line((x + ox, y + oy, x + ox + dx, y + oy + dy), fill=col, width=1))
    over = over.filter(ImageFilter.GaussianBlur(0.4))
    im = Image.alpha_composite(im, over).convert('RGB')
    im.save(f'{OUT}/kraft.webp', 'WEBP', quality=76, method=6)
    return im


# ---------------------------------------------------------------- cork
def voronoi_layer(cell, seed, spread, dark_share, light_share):
    rng = np.random.default_rng(seed)
    g = int(N / cell)
    cs = N / g
    gx, gy = np.meshgrid(np.arange(g), np.arange(g))
    px = (gx + rng.uniform(0.0, 1.0, (g, g))) * cs
    py = (gy + rng.uniform(0.0, 1.0, (g, g))) * cs
    r = rng.random((g, g))
    tone = np.where(r < dark_share, rng.uniform(0.62, 0.80, (g, g)),
            np.where(r > 1 - light_share, rng.uniform(1.10, 1.26, (g, g)), rng.uniform(1 - spread, 1 + spread, (g, g))))
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float64)
    ci = (xx / cs).astype(int) % g
    cj = (yy / cs).astype(int) % g
    best = np.full((N, N), 1e9)
    second = np.full((N, N), 1e9)
    bid = np.zeros((N, N), dtype=np.int64)
    for di in (-1, 0, 1):
        for dj in (-1, 0, 1):
            ii = (ci + di) % g
            jj = (cj + dj) % g
            qx = px[jj, ii] + (ci + di - ii) * cs
            qy = py[jj, ii] + (cj + dj - jj) * cs
            dist = np.hypot(xx - qx, yy - qy)
            closer = dist < best
            second = np.where(closer, best, np.minimum(second, dist))
            bid = np.where(closer, jj * g + ii, bid)
            best = np.where(closer, dist, best)
    return tone.reshape(-1)[bid], (second - best), best / cs


def cork():
    rng = np.random.default_rng(23)
    t1, e1, b1 = voronoi_layer(11.0, 31, 0.08, 0.10, 0.07)   # big granules
    t2, e2, b2 = voronoi_layer(5.2, 32, 0.10, 0.14, 0.10)    # small granules
    # blend: small granules sit over the big ones, big ones show through where a noise mask says so
    mask = fft_noise((N, N), 30, 30, 9)
    w = 1 / (1 + np.exp(-mask * 1.6))
    t = t1 * w + t2 * (1 - w)
    edge = np.clip(np.minimum(e1 / 1.9, 1) * w + np.minimum(e2 / 1.4, 1) * (1 - w), 0, 1)
    t = t * (0.80 + 0.20 * edge)
    # granule body shading + per-pixel texture so the cells are not flat vectors
    t = t * (1.0 + 0.07 * np.clip(1 - (b1 * w + b2 * (1 - w)) / 0.8, 0, 1))
    t = t * (1 + 0.022 * fft_noise((N, N), 45, 45, 5))
    t = t * (1 + 0.060 * fft_noise((N, N), 2.0, 2.0, 6))
    t = t * (1 + 0.030 * rng.standard_normal((N, N)))
    base = np.array([184, 144, 92], dtype=np.float64)
    img = base[None, None, :] * t[:, :, None]
    img[:, :, 0] *= 1 + 0.025 * (1 - np.clip(t, 0, 1.3))
    img[:, :, 2] *= 1 - 0.10 * (np.clip(t, 0, 1.3) - 1)
    im = to_img(img).convert('RGBA')
    over = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for _ in range(360):  # pores
        x, y = rng.uniform(0, N, 2)
        rr = rng.uniform(0.5, 1.7)
        a = int(rng.uniform(70, 150))
        wrap_draw(lambda ox, oy: d.ellipse((x + ox - rr, y + oy - rr * 0.8, x + ox + rr, y + oy + rr * 0.8), fill=(74, 48, 22, a)))
    for _ in range(150):  # pale chips
        x, y = rng.uniform(0, N, 2)
        rr = rng.uniform(0.6, 1.5)
        a = int(rng.uniform(60, 130))
        wrap_draw(lambda ox, oy: d.ellipse((x + ox - rr, y + oy - rr, x + ox + rr, y + oy + rr), fill=(232, 196, 138, a)))
    over = over.filter(ImageFilter.GaussianBlur(0.55))
    im = Image.alpha_composite(im, over).convert('RGB')
    im = im.filter(ImageFilter.GaussianBlur(0.55))
    im.save(f'{OUT}/cork.webp', 'WEBP', quality=72, method=6)
    return im


k = kraft()
c = cork()
if CONTACT:
    sheet = Image.new('RGB', (N * 2 * 2 + 20, N * 2), (30, 20, 30))
    for i, im in enumerate((k, c)):
        for ox in range(2):
            for oy in range(2):
                sheet.paste(im, (i * (N * 2 + 20) + ox * N, oy * N))
    sheet.save(CONTACT)
print('done')
