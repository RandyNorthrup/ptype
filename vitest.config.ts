import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
@public Consumed by Vitest's configuration loader.
*/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^three$/,
        replacement: fileURLToPath(
          new URL("node_modules/three/build/three.cjs", import.meta.url),
        ),
      },
    ],
  },
  test: {
    coverage: {
      // WebGL render loops are verified through production browser smoke tests;
      // jsdom coverage measures the application and domain behavior it can execute.
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/components/CameraController.tsx",
        "src/components/GameCanvas.tsx",
        "src/components/LaserEffect.tsx",
        "src/components/LaserTargetHelper.tsx",
        "src/components/SpaceScene.tsx",
        "src/entities/**/*.tsx",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      thresholds: {
        branches: 82,
        functions: 97,
        lines: 95,
        statements: 94,
      },
    },
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["tests/setup.ts"],
  },
});
