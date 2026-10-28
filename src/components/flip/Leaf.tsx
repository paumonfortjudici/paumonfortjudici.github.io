import { useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react'
import { makeBuf, smoothstep, solveCurl, type CurlBuf } from './curl'
import type { FlipEngine } from './engine'
import type { Face } from './model'
import { reportFlight } from './quality'

/** Live measurements and options shared by every leaf (mutated in place, never re-rendered). */
export interface FlipCfg {
  /** Page size in px. */
  pw: number
  ph: number
  single: boolean
  strips: number
  gloss: number
  /** Bend at the free edge, degrees. */
  bend: number
  /** Rigid rotateY leaf instead of the bend (variant b). */
  flat: boolean
  /** Hard-cover overhang as a fraction of the page size. */
  board: number
}

const EPS = 0.0007
/** Strips overlap by this many px so no seam shows between them. */
const OVERLAP = 0.9
/** The bend grows towards the free edge: 1 = linear, 2 = mostly at the edge. */
const SHAPE = 1.5
const D2R = Math.PI / 180

const isMoving = (t: number): boolean => t > EPS && t < 1 - EPS

interface FaceElProps {
  page: Face
  side: 'r' | 'l'
  load: boolean
  exposed: boolean
  z: number
  board: boolean
  /** The URL the browser actually picked from srcset for this src. */
  onUrl: (src: string, current: string) => void
}

/** One face of a leaf lying flat on its stack: a real <img>, the page overlay and the paper finish. */
export function FaceEl({ page, side, load, exposed, z, board, onUrl }: FaceElProps) {
  // 0 = loading, 1 = arrived over the network (fades in), 2 = was already cached (no fade)
  const [loaded, setLoaded] = useState<0 | 1 | 2>(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const src = page?.src
  useLayoutEffect(() => {
    setLoaded(0)
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(2)
      onUrl(page!.src, img.currentSrc || img.src)
    }
  }, [src, load])
  return (
    <div
      className={`pm-flip__face pm-flip__face--${side}`}
      data-board={board ? '1' : undefined}
      style={{ zIndex: z }}
      aria-hidden={exposed ? undefined : true}
      {...(exposed ? {} : ({ inert: '' } as object))}
    >
      {page && load ? (
        <img
          key={page.src}
          ref={imgRef}
          className={`pm-flip__img${loaded ? ' is-loaded' : ''}${loaded === 2 ? ' is-instant' : ''}`}
          src={page.src}
          srcSet={page.srcSet}
          sizes={page.sizes}
          width={page.width}
          height={page.height}
          alt={page.alt}
          decoding="async"
          draggable={false}
          onLoad={(e) => {
            setLoaded((v) => v || 1)
            onUrl(page!.src, e.currentTarget.currentSrc || e.currentTarget.src)
          }}
        />
      ) : page ? (
        <span className="pm-flip__ph" role="img" aria-label={page.alt} />
      ) : null}
      <div className="pm-flip__finish" aria-hidden="true" />
      {page?.overlay ? <div className="pm-flip__overlay">{page.overlay}</div> : null}
    </div>
  )
}

export interface LeafProps {
  k: number
  engine: FlipEngine
  cfg: MutableRefObject<FlipCfg>
  front: Face
  back: Face
  loadFront: boolean
  loadBack: boolean
  /** Part of the current spread (exposed to assistive tech). */
  showFront: boolean
  showBack: boolean
  armed: boolean
  /** Number of strips of the sheet (1 = rigid leaf). */
  n: number
  /** Which neighbour page is missing: shadows are clipped to the pages that exist. */
  edge: 'first' | 'last' | 'both' | null
  board: boolean
  zr: number
  zl: number
}

const toUrl = (u: string | undefined): string => (u ? `url("${u.replace(/["\\\n]/g, (c) => encodeURIComponent(c))}")` : 'none')

/**
 * One leaf of the book. At rest it is just its visible face lying flat (a plain <img>, crisp). While it
 * moves, a "sheet" of vertical strips takes over: each strip shows its slice of the page, is rotated a
 * little more than the one before it and is shaded by the light, so the paper bends. The strips are only
 * mounted while the leaf is turning (or armed: hovered / focused, so the first frame is warm).
 */
export function Leaf(props: LeafProps) {
  const { k, engine, cfg, n, armed } = props
  const mv = engine.t(k)
  const rootRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const castRef = useRef<HTMLDivElement>(null)
  const [moving, setMoving] = useState(() => isMoving(mv.get()))
  const [urls, setUrls] = useState<Record<string, string>>({})
  const onUrl = (src: string, current: string) => setUrls((m) => (m[src] === current ? m : { ...m, [src]: current }))

  const live = useRef({
    moving: isMoving(mv.get()),
    ready: false,
    t: mv.get(),
    kappa: mv.get() < 0.5 ? 1 : -1,
    dir: (mv.get() < 0.5 ? 1 : -1) as 1 | -1,
    last: 0,
    buf: makeBuf(Math.max(1, n)) as CurlBuf,
    segs: [] as HTMLElement[],
    side: new Uint8Array(0),
    dts: [] as number[],
  })
  const latest = useRef(props)
  latest.current = props

  const paint = (t: number): void => {
    const S = live.current
    const sheet = sheetRef.current
    if (!sheet || S.segs.length === 0) return
    const p = latest.current
    const c = cfg.current
    const count = S.segs.length
    if (S.buf.n !== count) S.buf = makeBuf(count)
    const buf = S.buf
    const lw = c.pw * (p.board ? 1 + c.board : 1)
    const sw = lw / count
    const ov = count > 1 ? OVERLAP : 0

    // direction of travel decides which way the free edge leads; speed decides how much
    const now = performance.now()
    const raw = now - S.last
    if (raw < 250 && !engine.isHeld(k)) S.dts.push(raw)
    const dt = Math.min(0.05, Math.max(0.001, raw / 1000))
    S.last = now
    const v = mv.getVelocity()
    if (v > 0.06) S.dir = 1
    else if (v < -0.06) S.dir = -1
    S.kappa += (S.dir - S.kappa) * (1 - Math.exp(-dt / 0.085))
    const speed = Math.min(1, Math.abs(v) / 2.4)
    const amp = c.flat ? 0 : c.bend * S.kappa * (0.6 + 0.4 * speed)
    solveCurl(buf, t, sw, amp, SHAPE, c.gloss, c.flat ? 9 : 0)

    for (let j = 0; j < count; j++) {
      const el = S.segs[j]!
      const ang = buf.ang[j]!
      const back = buf.back[j]!
      const w = j === count - 1 ? sw : sw + ov
      const hw = w * 0.5
      const rad = ang * D2R
      const cx = buf.x[j]! + hw * Math.cos(rad)
      const cz = buf.z[j]! + hw * Math.sin(rad)
      const rot = back ? 180 - ang : -ang
      el.style.transform = `translate3d(${(cx - hw).toFixed(2)}px,0,${cz.toFixed(2)}px) rotateY(${rot.toFixed(2)}deg)`
      if (S.side[j] !== back) {
        S.side[j] = back
        el.dataset.side = back ? 'b' : 'f'
      }
      // a strip that shows its back is mirrored in its own box: its left end is the outer end
      const d0 = back ? buf.d1[j]! : buf.d0[j]!
      const d1 = back ? buf.d0[j]! : buf.d1[j]!
      const h0 = back ? buf.h1[j]! : buf.h0[j]!
      const h1 = back ? buf.h0[j]! : buf.h1[j]!
      el.style.setProperty('--d0', d0.toFixed(3))
      el.style.setProperty('--d1', d1.toFixed(3))
      el.style.setProperty('--h0', h0.toFixed(3))
      el.style.setProperty('--h1', h1.toFixed(3))
    }
    // the sheet floats a hair above the pages under it; neighbours in the air stack in order
    const d = Math.max(-4, Math.min(4, k - engine.pos))
    sheet.style.transform = `translateZ(${(1.2 + 0.05 * (t < 0.5 ? -d : d)).toFixed(3)}px)`

    // the shadow the sheet casts on the pages under it: beyond both ends of its footprint, plus the
    // hinge going dark while the sheet stands over it
    const cast = castRef.current
    if (cast && cast.children.length === 4) {
      const pw = c.pw
      const h = buf.maxZ
      const base = p.edge === 'first' || p.edge === 'both' ? 0 : pw
      const grow = smoothstep(0, pw * 0.16, h)
      const lenA = Math.min(pw * 0.95, pw * 0.07 + h * 1.15)
      const lenB = Math.min(pw * 0.7, pw * 0.04 + h * 0.75)
      const a = cast.children[0] as HTMLElement
      const b = cast.children[1] as HTMLElement
      a.style.transform = `translate3d(${(base + buf.maxX).toFixed(1)}px,0,0) scaleX(${(lenA / 96).toFixed(3)})`
      a.style.opacity = (0.62 * grow).toFixed(3)
      b.style.transform = `translate3d(${(base + buf.minX - 96).toFixed(1)}px,0,0) scaleX(${(lenB / 96).toFixed(3)})`
      b.style.opacity = (0.5 * grow).toFixed(3)
      const lift = Math.pow(Math.sin(Math.min(1, Math.max(0, t)) * Math.PI), 1.2)
      const g1 = cast.children[2] as HTMLElement
      const g2 = cast.children[3] as HTMLElement
      const gl = pw * 0.24
      g1.style.transform = `translate3d(${base.toFixed(1)}px,0,0) scaleX(${(gl / 96).toFixed(3)})`
      g1.style.opacity = (0.42 * lift).toFixed(3)
      g2.style.transform = `translate3d(${(base - 96).toFixed(1)}px,0,0) scaleX(${(gl / 96).toFixed(3)})`
      g2.style.opacity = (0.42 * lift).toFixed(3)
    }
  }

  const update = (t: number): void => {
    const S = live.current
    const m = isMoving(t)
    if (m !== S.moving) {
      S.moving = m
      setMoving(m)
      if (m) {
        S.dir = t < 0.5 ? 1 : -1
        S.kappa = S.dir
      } else {
        reportFlight(S.dts)
        S.dts.length = 0
      }
    }
    S.t = t
    const isLive = m && S.ready && !!sheetRef.current
    const state = isLive ? 'm' : t < 0.5 ? 'r' : 'l'
    const root = rootRef.current
    if (root) {
      if (root.dataset.state !== state) root.dataset.state = state
    }
    const sheet = sheetRef.current
    if (sheet) {
      const want = isLive ? '1' : '0'
      if (sheet.dataset.live !== want) sheet.dataset.live = want
    }
    if (isLive) paint(t)
  }
  const updateRef = useRef(update)
  updateRef.current = update

  useLayoutEffect(() => {
    updateRef.current(mv.get())
    return mv.on('change', (t) => updateRef.current(t))
  }, [mv])

  const mounted = moving || armed
  useLayoutEffect(() => {
    const S = live.current
    const sheet = sheetRef.current
    if (!sheet) return
    S.segs = Array.from(sheet.children).filter((el) => (el as HTMLElement).classList.contains('pm-flip__seg')) as HTMLElement[]
    S.side = new Uint8Array(S.segs.length)
    S.ready = false
    S.last = performance.now()
    // pose at the current value, once, so the strips are painted before they are needed
    paint(mv.get())
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        S.ready = true
        updateRef.current(mv.get())
      })
    })
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      S.ready = false
      S.segs = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, n])

  const count = Math.max(1, n)
  const sheetStyle = {
    '--n': count,
    '--ovl': count > 1 ? `${OVERLAP}px` : '0px',
    '--img-f': toUrl(props.front ? urls[props.front.src] ?? props.front.src : undefined),
    '--img-b': toUrl(props.back ? urls[props.back.src] ?? props.back.src : undefined),
  } as CSSProperties

  return (
    <div className="pm-flip__leaf" ref={rootRef} data-k={k}>
      <FaceEl
        page={props.front}
        side="r"
        load={props.loadFront}
        exposed={props.showFront}
        z={props.zr}
        board={props.board}
        onUrl={onUrl}
      />
      <FaceEl
        page={props.back}
        side="l"
        load={props.loadBack}
        exposed={props.showBack}
        z={props.zl}
        board={props.board}
        onUrl={onUrl}
      />
      {mounted ? (
        <>
          <div className="pm-flip__cast" ref={castRef} data-edge={props.edge ?? undefined} aria-hidden="true">
            <i className="pm-flip__cast-a" />
            <i className="pm-flip__cast-b" />
            <i className="pm-flip__cast-a" />
            <i className="pm-flip__cast-b" />
          </div>
          <div
            className={`pm-flip__sheet${props.board ? ' pm-flip__sheet--board' : ''}`}
            ref={sheetRef}
            data-live="0"
            style={sheetStyle}
            aria-hidden="true"
          >
            {Array.from({ length: count }, (_, j) => (
              <i key={j} className="pm-flip__seg" style={{ '--j': j } as CSSProperties} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
