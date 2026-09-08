import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'apple-touch-icon.png',
        'icons.svg',
      ],
      manifest: {
        id: '/',
        name: 'CMMS - Gestão de Frotas & Máquinas Agrícolas',
        short_name: 'CMMS',
        description: 'Gestão de Manutenção de Máquinas Agrícolas e Frotas 100% Offline',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        theme_color: '#1B5E20',
        background_color: '#1B5E20',
        categories: ['productivity', 'business', 'utilities'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'document' ||
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-static-cache',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
