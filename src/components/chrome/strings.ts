// Strings that only the chrome uses (the shell's shared strings live in src/lib/copy.ts and are imported from there).
// English, warm, specific. Arrows are never typed: the three faces have no arrow glyphs, the icons are drawn as SVG.

export const CHROME = {
  /**
   * An "Open for projects" stamp at the right end of the Mast. Off: the Cover already has a round "Open for projects" stamp of its own,
   * and the same message twice on the first screen is one ornament too many (the notes take the room instead). `show: true` brings it back.
   */
  stamp: { show: false, text: 'Open for projects', sub: '2026' },
  /** shown instead of the label when the OS asks for reduced motion (the button is then disabled: nothing to toggle) */
  motionOff: 'Motion is off in your system settings',
  /** the end titles in the footer: role, then name(s) */
  credits: [
    { role: 'Design, illustration, code', name: 'Pau Monfort' },
    { role: 'Type', name: 'Fraunces, Karla, Courier Prime' },
    { role: 'Starting point', name: 'Folder Tab Portfolio template on 21st.dev, rebuilt and redrawn' },
  ],
  /** the key hints in the footer */
  keys: {
    close: 'closes a folder',
    hop: 'hop between folders',
    turn: 'turn pages',
    srArrows: 'Left and right arrow keys',
    srBrackets: 'Left and right square bracket keys',
  },
  /** a margin note in the marker face above the last two tabs of the last frame (film slang for "we are done here") */
  wrap: 'that’s a wrap!',
  /** accessible name of the sticky navigation */
  navLabel: 'Sections',
  /** the "PM" monogram tab in the rail: "Pau Monfort: back to the top" */
  homeLabel: 'back to the top',
} as const
