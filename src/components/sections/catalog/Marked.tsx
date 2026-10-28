// <Marked text words /> prints `text` and underlines the words the search matched: a hand-drawn pen line under the word (three
// different squiggles in rotation, drawn in on arrival), never a yellow highlighter. The line is CSS (.pm-cat-mark, catalog.css).
import { Fragment, useMemo } from 'react'
import { splitMarks } from './search'

export function Marked({ text, words }: { text: string; words: string[] }) {
  const parts = useMemo(() => splitMarks(text, words), [text, words])
  if (parts.length === 1 && !parts[0].mark) return <>{text}</>
  let n = 0
  return (
    <>
      {parts.map((part, i) =>
        part.mark ? (
          <mark key={i} className="pm-cat-mark" data-v={n++ % 3}>
            {part.text}
          </mark>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  )
}
