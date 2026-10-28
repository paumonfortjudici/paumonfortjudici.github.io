// Small drawn marks shared by the chrome (no glyphs: the three faces have none of these).

/** an eight-spoke asterisk, long and short spokes, cut by hand: the mark after the name (the template's ®) */
export function Asterisk({ className }: { className?: string }) {
  const spokes: [number, number][] = [
    [0, 15.2],
    [45, 12.4],
    [90, 15.6],
    [135, 12.8],
    [180, 15.0],
    [225, 12.6],
    [270, 15.4],
    [315, 12.2],
  ]
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round">
      {spokes.map(([deg, len], i) => {
        const a = (deg * Math.PI) / 180
        return <path key={i} d={`M20 20 L${(20 + Math.sin(a) * len).toFixed(1)} ${(20 - Math.cos(a) * len).toFixed(1)}`} />
      })}
    </svg>
  )
}
