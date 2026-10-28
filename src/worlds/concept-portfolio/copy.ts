// Every visible string of the Slide Deck world (English). Warm, direct, first person where it is Pau talking.
// No arrow glyphs (the faces have none: icons are drawn), no em dashes, typographic apostrophes.
// Honesty: Ona Ribas is an invented client. Pau's part: the brief, the art direction, the system and the layout decisions.
// The artwork was produced with AI-assisted tools under that direction (docs/ART_DIRECTION.md 12.1).

import { pad2 } from '@/lib/copy'
import { SLIDE_COUNT } from './data'

export const COPY = {
  /** the world's only heading (the Cover owns the h1), read by screen readers */
  heading: 'Ona Ribas: a foley portfolio, shown as a pitch',
  intro:
    'A five-slide portfolio deck for Ona Ribas, an invented foley artist from Girona. Move along the lane to flip through it. Present shows it full screen, Design notes explains each choice I made, and Sound turns the props into instruments.',

  callsheet: {
    head: 'Call sheet',
    day: 'Pitch day',
    rows: [
      ['Client', 'Ona Ribas, foley artist (invented)'],
      ['Deck', 'A five-slide portfolio, 9:16'],
      ['My part', 'The brief, the rules and the art direction'],
      ['Try', 'Present, Design notes, Sound'],
    ] as const,
  },

  wrap: {
    head: 'That’s a wrap',
    day: 'Take 1',
    rows: [
      ['Scene', 'Five of five, the last slide'],
      ['Client', 'Invented, like her phone number'],
      ['Next', 'Roll the credits: how this deck was made'],
    ] as const,
  },

  bar: {
    label: 'Deck tools',
    stage: 'Presentation room',
    present: 'Present',
    notes: 'Design notes',
    notesShort: 'Notes',
    notesLabel: (n: number): string => `Design notes, ${n} on this slide`,
    sound: 'Sound',
    sheet: 'Sheet',
    about: 'About Ona',
    on: 'ON',
    off: 'OFF',
  },

  lane: {
    label: 'Slides of the Ona Ribas deck',
    roleDescription: 'carousel',
    slideRole: 'slide',
    hint: 'Drag, scroll or use the arrow keys',
    prev: 'Previous',
    next: 'Next',
    goTo: (n: number, title: string): string => `Go to slide ${n}: ${title}`,
    slideLabel: (n: number, title: string): string => `Slide ${n} of ${SLIDE_COUNT}: ${title}`,
    caption: (n: number): string => `Slide ${pad2(n)} / ${pad2(SLIDE_COUNT)}`,
    announce: (n: number, title: string): string => `Slide ${n} of ${SLIDE_COUNT}: ${title}`,
    trailLabel: 'Slide trail',
    trailStep: (n: number, title: string): string => `Slide ${n}: ${title}`,
  },

  loupe: {
    button: 'Loupe',
    on: 'Loupe on. The arrow keys move it, Enter or Escape puts it away.',
    off: 'Loupe off.',
    laneHint: 'Press Enter to open the loupe on this slide.',
    hint: 'Tiny print? Try the loupe',
  },

  notes: {
    pin: (k: number, total: number, title: string): string => `Design note ${k} of ${total}: ${title}`,
    kicker: (k: number, total: number): string => `Note ${pad2(k)} / ${pad2(total)}`,
    signature: 'Pau',
    on: 'Design notes on.',
    off: 'Design notes off.',
  },

  sound: {
    on: 'Sound board on. Press a prop to hear it.',
    off: 'Sound board off.',
    honest: 'Synthesised in your browser: no recordings',
    honestShort: 'Synthesised here: no recordings',
    help: 'Turns the props on the slides into instruments. Off until you switch it on. Synthesised in your browser: no recordings.',
    hint: 'Tap the props on the slide',
    unavailable: 'This browser cannot make sound.',
    heard: (word: string): string => `${word}`,
  },

  sheet: {
    title: 'Contact sheet',
    sub: 'Five frames, one deck. Pick one and the lane goes there.',
    close: 'Back to the deck',
    frame: (n: number, title: string): string => `Frame ${n}: ${title}`,
  },

  present: {
    label: (n: number): string => `Presenting, slide ${n} of ${SLIDE_COUNT}`,
    leave: 'Leave',
    concept: 'Concept, invented client',
    prev: 'Previous slide',
    next: 'Next slide',
    keys: 'Arrows, space, Home, End',
    notesKey: 'N for design notes',
    swipe: 'Swipe to turn',
  },

  panel: {
    tab: 'About Ona',
    close: 'Back to the deck',
    invented: 'Invented client',
    inventedLine: 'Ona Ribas, her studios, films, e-mail and phone number are all made up.',
    projectsTitle: 'Three projects, all invented',
    availabilityTitle: 'Availability',
    briefTitle: 'What she asked for',
    briefTag: 'Invented brief',
    brief:
      'Ona wanted something she could send to a director in one message: five slides, nothing that looks like a sound library, and room for a joke. She wanted to be shown as someone who turns celery into bones, with her footsteps in it somewhere. I kept the brief short so the deck could be short too.',
    paletteTitle: 'Palette',
    paletteHint: 'Click a colour to copy its code.',
    copied: 'Copied',
    copiedToast: (hex: string): string => `Copied ${hex}`,
    fontsTitle: 'Fonts',
    fontsNote: 'Only Anybody is loaded on this page. Syne and DM Sans are named here and live inside the slide images.',
    sampleLabel: 'Live sample of Anybody',
    widthLabel: 'Width axis',
    mixLabel: 'Mix the widths',
    mixOn: 'Per letter',
    mixOff: 'Even',
    mixHelp: 'Every title on the deck gives each letter its own width, from tall and narrow to wide.',
    licence: 'SIL OFL 1.1',
  },

  credits: {
    title: 'How this deck was made',
    p1: 'Ona Ribas is not real. Her name, her studios, her films, her e-mail and her phone number are all made up (the address ends in .example and the phone is zeros).',
    stripCaption: 'Five slides, one family: teal, butter, deep teal, butter, teal.',
    p2: 'What is real is the design. I wrote the brief, set the rules (grid, palette, type, the footprints and the sunbursts) and art-directed every slide. The artwork was produced with AI-assisted tools under that direction.',
  },
}
