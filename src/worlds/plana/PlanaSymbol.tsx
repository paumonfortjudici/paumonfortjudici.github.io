// The Plana Digital symbol as inline, animatable SVG: a browser window with a sun rising over a green field, three title-bar dots
// (the three days) and a cursor. Rebuilt from public/works/plana/logo/plana-digital-symbol-animatable(-reversed).svg: same geometry,
// same ids (pd-sun, pd-horizon-field, pd-horizon-stripe, pd-dot-1..3, pd-frame, pd-bar, pd-cursor ...) when `ids` is set, but every
// fill lives in plana.css (palette variables), so there is no raw colour here.
//
//   sun      how far the sun sits below the horizon, in symbol units: 0 = fully risen, 27 = hidden (the manual's days are 16.7 / 7.6 / 0)
//   dots     how many title-bar dots are lit (1 to 3); each dot is an "off" circle with a lit circle that fades and scales in
//   pressed  the cursor presses down (a click)
//   reversed the sticker version with a paper edge, for dark grounds
import { useId, type CSSProperties } from 'react'
import { cx } from '../../components/primitives'

export interface PlanaSymbolProps {
  sun?: number
  dots?: 0 | 1 | 2 | 3
  pressed?: boolean
  reversed?: boolean
  /** accessible name; when `decorative` is set the svg is hidden from assistive tech */
  label?: string
  decorative?: boolean
  /** keep the documented ids (use on one instance per page only) */
  ids?: boolean
  className?: string
}

const CURSOR_VOLUME =
  'M98 70L98 109L107.75 100L114.5 115L122 112L115.25 97.75L128 97.75ZM106 79L106 118L115.75 109L122.5 124L130 121L123.25 106.75L136 106.75ZM98 70L98 109L106 118L106 79ZM98 109L107.75 100L115.75 109L106 118ZM107.75 100L114.5 115L122.5 124L115.75 109ZM114.5 115L122 112L130 121L122.5 124ZM122 112L115.25 97.75L123.25 106.75L130 121ZM115.25 97.75L128 97.75L136 106.75L123.25 106.75ZM128 97.75L98 70L106 79L136 106.75Z'
const WINDOW_VOLUME = 'M18 18H106L114 27V91H26L18 82Z'
const CURSOR_OUTLINE =
  'M92.5 70Q92.5 67.85 93.96 66.27Q95.51 64.59 97.79 64.5Q100.06 64.42 101.73 65.96L131.73 93.71Q133.5 95.35 133.5 97.75Q133.5 100.03 131.89 101.64Q130.28 103.25 128 103.25H123.94L126.97 109.65Q127.04 109.8 127.11 109.96Q127.95 112.07 127.06 114.17Q126.16 116.26 124.04 117.11L116.54 120.11Q114.49 120.93 112.44 120.1Q110.39 119.27 109.48 117.26L105.87 109.22L101.73 113.04Q100.15 114.5 98 114.5Q95.72 114.5 94.11 112.89Q92.5 111.28 92.5 109ZM98 70V109L107.75 100L114.5 115L122 112L115.25 97.75H128Z'
const CURSOR_FILL = 'M98 70V109L107.75 100L114.5 115L122 112L115.25 97.75H128L98 70Z'

const DOT_X = [18.5, 30.5, 42.5]

export function PlanaSymbol({ sun = 0, dots = 3, pressed = false, reversed = false, label, decorative = false, ids = false, className }: PlanaSymbolProps) {
  const clipId = `pd-clip-${useId().replace(/:/g, '')}`
  const id = (name: string) => (ids ? `pd-${name}` : undefined)
  const style = { '--sun': sun } as CSSProperties

  return (
    <svg
      className={cx('w-plana-sym', reversed && 'w-plana-sym--reversed', className)}
      viewBox={reversed ? '-5 -5 151.5 139.52' : '0 0 141.5 129.52'}
      width={reversed ? 151.5 : 141.5}
      height={reversed ? 139.52 : 129.52}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : (label ?? 'Plana Digital symbol: a sun rising over a green field inside a browser window, with a cursor')}
      aria-hidden={decorative || undefined}
      focusable="false"
      data-pressed={pressed ? 'true' : undefined}
      style={style}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="109" height="85" x="7.5" y="7.5" rx="10.5" />
        </clipPath>
      </defs>

      {reversed && (
        <g id={id('edge')} className="w-plana-sym__edge">
          <path id={id('edge-window')} d={WINDOW_VOLUME} strokeWidth="46" />
          <path id={id('cursor-edge')} className="w-plana-sym__cursor" d={CURSOR_VOLUME} strokeWidth="21" />
        </g>
      )}

      <g id={id('volume')} className="w-plana-sym__ink">
        <path id={id('volume-window')} d={WINDOW_VOLUME} strokeWidth="36" strokeLinejoin="round" />
      </g>
      <g id={id('cursor-volume')} className="w-plana-sym__ink w-plana-sym__cursor">
        <path d={CURSOR_VOLUME} strokeWidth="11" strokeLinejoin="round" />
      </g>

      <g id={id('window')}>
        <rect id={id('window-body')} className="w-plana-sym__paper" width="109" height="85" x="7.5" y="7.5" rx="10.5" />
        <g id={id('scene')} clipPath={`url(#${clipId})`}>
          <circle id={id('sun')} className="w-plana-sym__sun" cx="62" cy="74" r="27" />
          <g id={id('horizon')}>
            <rect id={id('horizon-field')} className="w-plana-sym__field" width="109" height="18.5" x="7.5" y="74" />
            <rect id={id('horizon-stripe')} className="w-plana-sym__stripe" width="109" height="5" x="7.5" y="81" />
          </g>
        </g>
        <rect id={id('frame')} className="w-plana-sym__frame" width="116.5" height="92.5" x="3.75" y="3.75" rx="14.25" />
        <rect id={id('bar')} className="w-plana-sym__night" width="109" height="6" x="7.5" y="24" />
        <g id={id('dots')}>
          {DOT_X.map((cx0, i) => (
            <g key={cx0}>
              <circle className="w-plana-sym__dot-off" cx={cx0} cy="16.75" r="4.2" />
              <circle id={id(`dot-${i + 1}`)} className={`w-plana-sym__dot w-plana-sym__dot--${i + 1}`} data-lit={dots > i ? 'true' : 'false'} cx={cx0} cy="16.75" r="4.2" />
            </g>
          ))}
        </g>
      </g>

      <g id={id('cursor')} className="w-plana-sym__cursor">
        <path id={id('cursor-outline')} className="w-plana-sym__night" d={CURSOR_OUTLINE} />
        <path id={id('cursor-fill')} className="w-plana-sym__paper" d={CURSOR_FILL} />
      </g>
    </svg>
  )
}
