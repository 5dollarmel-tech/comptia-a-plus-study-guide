import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from https://<username>.github.io/<repo-name>/
// so the base path MUST match the repo name exactly, or all assets 404 and you
// get a blank white page. Update REPO_NAME below to match your actual GitHub
// repository name if you rename it.
const REPO_NAME = 'comptia-a-plus-study-guide'

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
})
