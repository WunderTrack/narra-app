import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild' // Forzamos el uso de esbuild para evitar errores de CSS con Tailwind
  }
})