import { test, expect } from "@playwright/test";

test("production menu, focus, responsive layout, and game pause journeys", async ({
  page,
}, testInfo) => {
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
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("canvas").first()).toBeVisible();
  const settings = page.getByRole("button", { name: "Settings", exact: true });
  await settings.click();
  const dialog = page.getByRole("dialog", { name: /settings/i });
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 15; index++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(settings).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("menu.png") });

  for (const mode of ["Normal", "Python"]) {
    await page.getByTestId("mode-selector-button").click();
    await page.getByRole("option", { name: mode, exact: true }).click();
    await page.getByRole("button", { name: "NEW GAME", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "NEW GAME", exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    const paused = page.getByRole("dialog", { name: /paused/i });
    await expect(paused).toBeVisible();
    await paused.getByRole("button", { name: /main menu/i }).click();
    await expect(
      page.getByRole("dialog", { name: "Quit to Main Menu?" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Keep Playing", exact: true })
      .click();
    await expect(paused).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await paused.getByRole("button", { name: /main menu/i }).click();
    await page
      .getByRole("button", { name: "Quit to Main Menu", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "NEW GAME", exact: true }),
    ).toBeVisible();
  }
  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    name: "P-Type: 3D Typing Game",
  });
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length;
      }),
    )
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
