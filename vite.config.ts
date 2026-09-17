import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/' works for a <username>.github.io user-site deploy;
// change to '/repo-name/' if this ever moves to a project-page repo.
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
