// One breakpoint shared by About.tsx and Credentials.tsx: below it the education strips leave the portrait column and join the
// certificates. Only one of the two places is in the DOM at a time. Keep the number in step with the @media blocks of about.css.
import { useMediaQuery } from '../../../lib/hooks'

export const NARROW_QUERY = '(max-width: 699px)'
export const useNarrow = (): boolean => useMediaQuery(NARROW_QUERY)
