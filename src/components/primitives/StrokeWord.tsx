// <StrokeWord> - giant OUTLINE lettering (Fraunces Black outlines, laid out at runtime from src/lib/lettering), drawn on with a stroke.
// Props: text, size (CSS length = the em; default clamp(4.5rem,13vw,17rem), never wider than its box), as ('h1'..'span'), ghost,
// draw (true | delay ms | false), hoverWave, strokeScale, fill (false | 'tint' | 'solid' | true), shadow (offset riso outline colour),
// tracking (em), stack ('mobile' | true), stackSize, align, label, id. Headings: <h2><span class="pm-sr">TEXT</span><svg aria-hidden></h2>.
// Ink is ~3px at 1440 (1.8px floor, 5.4px cap); reduced / paused motion = fully drawn. Exposes --sw-size --sw-size-stack --d --step
// --draw-dur --ghost-a --sw-shadow. Docs: docs/api/primitives.md

import { createElement, useMemo, useRef, type CSSProperties } from 'react'
import { layoutLetters, UNITS_PER_EM, type Layout } from '../../lib/lettering/layout'
import { useInkWidth, useRevealOnce } from './hooks'
import { cx } from './util'

export interface StrokeWordProps {
  text: string
  size?: number | string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span'
  ghost?: boolean
  draw?: boolean | number
  hoverWave?: boolean
  strokeScale?: number
  fill?: boolean | 'tint' | 'solid'
  /** a second outline offset by 0.02em in this colour: the misregistered riso look (CSS colour or var()) */
  shadow?: string
  tracking?: number
  stack?: boolean | 'mobile'
  stackSize?: number | string
  align?: 'start' | 'center' | 'end'
  label?: string
  id?: string
  className?: string
  style?: CSSProperties
}

const px = (v: number | string): string => (typeof v === 'number' ? `${v}px` : v)
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function Glyphs({ layout, ghost, fill }: { layout: Layout; ghost: boolean; fill: boolean }) {
  return (
    <>
      {layout.glyphs.map((g) => (
        <g key={g.i} transform={`translate(${g.x} ${g.y})`}>
          <g className="pm-sw__gl" style={{ '--i': g.i } as CSSProperties}>
            {ghost && <path className="pm-sw__ghostp" d={g.d} />}
            {fill && !ghost && <path className="pm-sw__fillp" d={g.d} />}
            {!ghost && g.contours.map((d, j) => <path key={j} className="pm-sw__s" d={d} pathLength={1} />)}
          </g>
        </g>
      ))}
    </>
  )
}

export function StrokeWord({
  text,
  size,
  as = 'span',
  ghost = false,
  draw = true,
  hoverWave,
  strokeScale = 1,
  fill = false,
  shadow,
  tracking = 0.03,
  stack = false,
  stackSize,
  align = 'start',
  label,
  id,
  className,
  style,
}: StrokeWordProps) {
  const line = useMemo(() => layoutLetters(text, { tracking, stack: stack === true, align }), [text, tracking, stack, align])
  const stacked = useMemo(() => (stack === 'mobile' ? layoutLetters(text, { tracking, stack: true, align }) : null), [text, tracking, stack, align])

  const rootRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const inkRef = useRef<SVGGElement | null>(null)
  const svg2Ref = useRef<SVGSVGElement | null>(null)
  const ink2Ref = useRef<SVGGElement | null>(null)

  const animated = draw !== false && !ghost
  useRevealOnce(rootRef, { disabled: !animated, threshold: 0.12 })

  // ink weight in viewBox units, from the rendered width: about 3px at a 173px em (12vw at 1440), 1.8px floor, 5.4px cap
  const inkUnits = (layout: Layout) => (renderedW: number) => {
    const emPx = (renderedW * UNITS_PER_EM) / layout.vb.w
    const wantPx = clamp(emPx * 0.0175, 1.8, 5.4) * strokeScale
    // never heavier than 9 units (4.5 % of the em): below ~40px of em an outline word is mostly ink anyway, and a collapsing box must not flood the page
    return Math.min((wantPx * layout.vb.w) / renderedW, 9 * strokeScale)
  }
  useInkWidth(svgRef, inkRef, inkUnits(line), [line, strokeScale])
  useInkWidth(svg2Ref, ink2Ref, stacked ? inkUnits(stacked) : () => 0, [stacked, strokeScale])

  const fillMode = fill === true ? 'tint' : fill || undefined
  const count = line.glyphs.length
  const step = clamp(Math.floor(1100 / Math.max(1, count)), 24, 70)
  const delay = typeof draw === 'number' ? draw : 0
  const rootStyle = {
    '--sw-size': size === undefined ? undefined : px(size),
    '--sw-size-stack': stackSize === undefined ? undefined : px(stackSize),
    '--sw-shadow': shadow,
    '--step': `${step}ms`,
    '--d': `${delay}ms`,
    '--fill-delay': `${delay + (count - 1) * step + 1050}ms`,
    ...style,
  } as CSSProperties

  const heading = as !== 'span' && as !== 'div' && as !== 'p'
  const name = label ?? line.text.replace(/\n/g, ' ')
  const common = {
    id,
    ref: (node: HTMLElement | null) => {
      rootRef.current = node
    },
    className: cx('pm-sw', ghost && 'pm-sw--ghost', className),
    style: rootStyle,
    'data-draw': animated ? '' : undefined,
    'data-wave': (hoverWave ?? (!ghost && as !== 'span')) && !ghost ? '' : undefined,
    'data-fill': fillMode,
    'data-shadow': shadow ? '' : undefined,
    'data-stack': stack === 'mobile' ? 'mobile' : stack === true ? 'always' : undefined,
  }
  const a11y = ghost
    ? { 'aria-hidden': true }
    : heading
      ? {}
      : { role: 'img', 'aria-label': name }

  const makeSvg = (layout: Layout, kind: 'line' | 'stack', refs: { svg: typeof svgRef; ink: typeof inkRef }) => (
    <svg
      ref={refs.svg}
      className={cx('pm-sw__svg', kind === 'stack' ? 'pm-sw__svg--stack' : 'pm-sw__svg--line')}
      viewBox={`${layout.vb.x} ${layout.vb.y} ${layout.vb.w} ${layout.vb.h}`}
      style={{ '--k': layout.vb.w / UNITS_PER_EM } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <g ref={refs.ink} className="pm-sw__ink" fill="none" stroke="currentColor" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
        <Glyphs layout={layout} ghost={ghost} fill={!!fillMode} />
      </g>
    </svg>
  )

  return createElement(
    as,
    { ...common, ...a11y },
    heading && !ghost && <span className="pm-sr">{name}</span>,
    stack === true ? makeSvg(line, 'stack', { svg: svgRef, ink: inkRef }) : makeSvg(line, 'line', { svg: svgRef, ink: inkRef }),
    stacked && makeSvg(stacked, 'stack', { svg: svg2Ref, ink: ink2Ref }),
  )
}
