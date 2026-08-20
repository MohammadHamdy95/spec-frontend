import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Inner-loop dev: `npm run dev` plus a locally running spec-backend.
    // Same-origin /v1 calls proxy to Spring on 8080 — no CORS involved.
    proxy: {
      '/v1': 'http://localhost:8080',
    },
  },
})
