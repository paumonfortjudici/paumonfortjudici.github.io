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
    created: 'DEC 2013',
    saved: 'DEC 2013',
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
    alt: 'Space Monkey escape-room poster "SMITH": a stern cartoon officer in a royal-blue uniform with yellow epaulettes in front of a space-shuttle launch hangar, title in chrome capitals.',
    caption: 'A stern officer, medals on, in the shuttle hangar.',
    file: 'SMITH 2.jpg',
    created: 'DEC 2013',
    saved: 'DEC 2013',
    palette: [
      { hex: '#1961D0', name: 'Royal blue' },
      { hex: '#0D2655', name: 'Deep navy' },
      { hex: '#8B5E2F', name: 'Hangar' },
      { hex: '#C89231', name: 'Gold' },
      { hex: '#E1DE0A', name: 'Epaulette' },
      { hex: '#E9F5FB', name: 'Pale sky' },
    ],
    note: 'The second poster of the pair.',
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
  { k: 'What', v: 'The artwork for the room: TYLER, an astronaut over the Earth, and SMITH, a uniformed officer in a shuttle hangar.' },
  { k: 'Story', v: 'A crew flies the shuttle Icarus to the station Helios, where contact has been lost.' },
  { k: 'Where', v: 'Near Barcelona, in a room built for two to six players.' },
  { k: 'When', v: 'Both posters are from December 2013. The room opened in May 2014.' },
  { k: 'Who', v: 'Me, at 13. It was my first project.' },
  { k: 'Now', v: 'The room’s own website no longer exists, so there is nothing to link to. The posters stay.' },
]

// ---- the mission tape (day-accurate: 1 Dec 2013 = 0, 31 May 2014 = 181) -------------------------------------------------------
export const TAPE_DAYS = 182

export interface TapeMark {
  /** day index counted from 1 December 2013 */
  day: number
  date: string
  text: string
  side: 'up' | 'down'
  strong?: boolean
}

/** only what Pau states: both posters are from December 2013, the room opened in May 2014 (no day of the month is claimed) */
export const TAPE_MARKS: readonly TapeMark[] = [
  { day: 15, date: 'DEC 2013', text: 'TYLER and SMITH are made', side: 'up' },
  { day: 165, date: 'MAY 2014', text: 'Space Monkey opens in Granollers', side: 'up', strong: true },
]

/** month boundaries on the tape: label + first day index */
export const TAPE_MONTHS: readonly { label: string; day: number }[] = [
  { label: 'DEC 2013', day: 0 },
  { label: 'JAN 2014', day: 31 },
  { label: 'FEB 2014', day: 62 },
  { label: 'MAR 2014', day: 90 },
  { label: 'APR 2014', day: 121 },
  { label: 'MAY 2014', day: 151 },
]

/** from the posters (December) to opening day (May) */
export const TAPE_GAP_LABEL = 'about five months'
