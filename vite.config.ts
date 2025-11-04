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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,yaml}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30MB for large assets
        navigateFallback: null, // Disable for SPA
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
          },
          // Cache GLB models
          {
            urlPattern: /\.glb$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: '3d-models-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              }
            }
          },
          // Cache fonts
          {
            urlPattern: /\.(woff2?|ttf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Cache images
          {
            urlPattern: /\.(png|jpg|jpeg|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              }
            }
          },
          // Cache data files
          {
            urlPattern: /\.(yaml|json)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'data-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@components': path.resolve(__dirname, './src/components'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api')
    }
  },
  publicDir: './public',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: false, // Disable in production for smaller bundles
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info', 'console.warn'],
        passes: 2 // More aggressive compression
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false // Remove all comments
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Three.js core
          if (id.includes('node_modules/three/')) {
            return 'three-core';
          }
          // React Three ecosystem
          if (id.includes('@react-three/fiber')) {
            return 'react-three-fiber';
          }
          if (id.includes('@react-three/drei')) {
            return 'react-three-drei';
          }
          // React core
          if (id.includes('react-dom')) {
            return 'react-dom';
          }
          if (id.includes('react') && !id.includes('react-dom') && !id.includes('@react-three')) {
            return 'react';
          }
          // Zustand
          if (id.includes('zustand')) {
            return 'zustand';
          }
          // Framer Motion
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }
          // Game components
          if (id.includes('/src/components/')) {
            return 'components';
          }
          // Game entities
          if (id.includes('/src/entities/')) {
            return 'entities';
          }
          // Utilities
          if (id.includes('/src/utils/')) {
            return 'utils';
          }
        },
        // Better file naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit for game assets
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    reportCompressedSize: false, // Faster builds
    target: 'es2020' // Modern browsers only
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'zustand'
    ],
    exclude: ['@vercel/postgres']
  },
  server: {
    port: 5173,
    open: true,
    hmr: {
      overlay: true
    }
  }
});
