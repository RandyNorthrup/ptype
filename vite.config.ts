import { defineConfig, type Plugin, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const DEVELOPMENT_NONCE_PLACEHOLDER = "__PTYPE_DEV_NONCE__";
const NONCE_BYTE_LENGTH = 16;

// https://vitejs.dev/config/
/**
@public Consumed by Vite's configuration loader.
*/
export default defineConfig(({ command, isPreview }): UserConfig => {
  const isDevelopment = command === "serve" && !isPreview;
  const developmentPolicy: Plugin = {
    name: "ptype-development-csp",
    apply: "serve",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html.replace(
          /script-src [^";]+/u,
          (directive) =>
            `${directive} 'nonce-${DEVELOPMENT_NONCE_PLACEHOLDER}'`,
        );
      },
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = decodeURI(request.url?.split("?", 1)[0] ?? "");
        const base = server.config.base;
        if (pathname !== base && pathname !== `${base}index.html`) {
          next();
          return;
        }
        // Reuse Vite's complete HTML pipeline, then replace its nonce placeholder
        // after every injected script/style tag exists. Never cache this response.
        void (async () => {
          const source = await readFile(
            path.join(projectRoot, "index.html"),
            "utf8",
          );
          const transformed = await server.transformIndexHtml(
            "/index.html",
            source,
            request.url,
          );
          const nonce = randomBytes(NONCE_BYTE_LENGTH).toString("base64");
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(
            transformed.replaceAll(DEVELOPMENT_NONCE_PLACEHOLDER, () => nonce),
          );
        })().catch(next);
      });
    },
  };
  return {
    appType: "mpa",
    base: "/ptype/",
    html: isDevelopment ? { cspNonce: DEVELOPMENT_NONCE_PLACEHOLDER } : {},
    plugins: [
      react(),
      isDevelopment && developmentPolicy,
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        manifest: {
          name: "P-Type: 3D Typing Game",
          short_name: "P-Type",
          description:
            "Defend against enemy spaceships by typing words in this immersive 3D typing game",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "fullscreen",
          orientation: "landscape",
          start_url: ".",
          scope: ".",
          icons: [
            {
              src: "icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,woff2,ttf,yaml,json}"],
          globIgnores: ["**/node_modules/**/*", "**/assets/models/**/*"],
          maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30MB for large assets
          navigateFallback: null, // Disable for SPA
          dontCacheBustURLsMatching: /\.(png|jpg|jpeg|svg|gif|webp)$/,
          // Reduce console noise in production
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            // Cache GLB models
            {
              urlPattern: /\.glb$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "3d-models-cache",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
                },
              },
            },
            // Cache fonts
            {
              urlPattern: /\.(woff2?|ttf)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
            // Cache images
            {
              urlPattern: /\.(png|jpg|jpeg|svg|webp)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
                },
              },
            },
            // Cache data files
            {
              urlPattern: /\.(yaml|json)$/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "data-cache",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "./src"),
        "@engine": path.resolve(projectRoot, "./src/engine"),
        "@entities": path.resolve(projectRoot, "./src/entities"),
        "@components": path.resolve(projectRoot, "./src/components"),
        "@store": path.resolve(projectRoot, "./src/store"),
        "@utils": path.resolve(projectRoot, "./src/utils"),
        "@api": path.resolve(projectRoot, "./src/api"),
      },
    },
    publicDir: "./public",
    build: {
      outDir: "./dist",
      emptyOutDir: true,
      sourcemap: false, // Disable in production for smaller bundles
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: ["log", "debug", "info"],
          drop_debugger: true,
          pure_funcs: ["console.log", "console.debug", "console.info"],
          passes: 2, // More aggressive compression
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false, // Remove all comments
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Three.js core
            if (id.includes("node_modules/three/")) {
              return "three-core";
            }
            // React Three ecosystem
            if (id.includes("@react-three/fiber")) {
              return "react-three-fiber";
            }
            // React core
            if (id.includes("react-dom")) {
              return "react-dom";
            }
            if (
              id.includes("react") &&
              !id.includes("react-dom") &&
              !id.includes("@react-three")
            ) {
              return "react";
            }
            // Application modules use their natural dynamic-import boundaries.
            return;
          },
          // Better file naming for caching
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      chunkSizeWarningLimit: 1000, // Increase limit for game assets
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
      reportCompressedSize: false, // Faster builds
      target: "es2020", // Modern browsers only
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
      ],
    },
    server: {
      port: 5173,
      open: false,
      hmr: {
        overlay: true,
      },
    },
  };
});
