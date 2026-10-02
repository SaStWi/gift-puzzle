import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        puzzle: resolve(import.meta.dirname, 'games/puzzle/index.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
