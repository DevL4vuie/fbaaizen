import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// IMPORTANT: If deploying to GitHub Pages at https://<user>.github.io/<repo-name>/
// set `base` below to '/<repo-name>/'. If deploying to a custom domain, use '/'.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
})
