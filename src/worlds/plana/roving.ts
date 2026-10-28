// Arrow-key handling for a tablist / radiogroup with a roving tabindex (one tab stop; arrows, Home and End move and select).
import type { KeyboardEvent } from 'react'

export function rovingKeyDown(count: number, current: number, choose: (next: number) => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    const last = count - 1
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = current === last ? 0 : current + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = current === 0 ? last : current - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next < 0) return
    event.preventDefault()
    choose(next)
  }
}
