// Worker: renders the pile tiles off the main thread. When the worker has OffscreenCanvas it also encodes the PNG here, so the main thread
// only wraps the finished Blob in a URL; otherwise it hands the pixels back (transferred, not copied) and the main thread encodes them.
import { renderPile, type PileSpec } from './pileCore'

interface Request {
  id: number
  spec: PileSpec
  dpr: number
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null
  postMessage: (message: unknown, transfer?: Transferable[]) => void
}

scope.onmessage = async (event) => {
  const { id, spec, dpr } = event.data
  const { n, data } = renderPile(spec, dpr)
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const canvas = new OffscreenCanvas(n, n)
      const g = canvas.getContext('2d')
      if (g) {
        g.putImageData(new ImageData(data as ImageDataArray, n, n), 0, 0)
        const blob = await canvas.convertToBlob({ type: 'image/png' })
        scope.postMessage({ id, n, blob })
        return
      }
    } catch {
      // fall through: the main thread can still encode the pixels
    }
  }
  scope.postMessage({ id, n, buffer: data.buffer }, [data.buffer])
}
