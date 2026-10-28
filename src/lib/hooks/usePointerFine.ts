import { useMediaQuery } from './useMediaQuery'

/**
 * True on devices whose primary input can hover precisely (mouse, trackpad). Gate hover-only extras
 * (custom cursor, tilt, hover previews) on this and always give touch and keyboard users an equivalent.
 */
export function usePointerFine(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}
