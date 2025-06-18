// vite.config.js (o vite.config.mjs)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// El nombre exacto de tu repositorio de GitHub: 'my-cow-app'
const REPO_NAME = 'my-cow-app';

// https://vitejs.dev/config/
export default defineConfig({
  // --- ESTO ES CLAVE para GitHub Pages ---
  base: `/${REPO_NAME}/`, // Esto resultará en '/my-cow-app/'
  // ------------------------------------

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Inventario de Vacas',
        short_name: 'VacasApp',
        description: 'Aplicación para llevar el inventario de vacas',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'granja.png', // Asegúrate que estas imágenes estén en tu carpeta `public`
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'vaca.png', // Asegúrate que estas imágenes estén en tu carpeta `public`
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'granja2.png', // Asegúrate que estas imágenes estén en tu carpeta `public`
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'vaca.png', // Asegúrate que estas imágenes estén en tu carpeta `public`
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist', // Por defecto ya es 'dist', pero lo ponemos explícitamente
  },
});