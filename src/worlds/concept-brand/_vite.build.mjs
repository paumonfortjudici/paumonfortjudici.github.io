// DEV-ONLY scratch build config (delete before shipping): the repo setup, output to the scratchpad, public/ not copied.
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = 'C:/Users/User/Documents/Portofolio'
export default defineConfig({
  root,
  plugins: [react()],
  base: '/',
  cacheDir: 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/tools-gotet/.vite-cache-gotet',
  resolve: { alias: { '@': path.resolve(root, 'src') } },
  build: {
    outDir: 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Documents-Portofolio/0908f779-4789-499a-9f74-ecb97a4d3b2d/scratchpad/dist-gotet',
    emptyOutDir: true,
    copyPublicDir: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 2000,
  },
})
