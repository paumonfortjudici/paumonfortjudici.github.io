// The four big scenes of the film (COLLECT, SKETCH, MAKE, DELIVER). By default each frame draws its vector scene (./scenes.tsx).
// When Pau's own picture exists at public/process/scene-0N.webp (N = 1..4, 1400 x 1500) add its index (0..3) here and the frame
// shows the picture instead. `node tools/ingest-images.mjs` does this for you when it files the images of the inbox.
export const SCENE_IMAGES: ReadonlySet<number> = new Set<number>([])
export const sceneImage = (i: number): string => `/process/scene-0${i + 1}.webp`
