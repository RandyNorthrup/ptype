import { expect } from "@playwright/test";
import { test } from "./fixtures";

test("development page loads with a nonce-authorized React preamble", async ({
  page,
  errors,
}) => {
  await page.goto("./");
  expect(await page.locator("script[nonce]").count()).toBeGreaterThan(0);
  const nonce = await page
    .locator("script[nonce]")
    .first()
    .evaluate((script) => {
      if (!(script instanceof HTMLScriptElement))
        throw new Error("Expected a script element");
      return script.nonce;
    });
  expect(nonce).not.toBe("");
  await expect(
    page.locator('meta[http-equiv="Content-Security-Policy"]'),
  ).toHaveAttribute("content", expect.stringContaining(`'nonce-${nonce}'`));
  const nextDocument = await page.request.get("index.html");
  expect(nextDocument.ok()).toBe(true);
  expect(nextDocument.headers()["cache-control"]).toBe("no-store");
  expect(await nextDocument.text()).not.toContain(nonce);
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "About", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "P-Type" })).toContainText(
    "Version 2.0.1",
  );
  expect(errors).toEqual([]);
});
