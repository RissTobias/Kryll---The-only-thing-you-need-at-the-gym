import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Repo name on GitHub Pages — used as the base path for the built site.
const REPO = 'Kryll---The-only-thing-you-need-at-the-gym'

export default defineConfig(({ command }) => ({
  // In dev we serve from /, in production from /<repo>/ for GH Pages.
  base: command === 'build' ? `/${REPO}/` : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kryll',
        short_name: 'Kryll',
        description: 'Track your gym workouts',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
}))
