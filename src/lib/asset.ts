// Prefix public/ paths with Vite's BASE_URL so the site also works when deployed under a sub-path, and stamp them with the build id:
// the same file name under a new deploy is a new URL, so a browser (or a CDN edge) can never show a picture from an older deploy.
export const asset = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  return url.includes('?') ? url : `${url}?v=${__BUILD_ID__}`
}
