// Where keyboard focus lands when a world closes. The router hands it back to the card that OPENED the world; but a visitor who hopped
// from folder 02 to 44 Lab with the "]" key and then pressed Esc has just been looking at 44 Lab: focus (and the page, if that card
// is off screen) goes to ITS card, in the same place (cover deck, catalog, works, about) as the card that opened the world when it
// has one, else the first card of that folder in the page. When the opener already is a card of the last folder, nothing changes.

import { useEffect, useRef } from 'react'
import { useRoute } from '../../lib/router'

const cardsOf = (slug: string): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('#app-root a[href]')).filter((a) => (a.getAttribute('href') ?? '').endsWith(`#/work/${slug}`))

export function useFocusReturn(): void {
  const route = useRoute()
  const lastSlug = useRef<string | null>(null)

  useEffect(() => {
    if (route.kind === 'work') {
      lastSlug.current = route.slug
      return
    }
    const slug = lastSlug.current
    lastSlug.current = null
    if (!slug) return
    // the world shell hands focus to the opener as it starts to leave: look after that has happened
    const id = window.setTimeout(() => {
      const now = document.activeElement as HTMLElement | null
      const cards = cardsOf(slug)
      if (cards.length === 0 || (now && cards.includes(now))) return
      const section = now?.closest('section')
      const target = (section && cards.find((c) => section.contains(c))) ?? cards[0]
      target.focus({ preventScroll: true })
      const r = target.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) target.scrollIntoView({ block: 'center', behavior: 'instant' })
    }, 140)
    return () => window.clearTimeout(id)
  }, [route])
}
