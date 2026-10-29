// The four big scenes of the film (COLLECT, SKETCH, MAKE, DELIVER). Each frame draws its picture when its index is listed here: Pau's own
// hand-painted scene, public/process/scene-0N.webp (1400 x 1500, transparent, drawn on the frame's colour) with a 800 px twin for narrow
// screens, both filed by `python tools/ingest_process.py <folder>` (see docs/image-prompts.md, PR-01 .. PR-04). A step that is not listed
// still draws its vector scene (./scenes.tsx), which stays in the code as the fallback.
export const SCENE_IMAGES: ReadonlySet<number> = new Set<number>([0, 1, 2, 3])
export const sceneImage = (i: number): string => `/process/scene-0${i + 1}.webp`
export const sceneImageSmall = (i: number): string => `/process/scene-0${i + 1}-800.webp`
