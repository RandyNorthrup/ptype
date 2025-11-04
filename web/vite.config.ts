import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'P-Type: 3D Typing Game',
        short_name: 'P-Type',
        description: 'Defend against enemy spaceships by typing words in this immersive 3D typing game',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'fullscreen',
        orientation: 'landscape',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.hyperhuman\.deemos\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'rodin-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './web/src'),
      '@engine': path.resolve(__dirname, './web/src/engine'),
      '@entities': path.resolve(__dirname, './web/src/entities'),
      '@components': path.resolve(__dirname, './web/src/components'),
      '@store': path.resolve(__dirname, './web/src/store'),
      '@utils': path.resolve(__dirname, './web/src/utils'),
      '@api': path.resolve(__dirname, './web/src/api')
    }
  },
  root: './web',
  publicDir: '../web/public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'react-vendor': ['react', 'react-dom'],
          'game-components': [
            './web/src/components/GameCanvas',
            './web/src/components/CanvasHUD',
            './web/src/entities/EnemyShip',
            './web/src/entities/PlayerShip'
          ],
          'ui-components': [
            './web/src/components/MainMenu',
            './web/src/components/SettingsMenu',
            './web/src/components/PlayerStatsModal'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit for large chunks
    assetsInlineLimit: 4096 // Inline assets smaller than 4kb
  },
  server: {
    port: 3000,
    open: true
  }
});
