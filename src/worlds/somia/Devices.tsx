// The two devices in the window, drawn with CSS (no stock frames): a laptop and a phone whose screens show the real
// captures of somia.store. A screen is a clipping frame + a tall strip of captures that the tour engine translates.
// Captures mount only when they come within ~1.3 screens of the visible part (IntersectionObserver rooted on the screen),
// each slice reserves its exact aspect ratio first, so nothing shifts and nothing is fetched that nobody will see.

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { cap, type Variant } from './data'
import type { Tour } from './tour'

interface ScreenProps {
  id: 'laptop' | 'phone'
  variant: Variant
  tour: Tour
  label: string
  /** the device is part of the current view: a hidden device fetches nothing (the 400 KB desktop composite never reaches a phone) */
  shown: boolean
}

function Screen({ id, variant, tour, label, shown }: ScreenProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const sliceRefs = useRef<Array<HTMLDivElement | null>>([])
  const grabbing = useRef(false)
  const { slices } = variant
  const [near, setNear] = useState<boolean[]>(() => slices.map((_, i) => i === 0 && shown))

  // a device that was hidden and now comes on show starts with its first capture (another page remounts the screen: see Showcase)
  useEffect(() => {
    if (shown) setNear((prev) => (prev[0] ? prev : [true, ...prev.slice(1)]))
  }, [shown])

  useEffect(() => {
    const viewport = viewportRef.current
    const strip = stripRef.current
    if (!viewport || !strip) return
    return tour.register(id, { viewport, strip })
  }, [tour, id, slices])

  // captures are mounted only while the device is on show and the slice is within ~1.3 screens of the visible part
  useEffect(() => {
    const root = viewportRef.current
    if (!root || !shown) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(slices.map(() => true))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        setNear((prev) => {
          let next = prev
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const index = Number((entry.target as HTMLElement).dataset.i)
            if (!prev[index]) {
              if (next === prev) next = prev.slice()
              next[index] = true
            }
          }
          return next
        })
      },
      { root, rootMargin: '130% 0px 130% 0px' },
    )
    sliceRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [slices, shown])

  // mouse and pen drag the page; touch keeps scrolling the world (the tape and the section buttons are the touch path)
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    grabbing.current = true
    event.currentTarget.dataset.grabbing = 'true'
    tour.grab(id, event.clientY)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (grabbing.current) tour.drag(event.clientY)
  }
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!grabbing.current) return
    grabbing.current = false
    delete event.currentTarget.dataset.grabbing
    tour.release()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const height = viewportRef.current?.clientHeight ?? 400
    let step = 0
    switch (event.key) {
      case 'ArrowDown':
        step = height * 0.16
        break
      case 'ArrowUp':
        step = -height * 0.16
        break
      case 'PageDown':
        step = height * 0.88
        break
      case ' ':
        // Space pages down, Shift + Space pages up (the page behind must not jump while a screen has focus)
        step = event.shiftKey ? -height * 0.88 : height * 0.88
        break
      case 'PageUp':
        step = -height * 0.88
        break
      case 'Home':
        event.preventDefault()
        event.stopPropagation()
        tour.onInteract?.()
        tour.tweenTo(0, 420)
        return
      case 'End':
        event.preventDefault()
        event.stopPropagation()
        tour.onInteract?.()
        tour.tweenTo(1, 420)
        return
      default:
        return
    }
    event.preventDefault()
    event.stopPropagation()
    tour.nudge(id, step, step > height * 0.5 || step < -height * 0.5 ? 380 : 200)
  }

  return (
    <div
      ref={viewportRef}
      className="w-somia-screen"
      data-device={id}
      tabIndex={0}
      role="group"
      aria-roledescription="scrolling preview"
      aria-label={label}
      data-cursor="Drag"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <div ref={stripRef} className="w-somia-reel">
        {slices.map((slice, i) => (
          <div
            key={slice.file}
            ref={(el) => {
              sliceRefs.current[i] = el
            }}
            className="w-somia-slice"
            data-i={i}
            style={{ aspectRatio: `${slice.w} / ${slice.h}` }}
          >
            {near[i] ? (
              <img
                src={cap(slice.file)}
                alt={slice.alt}
                width={slice.w}
                height={slice.h}
                decoding="async"
                draggable={false}
                // the first capture of the device on show is what the first screen is made of (lower-case attribute: React 18 passes it through)
                {...(i === 0 ? ({ fetchpriority: 'high' } as Record<string, string>) : null)}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

interface DeviceProps {
  tour: Tour
  variant: Variant
  /** is this device part of the current view (the other one fades away) */
  shown: boolean
  label: string
}

// React 18 has no typed `inert` prop: spread it as a plain attribute
const inertProps = (on: boolean): Record<string, string | undefined> => (on ? { inert: '' } : {})

export function Laptop({ tour, variant, shown, label }: DeviceProps) {
  return (
    <div className="w-somia-dev w-somia-dev--laptop" data-shown={shown} aria-hidden={shown ? undefined : true} {...inertProps(!shown)}>
      <div className="w-somia-laptop">
        <div className="w-somia-lid">
          <span className="w-somia-cam" aria-hidden="true" />
          <Screen id="laptop" variant={variant} tour={tour} label={label} shown={shown} />
        </div>
        <div className="w-somia-base" aria-hidden="true" />
      </div>
      <p className="w-somia-tent">
        <span>Desktop</span> 1440&nbsp;px
      </p>
    </div>
  )
}

export function Phone({ tour, variant, shown, label }: DeviceProps) {
  return (
    <div className="w-somia-dev w-somia-dev--phone" data-shown={shown} aria-hidden={shown ? undefined : true} {...inertProps(!shown)}>
      <div className="w-somia-phone">
        <div className="w-somia-phone__body">
          <span className="w-somia-island" aria-hidden="true" />
          <Screen id="phone" variant={variant} tour={tour} label={label} shown={shown} />
        </div>
      </div>
      <p className="w-somia-tent">
        <span>Phone</span> 390&nbsp;px
      </p>
    </div>
  )
}
