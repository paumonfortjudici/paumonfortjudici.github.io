import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Several dev servers run side by side while the site is built in parallel: give each its own
// dependency-optimizer cache (keyed by --port) so they never clobber each other's pre-bundles.
const portFlag = process.argv.indexOf('--port')
const port = portFlag > -1 ? process.argv[portFlag + 1] : 'default'

// base '/' works for a <username>.github.io user-site deploy;
// change to '/repo-name/' if this ever moves to a project-page repo.
// Every public/ file the app asks for (images above all) carries ?v=<build id> (src/lib/asset.ts): GitHub Pages lets browsers keep a file for ten minutes
// under its plain URL, so after a deploy a visitor could see the new picture in one place and the old one in another (a different file per zoom level).
// The id is the commit that CI builds; locally it is the time the build started.
const BUILD_ID = (process.env.GITHUB_SHA ?? '').slice(0, 8) || Date.now().toString(36)

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  plugins: [react()],
  base: '/',
  cacheDir: `node_modules/.vite-${port}`,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
