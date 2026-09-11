import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Tudo que o front pedir em /api vai para o backend Express em :3000.
      // Assim o código nunca precisa saber a porta do backend, e não há
      // problema de CORS em desenvolvimento.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
