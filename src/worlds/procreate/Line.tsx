// The one-line description of a print, set so that a hyphenated word is never split across two lines ("T-" / "shirt").
import { Fragment } from 'react'

const GLUED = /(T-shirt)/g

export function Line({ text }: { text: string }) {
  return (
    <>
      {text.split(GLUED).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="w-procreate-nb">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}
