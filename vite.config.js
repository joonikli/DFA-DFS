import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Two pages: the manager app (index.html) and the volunteer portal (volunteer.html)
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        volunteer: resolve(__dirname, 'volunteer.html'),
      },
    },
  },
})
