// "Save my laptop": draws the lid and its stickers onto a canvas and hands back a PNG. Nothing leaves the browser: the visitor's
// own click starts it, the file is made from the sticker images already on the page and downloaded through a temporary link.
import type { BoardSnapshot } from './board'
import { CANVAS_H, CANVAS_W, art, stickerInfo } from './data'
import { SHAPES } from './shapes.generated'

const DEG = Math.PI / 180

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${src}`))
    img.src = src
  })
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** the aluminium: a soft anisotropic sheen, brushed streaks, a lit top edge and a shaded bottom edge (same recipe as the CSS lid) */
function paintLid(ctx: CanvasRenderingContext2D, w: number, h: number, px: number): void {
  const r = Math.min(30, w * 0.022) * px
  ctx.save()
  roundedRect(ctx, 0, 0, w, h, r)
  ctx.clip()
  const base = ctx.createLinearGradient(0, 0, w, h)
  base.addColorStop(0, '#efeaf1')
  base.addColorStop(0.5, '#cfc9d4')
  base.addColorStop(1, '#b3acba')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  if ('createConicGradient' in ctx) {
    const c = ctx.createConicGradient(200 * DEG, w * 0.3, h * 0.3)
    const stops: Array<[number, string]> = [
      [0, 'rgba(255,255,255,0.7)'],
      [0.12, 'rgba(255,255,255,0.05)'],
      [0.3, 'rgba(120,108,130,0.28)'],
      [0.5, 'rgba(255,255,255,0.5)'],
      [0.68, 'rgba(110,98,122,0.3)'],
      [0.86, 'rgba(255,255,255,0.4)'],
      [1, 'rgba(255,255,255,0.7)'],
    ]
    for (const [o, col] of stops) c.addColorStop(o, col)
    ctx.fillStyle = c
    ctx.fillRect(0, 0, w, h)
  }
  // brushed streaks: thin horizontal lines in two tones (seeded, so the same laptop always saves the same way)
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let y = 0; y < h; y += 2 * px) {
    const light = rnd() > 0.5
    ctx.fillStyle = light ? `rgba(255,255,255,${0.02 + rnd() * 0.05})` : `rgba(40,28,52,${0.012 + rnd() * 0.03})`
    ctx.fillRect(0, y, w, px)
  }
  ctx.restore()
  // bevel: lit top edge, shaded bottom edge, hairline all round
  ctx.save()
  roundedRect(ctx, px * 0.5, px * 0.5, w - px, h - px, r)
  ctx.lineWidth = px
  ctx.strokeStyle = 'rgba(30,20,40,0.16)'
  ctx.stroke()
  ctx.restore()
  ctx.save()
  roundedRect(ctx, 0, 0, w, h, r)
  ctx.clip()
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillRect(r * 0.6, px, w - r * 1.2, px)
  const shade = ctx.createLinearGradient(0, h - 6 * px, 0, h)
  shade.addColorStop(0, 'rgba(30,20,40,0)')
  shade.addColorStop(1, 'rgba(30,20,40,0.2)')
  ctx.fillStyle = shade
  ctx.fillRect(0, h - 6 * px, w, 6 * px)
  ctx.restore()
}

/** the field the laptop lies on: the folder's lilac with the maker's mat grid (a 24 px grid, a stronger line every 120 px) */
function paintField(ctx: CanvasRenderingContext2D, w: number, h: number, px: number): void {
  ctx.fillStyle = '#B79CFF'
  ctx.fillRect(0, 0, w, h)
  ctx.lineWidth = Math.max(1, px * 0.5)
  for (let x = 0; x <= w; x += 24 * px) {
    ctx.strokeStyle = Math.round(x / (24 * px)) % 5 === 0 ? 'rgba(23,16,27,0.11)' : 'rgba(23,16,27,0.055)'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y <= h; y += 24 * px) {
    ctx.strokeStyle = Math.round(y / (24 * px)) % 5 === 0 ? 'rgba(23,16,27,0.11)' : 'rgba(23,16,27,0.055)'
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
}

export async function renderLaptopPng(snap: BoardSnapshot): Promise<Blob> {
  const px = Math.min(2.5, Math.max(1.5, 1800 / snap.lid.w))
  const W = Math.round(snap.lid.w * px)
  const H = Math.round(snap.lid.h * px)
  const hinge = Math.round(16 * px)
  const pad = Math.round(40 * px)
  const canvas = document.createElement('canvas')
  canvas.width = W + pad * 2
  canvas.height = H + hinge + pad * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')

  const images = await Promise.all(snap.items.map((it) => loadImage(art(stickerInfo(it.n).file))))

  paintField(ctx, canvas.width, canvas.height, px)
  ctx.translate(pad, pad)
  // the hinge peeks out under the lid
  const hx = W * 0.18
  const hw = W * 0.64
  const hg = ctx.createLinearGradient(0, H - 4 * px, 0, H + hinge)
  hg.addColorStop(0, '#4b4451')
  hg.addColorStop(0.55, '#2d2733')
  hg.addColorStop(1, '#17111b')
  ctx.fillStyle = hg
  roundedRect(ctx, hx, H - 6 * px, hw, hinge + 6 * px, 8 * px)
  ctx.fill()
  // the lid's soft shadow on whatever it lies on
  ctx.save()
  ctx.shadowColor = 'rgba(14,9,18,0.45)'
  ctx.shadowBlur = 30 * px
  ctx.shadowOffsetY = 14 * px
  ctx.fillStyle = '#b8b1bf'
  roundedRect(ctx, 0, 0, W, H, Math.min(30, W * 0.022) * px)
  ctx.fill()
  ctx.restore()
  paintLid(ctx, W, H, px)

  // etched line, like a laptop's own
  ctx.save()
  ctx.font = `600 ${Math.max(13, 13 * px * 0.55)}px "Karla Variable", Arial, sans-serif`
  ctx.fillStyle = 'rgba(40,28,52,0.34)'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('Designed in Cardedeu. Stickered in the browser.', 22 * px, H - 20 * px)
  ctx.restore()

  // stickers, back to front
  snap.items.forEach((it, i) => {
    const k = ((snap.unit * it.sc) / CANVAS_W) * px
    const vinyl = new Path2D(SHAPES[it.n].d)
    ctx.save()
    ctx.translate(it.u * W, it.v * H)
    ctx.rotate(it.rot * DEG)
    ctx.scale(k, k)
    ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2)
    // the white vinyl margin with a soft contact shadow
    ctx.shadowColor = 'rgba(23,16,27,0.34)'
    ctx.shadowBlur = 5 * px
    ctx.shadowOffsetY = 2.2 * px
    ctx.fillStyle = '#fffefa'
    ctx.fill(vinyl)
    ctx.shadowColor = 'transparent'
    ctx.lineWidth = 1.2 / k
    ctx.strokeStyle = 'rgba(40,28,52,0.22)'
    ctx.stroke(vinyl)
    ctx.drawImage(images[i], 0, 0, CANVAS_W, CANVAS_H)
    ctx.restore()
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not make the picture'))), 'image/png')
  })
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}
