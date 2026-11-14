import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Three pages: the router-based prototype (index.html), the manager app (manager.html)
// and the volunteer portal (volunteer.html)
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        manager: resolve(__dirname, 'manager.html'),
        volunteer: resolve(__dirname, 'volunteer.html'),
      },
    },
  },
})
