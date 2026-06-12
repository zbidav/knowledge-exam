import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes all asset paths relative, so the built site works on GitHub
// Pages under ANY repo name (e.g. https://<user>.github.io/<repo>/) without us
// hard-coding the repo name. This app keeps all navigation in React state (no
// router / no deep links), so relative paths are safe here.
export default defineConfig({
  plugins: [react()],
  base: './',
})
