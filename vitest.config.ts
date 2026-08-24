import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      // WebGL render loops are verified through production browser smoke tests;
      // jsdom coverage measures the application and domain behavior it can execute.
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/utils/testIds.ts",
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
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["tests/setup.ts"],
  },
});
