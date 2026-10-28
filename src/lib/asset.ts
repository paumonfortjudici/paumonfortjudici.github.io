// Prefix public/ paths with Vite's BASE_URL so the site also works when deployed under a sub-path.
export const asset = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
