import { defineConfig, devices } from "@playwright/test";

/**
@public Consumed by Playwright's configuration loader.
*/
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173/ptype/",
    trace: "retain-on-failure",
    launchOptions: {
      args: [
        "--mute-audio",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  projects: [
    {
      name: "desktop",
      testMatch: "**/smoke.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "narrow",
      testMatch: "**/smoke.spec.ts",
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: "development",
      testMatch: "**/development.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:4184/ptype/",
      },
    },
  ],
  webServer: [
    {
      command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
      url: "http://127.0.0.1:4173/ptype/",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4184 --strictPort",
      url: "http://127.0.0.1:4184/ptype/",
      reuseExistingServer: false,
    },
  ],
});
