// <Folder> - a coloured paper folder with a tab (the site's core object) + <TabChip> (the small "02" count chip).
// Props: color / ink (CSS colours; or tone="tomato"|"pine"|...), tab (label node), count (adds a TabChip), tabX 0..1
// (position of the tab along the top edge; <=0 flush left, >=1 flush right), flush ('left'|'right'|true), lift
// (true | 'hover': soft shadow + raise), rim ('auto' | boolean: 2px cream-2 rim for folders that sink into the desk),
// as (element or component: 'div' | 'button' | 'a' | motion.div ...), clip (clip children to the rounded body), dashed (empty outline).
// Exposes: --c --on --on2 --edge --fr --br --th --fpad, classes .pm-folder__tab / .pm-folder__body. Docs: docs/api/primitives.md

import {
  createElement,
  forwardRef,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import './defs'
import { folderPath, folderTopEdge, placeTab } from './folderPath'
import { useIsoLayoutEffect } from './hooks'
import { cx, needsRim, on2Percent, resolveHex, TONE_HEX, TONES, type ToneName } from './util'

export interface FolderOwnProps {
  /** fill: any CSS colour (hex from the registry, or var(--tomato)). Default cream. */
  color?: string
  /** the colour of text that sits on `color`. Default ink. */
  ink?: string
  /** shorthand for a colour + its legible ink (and the right rim): tone="pine" */
  tone?: ToneName
  /** tab label (string or nodes). Omit for a plain rounded panel. */
  tab?: ReactNode
  /** adds a <TabChip> with this count after the label, e.g. count={2} -> "02" */
  count?: number | string
  /** 0..1 position of the tab along the top edge. <= 0 = flush left, >= 1 = flush right. Default 0.12 */
  tabX?: number
  flush?: boolean | 'left' | 'right'
  /** raise the folder: soft shadow, 6px up. 'hover' = only while hovered / focused */
  lift?: boolean | 'hover'
  /** 2px cream-2 rim so dark folders read on the desk. 'auto' (default) measures the colour. */
  rim?: boolean | 'auto'
  bodyClassName?: string
  bodyStyle?: CSSProperties
  /** clip the content to the rounded body (images that must not poke out). Default false. */
  clip?: boolean
  /** an empty, dashed folder outline (the "Next folder: yours?" card): no fill, a dashed line in `ink` */
  dashed?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * Polymorphic: `as` takes an element name or a component and the props of THAT element come along
 * (<Folder as="a" href>, <Folder as="button" onClick>, <Folder as={motion.div} layoutId whileHover>).
 */
export type FolderProps<T extends ElementType = 'div'> = FolderOwnProps & { as?: T } & Omit<ComponentPropsWithoutRef<T>, keyof FolderOwnProps | 'as' | 'color'>

type ImplProps = FolderOwnProps & { as?: ElementType } & Omit<HTMLAttributes<HTMLElement>, keyof FolderOwnProps | 'color'> & { type?: string }

const asSide = (flush: FolderOwnProps['flush'], tabX: number): 'left' | 'right' | undefined => {
  if (flush === true || flush === 'left') return 'left'
  if (flush === 'right') return 'right'
  if (tabX <= 0) return 'left'
  if (tabX >= 1) return 'right'
  return undefined
}

const FolderImpl = forwardRef<HTMLElement, ImplProps>(function Folder(props, ref) {
  const {
    color,
    ink,
    tone,
    tab,
    count,
    tabX = 0.12,
    flush,
    lift,
    rim = 'auto',
    as: Tag = 'div',
    className,
    style,
    bodyClassName,
    bodyStyle,
    clip,
    dashed,
    children,
    ...rest
  } = props

  const palette = tone ? TONES[tone] : undefined
  const fill = color ?? palette?.color ?? 'var(--cream)'
  const text = ink ?? palette?.ink ?? 'var(--ink)'
  const fillHex = (tone ? TONE_HEX[tone] : undefined) ?? resolveHex(fill)
  const withRim = rim === 'auto' ? (fillHex ? needsRim(fillHex) : false) : rim
  const on2 = fillHex && resolveHex(text) ? on2Percent(fillHex, resolveHex(text) as string) : 72
  const side = asSide(flush, tabX)
  const hasTab = tab != null && tab !== false

  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const pid = `pmf-${uid}`
  const cid = `pmc-${uid}`
  const rootRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const baseRef = useRef<SVGPathElement | null>(null)
  const clipRef = useRef<SVGPathElement | null>(null)
  const hlRef = useRef<SVGPathElement | null>(null)
  const tabRef = useRef<HTMLSpanElement | null>(null)
  const bodyRef = useRef<HTMLElement | null>(null)

  // Measure the real boxes and draw the single silhouette path. No React state: attributes are written directly.
  useIsoLayoutEffect(() => {
    const root = rootRef.current
    const svg = svgRef.current
    const base = baseRef.current
    const hl = hlRef.current
    const clipPath = clipRef.current
    const body = bodyRef.current
    if (!root || !svg || !base || !hl || !clipPath || !body) return
    const tabEl = tabRef.current
    const update = () => {
      const w = root.offsetWidth
      const h = root.offsetHeight
      if (!w || !h) return
      const th = tabEl ? body.offsetTop : 0
      const br = parseFloat(getComputedStyle(body).borderBottomLeftRadius) || 18 // (top corners may be squared by `flush`)
      const fr = tabEl ? parseFloat(getComputedStyle(tabEl).borderTopLeftRadius) || 12 : 0
      if (tabEl) {
        // a label wider than the folder is clipped instead of overflowing the silhouette
        tabEl.style.maxWidth = `${Math.max(0, w - br - fr)}px` // room for the far shoulder before the body's corner arc
      }
      const tabW = tabEl ? tabEl.offsetWidth : 0
      const place = tabEl ? placeTab(tabX, w, tabW, fr, br, side) : { x: 0, flush: side }
      if (tabEl) tabEl.style.left = `${place.x}px`
      // the body squares its top corner on the flush side; a tab that had to hug an edge says so on the root
      const effective = place.flush ?? side
      if (effective !== (root.getAttribute('data-flush') ?? undefined)) {
        if (effective) root.setAttribute('data-flush', effective)
        else root.removeAttribute('data-flush')
      }
      const shape = { w, h, th, tabX: place.x, tabW, fr, br, flush: effective }
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      const d = folderPath(shape)
      base.setAttribute('d', d)
      clipPath.setAttribute('d', d) // a plain path here (WebKit is picky about <use> inside <clipPath>)
      hl.setAttribute('d', folderTopEdge(shape))
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(update)
    ro.observe(root)
    if (tabEl) ro.observe(tabEl)
    return () => ro.disconnect()
  }, [tabX, side, hasTab])

  const setRoot = (node: HTMLElement | null) => {
    rootRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const interactive = Tag === 'button' || Tag === 'a'
  const BodyTag = interactive ? 'span' : 'div'
  const vars = { '--c': fill, '--on': text, '--on2-p': `${on2}%` } as CSSProperties

  return createElement(
    Tag,
    {
      ...(Tag === 'button' && rest.type === undefined ? { type: 'button' } : null),
      ...rest,
      ref: setRoot,
      className: cx('pm-folder', className),
      style: { ...vars, ...style },
      'data-flush': side,
      'data-lift': lift === true ? 'true' : lift === 'hover' ? 'hover' : undefined,
      'data-rim': withRim ? 'true' : undefined,
      'data-tab': hasTab ? 'true' : undefined,
      'data-dashed': dashed ? 'true' : undefined,
    },
    <svg ref={svgRef} className="pm-folder__art" aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <defs>
        <path id={pid} ref={baseRef} />
        <clipPath id={cid}>
          <path ref={clipRef} />
        </clipPath>
      </defs>
      <g className="pm-folder__ringset">
        <use href={`#${pid}`} className="pm-folder__ring pm-folder__ring--out" />
        <use href={`#${pid}`} className="pm-folder__ring pm-folder__ring--out pm-folder__ring--edge" />
        <use href={`#${pid}`} className="pm-folder__ring pm-folder__ring--in" />
        <use href={`#${pid}`} className="pm-folder__ring pm-folder__ring--in pm-folder__ring--edge" />
      </g>
      {withRim && <use href={`#${pid}`} className="pm-folder__rim" />}
      {withRim && <use href={`#${pid}`} className="pm-folder__rim pm-folder__rim--edge" />}
      <use href={`#${pid}`} className="pm-folder__edge" />
      <use href={`#${pid}`} className="pm-folder__fill" />
      <use href={`#${pid}`} className="pm-folder__grain" />
      {dashed && <use href={`#${pid}`} className="pm-folder__dash" />}
      <path ref={hlRef} className="pm-folder__hl" clipPath={`url(#${cid})`} />
    </svg>,
    hasTab && (
      <span ref={tabRef} className="pm-folder__tab">
        <span className="pm-folder__tabtext">{tab}</span>
        {count != null && <TabChip>{typeof count === 'number' ? String(count).padStart(2, '0') : count}</TabChip>}
      </span>
    ),
    createElement(BodyTag, { ref: bodyRef, className: cx('pm-folder__body', clip && 'pm-folder__body--clip', bodyClassName), style: bodyStyle }, children),
  )
})

export const Folder = FolderImpl as unknown as <T extends ElementType = 'div'>(props: FolderProps<T> & { ref?: Ref<HTMLElement> }) => ReactElement | null

/** The small count chip that lives in a folder tab: knocked-out numerals, e.g. "02". Takes its colours from the folder. */
export function TabChip({ children, className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx('pm-chip', className)} {...rest}>
      {children}
    </span>
  )
}
