// Reads the route and mounts the open world inside a WorldShell. Lives next to #app-root (never inside it).
//   - AnimatePresence keeps the closing shell alive for its exit; `custom` carries the hop direction to the leaving shell
//   - the page behind (#app-root) is inert exactly while a world is open
//   - the world is a lazy chunk; its display face loads with it; the film leader shows while it loads
import { Suspense, useEffect, useLayoutEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { META } from '../lib/copy'
import { useRoute } from '../lib/router'
import { workBySlug } from '../lib/works'
import FilmLeader from './FilmLeader'
import WorldBoundary from './WorldBoundary'
import WorldShell from './WorldShell'
import { getWorldComponent, prefetchWorld } from './registry'

function WorldView({ slug }: { slug: string }) {
  const World = getWorldComponent(slug)
  return <World />
}

export default function WorldHost() {
  const route = useRoute()
  const work = route.kind === 'work' ? workBySlug(route.slug) : undefined
  const open = !!work

  // the cabinet behind the world cannot be focused, clicked or read by assistive tech
  useLayoutEffect(() => {
    const app = document.getElementById('app-root')
    if (!app) return
    if (open) app.setAttribute('inert', '')
    else app.removeAttribute('inert')
  }, [open])
  useEffect(() => () => document.getElementById('app-root')?.removeAttribute('inert'), [])

  useEffect(() => {
    document.title = work ? `${work.title} · Pau Monfort` : META.title
  }, [work])

  // start the world's chunk and display face as soon as the route says which world it is: the shell mounts the world a moment
  // later (when the folder has opened), and by then it is usually already here (the lazy loader awaits the same promises)
  const slug = work?.slug
  useEffect(() => {
    if (slug) prefetchWorld(slug)
  }, [slug])

  return (
    <AnimatePresence initial={false} custom={route.kind === 'work' ? route.dir : 0}>
      {work && route.kind === 'work' && (
        <WorldShell key={work.slug} work={work} origin={route.origin} dir={route.dir}>
          <WorldBoundary slug={work.slug}>
            <Suspense fallback={<FilmLeader />}>
              <WorldView slug={work.slug} />
            </Suspense>
          </WorldBoundary>
        </WorldShell>
      )}
    </AnimatePresence>
  )
}
