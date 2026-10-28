import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Several dev servers run side by side while the site is built in parallel: give each its own
// dependency-optimizer cache (keyed by --port) so they never clobber each other's pre-bundles.
const portFlag = process.argv.indexOf('--port')
const port = portFlag > -1 ? process.argv[portFlag + 1] : 'default'

// base '/' works for a <username>.github.io user-site deploy;
// change to '/repo-name/' if this ever moves to a project-page repo.
export default defineConfig({
  plugins: [react()],
  base: '/',
  cacheDir: `node_modules/.vite-${port}`,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
