// Small hand-drawn pictograms for the ticket stubs and the clocks. Strokes, round caps, slightly off-true geometry on purpose.
// They are decorative (aria-hidden): the words next to them carry the meaning. No icon-in-circle: they sit loose on the paper.

import type { ReactNode, SVGProps } from 'react'

export type GlyphName = 'chat' | 'sunrise' | 'devil' | 'branch' | 'lens'

const BODY: Record<GlyphName, ReactNode> = {
  // a speech bubble with two lines of text in it (WhatsApp)
  chat: (
    <>
      <path d="M4.6 13.2C4.6 8.3 8.8 4.4 14 4.4s9.4 3.9 9.4 8.8-4.2 8.8-9.4 8.8c-1.3 0-2.5-.2-3.6-.6L5 23.6l1.7-4.5c-1.3-1.6-2.1-3.5-2.1-5.9Z" />
      <path d="M10.2 12.4h7.7M10.2 16.2h4.6" />
    </>
  ),
  // a browser window with the sun coming up (Plana Digital)
  sunrise: (
    <>
      <path d="M5.2 5.3h17.6c1.2 0 2.2 1 2.2 2.2v13c0 1.2-1 2.2-2.2 2.2H5.2C4 22.7 3 21.7 3 20.5v-13c0-1.2 1-2.2 2.2-2.2Z" />
      <path d="M3.1 10.5h21.8" />
      <path d="M6.3 8h.01M9.2 8h.01M12.1 8h.01" />
      <path d="M9.1 20.6a4.9 4.9 0 0 1 9.8 0" />
      <path d="M3.4 20.6h21.2" />
    </>
  ),
  // the little devil of 44 Lab
  devil: (
    <>
      <path d="M6.4 15.3c0-4.9 3.4-8.3 7.7-8.3s7.6 3.4 7.6 8.3c0 4.5-3.2 7.5-7.6 7.5s-7.7-3-7.7-7.5Z" />
      <path d="M7.7 9.6 5.1 3.8l5.4 2.7M20.5 9.6l2.5-5.8-5.4 2.7" />
      <path d="M10.9 14.4h.01M17.2 14.4h.01" />
      <path d="M10.5 18.2c1.9 1.7 5.2 1.7 7.1 0" />
    </>
  ),
  // a git branch (GitHub)
  branch: (
    <>
      <circle cx="8" cy="6.3" r="2.5" />
      <circle cx="8.2" cy="21.7" r="2.5" />
      <circle cx="20.3" cy="10.5" r="2.5" />
      <path d="M8 8.8v10.4" />
      <path d="M20.2 13c.1 4.7-6.5 4.2-11.3 7.2" />
    </>
  ),
  // a magnifying glass: a whodunit (Spelled Guilty)
  lens: (
    <>
      <circle cx="11.7" cy="11.6" r="7.1" />
      <path d="M17 17.1 24.2 24.3" />
      <path d="M8 9.7a4.3 4.3 0 0 1 3.1-2.5" />
    </>
  ),
}

export function Glyph({ name, ...rest }: { name: GlyphName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {BODY[name]}
    </svg>
  )
}

/** the day / night dot of a clock: a sun with short rays, a crescent with one star */
export function DayDot({ day, ...rest }: { day: boolean } & SVGProps<SVGSVGElement>) {
  return day ? (
    <svg viewBox="0 0 28 28" fill="currentColor" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true" focusable="false" {...rest}>
      <circle cx="14" cy="14" r="5" stroke="none" />
      <path fill="none" d="M14 3.6v3M14 21.4v3M3.6 14h3M21.4 14h3M6.7 6.7l2.1 2.1M19.2 19.2l2.1 2.1M21.3 6.7l-2.1 2.1M8.8 19.2l-2.1 2.1" />
    </svg>
  ) : (
    <svg viewBox="0 0 28 28" fill="currentColor" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true" focusable="false" {...rest}>
      <path stroke="none" d="M22.4 17.9A9.2 9.2 0 0 1 10.1 5.6 9.2 9.2 0 1 0 22.4 17.9Z" />
      <path fill="none" d="M20.8 5.2v3.4M19.1 6.9h3.4" />
    </svg>
  )
}
