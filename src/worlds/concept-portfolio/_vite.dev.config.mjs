// DEV-ONLY config for testing the Slide Deck world while other agents edit the rest of the site (delete before shipping).
// It is the repo's Vite setup with one change: the file watcher ignores everything under src/ except this world, so another
// agent's edit never full-reloads the page under test. Run from the repo root:
//   npx vite --config src/worlds/concept-portfolio/_vite.dev.config.mjs --port 5218 --strictPort --host 127.0.0.1
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const mine = /\/src\/worlds\/(ConceptPortfolioWorld\.tsx|concept-portfolio(\/|$))/

export default defineConfig({
  root,
  plugins: [react()],
  base: '/',
  cacheDir: 'node_modules/.vite-5218',
  resolve: { alias: { '@': path.resolve(root, 'src') } },
  server: {
    watch: {
      ignored: (p) => {
        const n = p.replace(/\\/g, '/')
        if (n.includes('/node_modules/') || n.includes('/.git/') || n.includes('/dist/')) return true
        if (!n.includes('/src/')) return n.endsWith('/index.html') || n.includes('/docs/') || n.includes('/art-src/')
        if (mine.test(n)) return false
        // the folders on the way down to this world stay watched, every other file and folder under src/ is ignored
        return !/\/src(\/worlds)?\/?$/.test(n)
      },
    },
  },
})
