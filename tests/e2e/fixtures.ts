import { test as base } from "@playwright/test";

/**
 * Shared quiet setup and real runtime-error collection for browser journeys.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    const errors: string[] = [];
    await page.addInitScript(() => {
      if (location.hostname === "127.0.0.1") {
        localStorage.setItem(
          "game-settings",
          JSON.stringify({
            musicVolume: 0,
            sfxVolume: 0,
            difficulty: "Normal",
          }),
        );
      }
    });
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use(errors);
  },
});
