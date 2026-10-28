import { useCallback, useSyncExternalStore } from 'react'

/** Live `matchMedia(query).matches`. Always false when matchMedia does not exist (tests, very old browsers). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  const getSnapshot = useCallback(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches,
    [query],
  )
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
