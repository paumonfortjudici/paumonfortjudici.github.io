import type { Config } from 'tailwindcss'

// Tailwind is used for layout utilities only; bespoke components use plain CSS (see docs/ARCHITECTURE.md).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        accent: ['var(--font-accent)'],
        body: ['var(--font-body)'],
        label: ['var(--font-label)'],
        hand: ['var(--font-hand)'],
      },
      colors: {
        desk: 'var(--desk)',
        ink: 'var(--ink)',
        cream: 'var(--cream)',
        paper: 'var(--paper)',
        tomato: 'var(--tomato)',
        marigold: 'var(--marigold)',
        pine: 'var(--pine)',
        oxblood: 'var(--oxblood)',
        ultraviolet: 'var(--ultraviolet)',
        bubblegum: 'var(--bubblegum)',
        lagoon: 'var(--lagoon)',
        olive: 'var(--olive)',
        butter: 'var(--butter)',
        lilac: 'var(--lilac)',
      },
    },
  },
  plugins: [],
} satisfies Config
