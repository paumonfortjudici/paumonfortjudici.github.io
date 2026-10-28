// The awning: black and paper stripes, each stripe finished with its own scalloped end. Pure CSS (see somia.css):
// 27 stripes are rendered, narrower containers hide the last ones (always an odd count, so both edges are black).

const STRIPES = 27

export function Awning({ ready }: { ready: boolean }) {
  return (
    <div className="w-somia-awning" aria-hidden="true" data-ready={ready ? 'true' : 'false'}>
      <div className="w-somia-awning__row">
        {Array.from({ length: STRIPES }, (_, i) => (
          <span key={i} className="w-somia-stripe" />
        ))}
      </div>
    </div>
  )
}
