// Aiming a hand-drawn arrow: <Scribble kind="arrow"> is drawn from a tail at (5%, 76%) to a tip at (95%, 25%) of a box that is 1.9
// times as wide as it is tall. To make an arrow start and end where a note needs it, the box is sized and turned so that
// tail -> tip covers from -> to. Pure maths, shared by the prints (notes on their margins) and the wall (its own note).

const BASE_ANGLE = Math.atan2(-0.268, 0.9)
const BASE_LENGTH = 0.939
const TIP = { x: 0.45, y: -0.1316 }

export interface Aim {
  /** the arrow's box, in the same pixels as the points it was given: left, top and width (the height follows from the 1.9 ratio) */
  left: number
  top: number
  width: number
  /** degrees to pass to the Scribble's `rotate` */
  rotate: number
}

export function aimBetween(fx: number, fy: number, tx: number, ty: number): Aim {
  const length = Math.hypot(tx - fx, ty - fy) / BASE_LENGTH
  const theta = Math.atan2(ty - fy, tx - fx) - BASE_ANGLE
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  const cx = tx - (TIP.x * length * cos - TIP.y * length * sin)
  const cy = ty - (TIP.x * length * sin + TIP.y * length * cos)
  return { left: cx - length / 2, top: cy - length / 3.8, width: length, rotate: (theta * 180) / Math.PI }
}
