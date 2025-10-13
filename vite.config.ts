import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- CONFIGURACIÓN AÑADIDA DEL PROXY ---
  server: {
    proxy: {
      // Si la petición comienza con /api, la redirige
      '/api': {
        // La URL de tu backend de Spring Boot
        target: 'http://localhost:8081', 
        // Importante para el correcto manejo de hosts
        changeOrigin: true, 
        // Opcional: Reemplaza la URL en la consola para una depuración más limpia
        secure: false, 
      },
    },
  },
  // ----------------------------------------
})
