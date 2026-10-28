// The implementation lives in ../motion (it owns the pause-switch store). Re-exported here so
// `import { useMotion } from '../lib/hooks/useMotion'` and `from '../lib/hooks'` both work.
export { useMotion, setMotionPaused, toggleMotionPaused, getMotionPaused } from '../motion'
export type { MotionState } from '../motion'
