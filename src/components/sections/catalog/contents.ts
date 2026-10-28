// What is inside each folder: three short lines per world, the template's "radio-like items" of the open chapter turned into a typed
// contents slip. They describe what the visitor can DO in the world (each line checked against the world's own note in docs/api/world-*.md),
// never claims about Pau or a client. The search reads them too, so "flashlight", "tape" or "gravity" finds a folder.
// Kept to about 25 characters a line: the slip is a small paper (a longer line simply wraps).

export const INSIDE: Readonly<Record<string, readonly string[]>> = {
  contract: ['Turn the issue’s pages', 'Find my name', 'Six bylines, pinned up'],
  plana: ['Colour chips you can copy', 'A live type tester', 'The 17-page brand manual'],
  'fortyfour-lab': ['Thirteen dated posts', 'A devil walking the thread', 'Carousels to flip through'],
  'spelled-guilty': ['A flashlight in the dark', 'Sample pages of six cases', 'A board with red string'],
  'space-monkey': ['Two tilting posters', 'The dossier on their backs', 'My first project, at 13'],
  procreate: ['Prints to drag around', 'Tidy them or shuffle them', 'A close look at each one'],
  somia: ['Laptop and phone mockups', 'A tailor’s tape scrubber', 'Logo, palette and values'],
  'concept-brand': ['The whole board, zoomable', 'A tour in nine stops', 'Brand kit: palette, type'],
  'concept-portfolio': ['Five slides to swipe', 'My design notes, pinned', 'Present it full screen'],
  illustration: ['Peel and stick on a laptop', 'Tip the lid for gravity', 'Save the laptop as a PNG'],
}
