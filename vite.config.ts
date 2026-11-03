import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': o usuário decide quando carregar a nova versão (não troca no meio de um orçamento)
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'OrçaFácil — Orçamentos para Autônomos',
        short_name: 'OrçaFácil',
        description: 'Monte orçamentos profissionais mesmo sem internet.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f1f5f9',
        theme_color: '#2563eb',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache do app shell: tudo que o build gera. Os DADOS ficam no IndexedDB,
        // não passam pelo Service Worker.
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        // Navegação offline sempre cai no index.html (app de página única)
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})