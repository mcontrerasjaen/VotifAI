import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Inyecta el motor de Tailwind v4 de forma nativa
  ],
  server: {
    host: '0.0.0.0',    // Abre la escucha en el contenedor Linux
    port: 5173,
    strictPort: true,
    allowedHosts: true, // Evita los bloqueos de host de GitHub
  }
})