// The Space Monkey sky: three parallax star layers on one 2D canvas, and a static Earth limb (atmosphere, a sunrise just behind
// the horizon, a few clouds and night-side city lights) on a second canvas that sits in front of the stars.
//
// Rules this file keeps (docs/ART_DIRECTION.md 12.2, creative-playbook M11):
//   - plain canvas, no React state in the loop: positions live in typed arrays, the loop only touches the canvas
//   - DPR capped at 2 and by a pixel budget, so a 4K screen does not repaint 8 million pixels per frame
//   - the loop runs only while the sky is on screen, the tab is visible and motion is allowed (reduced motion, "Pause motion");
//     in every other state ONE static frame is drawn and nothing is scheduled
//   - ~30 fps is plenty for a drift of a few pixels per second; the Earth is drawn once per resize

interface Layer {
  /** stars per CSS pixel of window area */
  density: number
  max: number
  radius: [number, number]
  alpha: [number, number]
  /** horizontal drift, CSS px per second (leftwards) */
  drift: number
  /** pointer parallax in CSS px */
  parallax: number
  /** how far the layer slides when the world scrolls, as a fraction of the scroll distance */
  scroll: number
  twinkle: number
}

const LAYERS: readonly Layer[] = [
  { density: 1 / 4200, max: 900, radius: [0.45, 0.95], alpha: [0.22, 0.6], drift: 1.6, parallax: 5, scroll: 0.03, twinkle: 0.25 },
  { density: 1 / 10500, max: 420, radius: [0.8, 1.45], alpha: [0.4, 0.85], drift: 4.2, parallax: 11, scroll: 0.07, twinkle: 0.45 },
  { density: 1 / 36000, max: 130, radius: [1.4, 2.4], alpha: [0.7, 1], drift: 9, parallax: 22, scroll: 0.14, twinkle: 0.35 },
]

const TINTS = ['255,255,255', '255,255,255', '255,255,255', '255,255,255', '206,226,255', '206,226,255', '255,232,190']

const MAX_DPR = 2
const MAX_PIXELS = 4_600_000
const FRAME_MS = 32

interface Star {
  x: number
  y: number
  r: number
  a: number
  phase: number
  speed: number
  tint: number
  flare: boolean
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (a === b ? 0 : (b - a) * t)

/** the faint Milky Way: a share of the far stars is gathered along a tilted band */
function bandPoint(rng: () => number): [number, number] | null {
  const along = (rng() - 0.5) * 1.6
  const across = (rng() + rng() + rng() - 1.5) * 0.15
  const angle = -0.5
  const x = 0.6 + Math.cos(angle) * along - Math.sin(angle) * across
  const y = 0.4 + Math.sin(angle) * along + Math.cos(angle) * across
  return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? [x, y] : null
}

function makeStars(): Star[][] {
  const rng = mulberry32(0x5ace2018)
  return LAYERS.map((layer, li) => {
    const list: Star[] = []
    for (let i = 0; i < layer.max; i++) {
      let x = rng()
      let y = rng()
      if (li === 0 && rng() < 0.45) {
        const p = bandPoint(rng)
        if (p) [x, y] = p
      }
      const size = rng()
      list.push({
        x,
        y,
        r: lerp(layer.radius[0], layer.radius[1], size * size),
        a: lerp(layer.alpha[0], layer.alpha[1], rng()),
        phase: rng() * Math.PI * 2,
        speed: 0.6 + rng() * 1.8,
        tint: Math.floor(rng() * TINTS.length),
        flare: li === 2 && size > 0.55,
      })
    }
    return list
  })
}

export interface SkyOptions {
  /** the sticky window: its size is the sky's size */
  host: HTMLElement
  stars: HTMLCanvasElement
  earth: HTMLCanvasElement
  /** the world's scroller (scroll + pointer parallax); optional */
  scroller: HTMLElement | null
  still: boolean
}

export interface Sky {
  setStill(still: boolean): void
  destroy(): void
}

export function createSky(options: SkyOptions): Sky {
  const { host, stars: starCanvas, earth: earthCanvas, scroller } = options
  const ctx = starCanvas.getContext('2d')
  const stars = makeStars()
  const fine = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches

  let still = options.still
  let visible = true
  let destroyed = false
  let width = 0
  let height = 0
  let dpr = 1
  let raf = 0
  let last = 0
  let clock = 0
  let pointerX = 0
  let pointerY = 0
  let easedX = 0
  let easedY = 0
  let scrollTop = 0
  let easedScroll = 0

  // ---- sizing ---------------------------------------------------------------------------------------------------------
  function resize(): void {
    const rect = host.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    let ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    if (w * h * ratio * ratio > MAX_PIXELS) ratio = Math.max(1, Math.sqrt(MAX_PIXELS / (w * h)))
    if (w === width && h === height && ratio === dpr) return
    width = w
    height = h
    dpr = ratio
    starCanvas.width = Math.round(w * dpr)
    starCanvas.height = Math.round(h * dpr)
    drawEarth()
    render()
  }

  // ---- the stars ------------------------------------------------------------------------------------------------------
  function render(): void {
    if (!ctx || width === 0) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    const area = width * height
    const margin = 6
    const spanX = width + margin * 2
    const spanY = height + margin * 2
    for (let li = 0; li < LAYERS.length; li++) {
      const layer = LAYERS[li]
      const count = Math.min(layer.max, Math.round(area * layer.density))
      const list = stars[li]
      const offX = -clock * layer.drift - easedX * layer.parallax
      const offY = -easedY * layer.parallax - easedScroll * layer.scroll
      for (let i = 0; i < count; i++) {
        const s = list[i]
        let x = (s.x * width + offX) % spanX
        if (x < 0) x += spanX
        let y = (s.y * height + offY) % spanY
        if (y < 0) y += spanY
        x -= margin
        y -= margin
        const wave = still ? 0 : 0.5 + 0.5 * Math.sin(clock * s.speed + s.phase)
        const alpha = s.a * (1 - layer.twinkle * wave)
        const tint = TINTS[s.tint]
        ctx.fillStyle = `rgba(${tint},${alpha.toFixed(3)})`
        if (s.r < 1.05) {
          const side = Math.max(0.8, s.r * 1.6)
          ctx.fillRect(x, y, side, side)
        } else {
          ctx.beginPath()
          ctx.arc(x, y, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
        if (s.flare) {
          // a four-point glint on the brightest, nearest stars
          ctx.fillStyle = `rgba(${tint},${(alpha * 0.32).toFixed(3)})`
          const len = s.r * 5.5
          ctx.fillRect(x - len, y - 0.45, len * 2, 0.9)
          ctx.fillRect(x - 0.45, y - len, 0.9, len * 2)
        }
      }
    }
  }

  // ---- the Earth limb (static) ----------------------------------------------------------------------------------------
  function drawEarth(): void {
    const e = earthCanvas.getContext('2d')
    if (!e) return
    const w = width
    const limb = clamp(height * 0.105, 64, 116)
    const band = Math.round(limb + 210)
    earthCanvas.width = Math.round(w * dpr)
    earthCanvas.height = Math.round(band * dpr)
    earthCanvas.style.height = `${band}px`
    e.setTransform(dpr, 0, 0, dpr, 0, 0)
    e.clearRect(0, 0, w, band)

    const R = Math.max(w * 2.7, 1600)
    const cx = w * 0.34
    const cy = band - limb + R
    const rimY = (x: number) => cy - Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)))
    const sunX = w * 0.8
    const sunY = rimY(sunX) + 4

    // 1. the atmosphere, outside the disc
    const halo = e.createRadialGradient(cx, cy, R - 4, cx, cy, R + 190)
    halo.addColorStop(0, 'rgba(170,222,255,0.9)')
    halo.addColorStop(0.035, 'rgba(96,181,255,0.62)')
    halo.addColorStop(0.12, 'rgba(34,122,226,0.3)')
    halo.addColorStop(0.4, 'rgba(25,97,208,0.1)')
    halo.addColorStop(1, 'rgba(25,97,208,0)')
    e.fillStyle = halo
    e.fillRect(0, 0, w, band)

    // 2. the disc: bright at the rim, ocean blue, then night
    e.save()
    e.beginPath()
    e.arc(cx, cy, R, 0, Math.PI * 2)
    e.clip()
    const body = e.createRadialGradient(cx, cy, R, cx, cy, R - 320)
    body.addColorStop(0, '#d9f1ff')
    body.addColorStop(0.012, '#8fd0ff')
    body.addColorStop(0.05, '#2488d8')
    body.addColorStop(0.16, '#065d8c')
    body.addColorStop(0.42, '#06253f')
    body.addColorStop(1, '#030a16')
    e.fillStyle = body
    e.fillRect(0, 0, w, band)

    // 3. cloud bands that follow the curve, thickest near the sun
    const rng = mulberry32(0xe4a7)
    e.lineCap = 'round'
    for (let i = 0; i < 46; i++) {
      const x = rng() * w
      const depth = 5 + rng() * 74
      const rad = R - depth
      const mid = Math.atan2(rimY(x) - cy, x - cx)
      const span = (14 + rng() * 120) / rad
      const near = 1 - Math.min(1, Math.abs(x - sunX) / (w * 0.8))
      e.strokeStyle = `rgba(214,238,255,${(0.03 + rng() * 0.09 + near * 0.05).toFixed(3)})`
      e.lineWidth = 1 + rng() * 3.4
      e.beginPath()
      e.arc(cx, cy, rad, mid - span / 2, mid + span / 2)
      e.stroke()
    }

    // 4. city lights on the night side (left of the sunrise), clustered
    e.globalCompositeOperation = 'lighter'
    for (let c = 0; c < 15; c++) {
      const ccx = rng() * w * 0.74
      const depth = 14 + rng() * 72
      const spread = 8 + rng() * 26
      const n = 5 + Math.floor(rng() * 11)
      for (let i = 0; i < n; i++) {
        const px = ccx + (rng() - 0.5) * spread * 2.4
        const py = rimY(px) + depth + (rng() - 0.5) * spread
        e.fillStyle = `rgba(255,${176 + Math.floor(rng() * 50)},${84 + Math.floor(rng() * 40)},${(0.35 + rng() * 0.45).toFixed(2)})`
        const size = 0.7 + rng() * 1.1
        e.fillRect(px, py, size, size)
      }
    }
    e.restore()

    // 5. a thin bright rim, hottest next to the sun
    e.save()
    e.globalCompositeOperation = 'lighter'
    const rim = e.createLinearGradient(0, 0, w, 0)
    rim.addColorStop(0, 'rgba(120,190,255,0.28)')
    rim.addColorStop(Math.max(0.05, sunX / w - 0.32), 'rgba(150,210,255,0.55)')
    rim.addColorStop(sunX / w, 'rgba(255,250,236,1)')
    rim.addColorStop(Math.min(1, sunX / w + 0.2), 'rgba(170,215,255,0.5)')
    rim.addColorStop(1, 'rgba(120,190,255,0.3)')
    e.strokeStyle = rim
    e.lineWidth = 2.4
    e.beginPath()
    e.arc(cx, cy, R - 1.2, 0, Math.PI * 2)
    e.stroke()
    e.restore()

    // 6. the sun just behind the horizon: a gold bloom and a long anamorphic streak (a lens, not a theme park)
    e.save()
    e.globalCompositeOperation = 'lighter'
    // The bloom is an ellipse, wide like a real sunrise glow, and its height is capped so that it has faded to nothing before it
    // reaches the top of this canvas: a round bloom 380 px tall (at 1920 px wide) was cut by the canvas edge and showed a hard
    // step across the sky.
    const bloomR = w * 0.2
    const bloomRy = Math.min(bloomR * 0.62, Math.max(24, sunY - 6))
    e.translate(sunX, sunY)
    e.scale(1, bloomRy / bloomR)
    const bloom = e.createRadialGradient(0, 0, 0, 0, 0, bloomR)
    bloom.addColorStop(0, 'rgba(255,252,240,0.95)')
    bloom.addColorStop(0.07, 'rgba(255,224,150,0.78)')
    bloom.addColorStop(0.28, 'rgba(200,146,49,0.34)')
    bloom.addColorStop(1, 'rgba(200,146,49,0)')
    e.fillStyle = bloom
    e.fillRect(-bloomR, -bloomR, bloomR * 2, bloomR * 2)
    e.setTransform(dpr, 0, 0, dpr, 0, 0)
    for (const [half, tall, alpha, color] of [
      [w * 0.46, 2.2, 0.6, '170,218,255'],
      [w * 0.62, 12, 0.14, '120,180,255'],
    ] as const) {
      const streak = e.createLinearGradient(sunX - half, 0, sunX + half, 0)
      streak.addColorStop(0, `rgba(${color},0)`)
      streak.addColorStop(0.5, `rgba(${color},${alpha})`)
      streak.addColorStop(1, `rgba(${color},0)`)
      e.fillStyle = streak
      e.fillRect(sunX - half, sunY - tall / 2 - 1, half * 2, tall)
    }
    e.restore()
  }

  // ---- loop -----------------------------------------------------------------------------------------------------------
  // ~30 fps: after each frame a timer waits, then ONE requestAnimationFrame draws the next. (No empty callbacks on every vsync.)
  let timer = 0

  function shouldRun(): boolean {
    return !destroyed && !still && visible && !document.hidden && width > 0
  }

  function stopLoop(): void {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    if (timer) window.clearTimeout(timer)
    timer = 0
  }

  function schedule(): void {
    if (raf || timer) return
    timer = window.setTimeout(() => {
      timer = 0
      if (shouldRun()) raf = requestAnimationFrame(frame)
    }, FRAME_MS - 6)
  }

  function frame(now: number): void {
    raf = 0
    if (!shouldRun()) return
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000))
    last = now
    clock += dt
    const ease = 1 - Math.exp(-dt * 3.2)
    easedX += (pointerX - easedX) * ease
    easedY += (pointerY - easedY) * ease
    easedScroll += (scrollTop - easedScroll) * (1 - Math.exp(-dt * 6))
    render()
    schedule()
  }

  function sync(): void {
    if (shouldRun()) {
      if (!raf && !timer) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    } else {
      stopLoop()
    }
  }

  // ---- inputs ---------------------------------------------------------------------------------------------------------
  const onPointer = (event: PointerEvent): void => {
    if (still || event.pointerType !== 'mouse') return
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2
  }
  const onScroll = (): void => {
    scrollTop = scroller ? scroller.scrollTop : 0
  }
  const onVisibility = (): void => sync()

  const observer = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1]?.isIntersecting ?? true
    sync()
  })
  observer.observe(host)
  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(host)
  document.addEventListener('visibilitychange', onVisibility)
  if (fine) window.addEventListener('pointermove', onPointer, { passive: true })
  scroller?.addEventListener('scroll', onScroll, { passive: true })

  resize()
  sync()

  return {
    setStill(next: boolean): void {
      if (next === still) return
      still = next
      if (still) {
        // one calm frame: no parallax, no twinkle
        pointerX = pointerY = easedX = easedY = 0
        easedScroll = scrollTop = 0
        clock = 0
        render()
      }
      sync()
    },
    destroy(): void {
      destroyed = true
      stopLoop()
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
      scroller?.removeEventListener('scroll', onScroll)
    },
  }
}
