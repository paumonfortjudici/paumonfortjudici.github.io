// Worker: renders the pile tiles off the main thread and hands the pixels back (transferred, not copied).
import { renderPile, type PileSpec } from './pileCore'

interface Request {
  id: number
  spec: PileSpec
  dpr: number
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null
  postMessage: (message: unknown, transfer: Transferable[]) => void
}

scope.onmessage = (event) => {
  const { id, spec, dpr } = event.data
  const { n, data } = renderPile(spec, dpr)
  scope.postMessage({ id, n, buffer: data.buffer }, [data.buffer])
}
