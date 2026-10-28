// Everything the Space Monkey world states, in one place. Every fact below comes from public/works/space-monkey/manifest.json
// (file metadata of the two Photoshop exports), docs/ART_DIRECTION.md section 12.1 and Pau's own words ("my first project, at 13").
// Not stated on purpose: the room's duration, the rank of Tyler (sources disagree), who made the monkey patch (author unknown).
import { asset } from '@/lib/asset'

export interface Swatch {
  hex: string
  name: string
}

export interface PosterData {
  id: 'tyler' | 'smith'
  /** "Poster 01 / 02" */
  n: 1 | 2
  title: string
  src: string
  thumb: string
  width: number
  height: number
  alt: string
  /** one line about what the poster shows (the back of the card) */
  caption: string
  /** name of the exported JPG on disk */
  file: string
  /** Photoshop document dates from the XMP metadata (local time, +01:00) */
  created: string
  saved: string
  /** the colours that are really in the poster (manifest palettes) */
  palette: Swatch[]
  note: string
}

export const POSTERS: readonly PosterData[] = [
  {
    id: 'tyler',
    n: 1,
    title: 'TYLER',
    src: asset('/works/space-monkey/tyler.webp'),
    thumb: asset('/works/space-monkey/tyler-thumb.webp'),
    width: 1005,
    height: 1500,
    alt: 'Space Monkey escape-room poster "TYLER": a line-drawn astronaut floating in front of the Earth on a starfield, title in brushed-metal condensed capitals.',
    caption: 'An astronaut drifts in front of the Earth.',
    file: 'TYLER.jpg',
    created: '08 DEC 2017 / 00:25',
    saved: '08 DEC 2017',
    palette: [
      { hex: '#020308', name: 'Space black' },
      { hex: '#0C152F', name: 'Midnight' },
      { hex: '#7F8388', name: 'Steel grey' },
      { hex: '#DEDEDE', name: 'Suit silver' },
      { hex: '#065D8C', name: 'Earth blue' },
      { hex: '#4C7DA2', name: 'Haze blue' },
    ],
    note: 'My first project, at 13.',
  },
  {
    id: 'smith',
    n: 2,
    title: 'SMITH',
    src: asset('/works/space-monkey/smith.webp'),
    thumb: asset('/works/space-monkey/smith-thumb.webp'),
    width: 1017,
    height: 1500,
    alt: 'Space Monkey escape-room poster "SMITH": a stern cartoon sergeant in a royal-blue uniform with yellow epaulettes in front of a space-shuttle launch hangar, title in chrome capitals.',
    caption: 'A stern sergeant, medals on, in the shuttle hangar.',
    file: 'SMITH 2.jpg',
    created: '13 DEC 2017 / 16:47',
    saved: '20 DEC 2017',
    palette: [
      { hex: '#1961D0', name: 'Royal blue' },
      { hex: '#0D2655', name: 'Deep navy' },
      { hex: '#8B5E2F', name: 'Hangar' },
      { hex: '#C89231', name: 'Gold' },
      { hex: '#E1DE0A', name: 'Epaulette' },
      { hex: '#E9F5FB', name: 'Pale sky' },
    ],
    note: 'Five days after TYLER.',
  },
]

/** The monkey patch on SMITH's sleeve, as a fraction of the art (measured on smith-thumb.webp 600x885): centre and radius. */
export const SLEEVE_PATCH = { x: 0.708, y: 0.405, r: 0.062 }

export const PATCH_SRC = asset('/works/space-monkey/logo-monkey-patch.png')
export const PATCH_ALT =
  'Round badge: a tan-and-white cartoon monkey head with big eyes and an open smile, wearing a headset with microphone, inside a black helmet ring.'

// ---- the typed cover sheet and the mission log ---------------------------------------------------------------------------
export const LEAD = 'Two character posters for an escape room in Granollers, made in Photoshop before the room opened.'

export interface LogLine {
  k: string
  v: string
}

/** The one line of story is paraphrased from the room's own pages (booking listing + archived site). */
export const LOG: readonly LogLine[] = [
  { k: 'What', v: 'Two character posters for an escape room. TYLER has an astronaut over the Earth, SMITH a sergeant in a shuttle hangar.' },
  { k: 'Story', v: 'A crew flies the shuttle Icarus to the station Helios, where contact has been lost.' },
  { k: 'Where', v: 'Granollers, near Barcelona. The room is called Space Monkey and takes two to six players.' },
  { k: 'When', v: 'December 2017, in Photoshop. The room opened in February 2018.' },
  { k: 'Who', v: 'Me, at 13. It was my first project.' },
  { k: 'Now', v: 'The room’s own website no longer exists, so there is nothing to link to. The posters stay.' },
]

// ---- the mission tape (day-accurate: 1 Dec 2017 = 0, 28 Feb 2018 = 89) -------------------------------------------------------
export const TAPE_DAYS = 90

export interface TapeMark {
  /** day index counted from 1 December 2017 */
  day: number
  date: string
  text: string
  side: 'up' | 'down'
  strong?: boolean
}

export const TAPE_MARKS: readonly TapeMark[] = [
  { day: 7, date: '08 DEC', text: 'TYLER file created', side: 'up' },
  { day: 12, date: '13 DEC', text: 'SMITH file created', side: 'down' },
  { day: 19, date: '20 DEC', text: 'SMITH last saved', side: 'up' },
  { day: 80, date: '19 FEB 2018', text: 'Space Monkey opens in Granollers', side: 'up', strong: true },
]

/** month boundaries on the tape: label + first day index */
export const TAPE_MONTHS: readonly { label: string; day: number }[] = [
  { label: 'DEC 2017', day: 0 },
  { label: 'JAN 2018', day: 31 },
  { label: 'FEB 2018', day: 62 },
]

/** from the last save of SMITH (20 Dec) to opening day (19 Feb): 11 + 31 + 19 days */
export const TAPE_GAP_DAYS = 61
