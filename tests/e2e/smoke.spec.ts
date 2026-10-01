import { expect } from "@playwright/test";
import { test } from "./fixtures";

test("production menu, focus, responsive layout, and game pause journeys", async ({
  page,
  errors,
}, testInfo) => {
  await page.goto("./");
  const scriptPolicy = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .evaluate(
      (meta) =>
        meta
          .getAttribute("content")
          ?.split(";")
          .find((directive) =>
            directive.trimStart().startsWith("script-src"),
          ) ?? "",
    );
  expect(scriptPolicy).toContain("'wasm-unsafe-eval'");
  expect(scriptPolicy).not.toMatch(/'unsafe-(?:eval|inline)'|'nonce-/u);
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

  await page.getByRole("button", { name: "About", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "P-Type" })).toContainText(
    "Version 2.0.1",
  );
  await page.keyboard.press("Escape");

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
  const manifest = await page.request.get("manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  const manifestData: unknown = await manifest.json();
  expect(manifestData).toMatchObject({
    name: "P-Type: 3D Typing Game",
    start_url: ".",
    scope: ".",
  });
  for (const icon of ["icons/icon-192x192.png", "icons/icon-512x512.png"]) {
    const response = await page.request.get(icon);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  for (const asset of [
    "assets/fonts/Orbitron-Regular.ttf",
    "assets/models/ships/player-ship.glb",
    "data/python_words.yaml",
    "data/trivia.yaml",
  ]) {
    const response = await page.request.get(asset);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).not.toContain("text/html");
  }
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.filter((registration) =>
          registration.scope.endsWith("/ptype/"),
        ).length;
      }),
    )
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
