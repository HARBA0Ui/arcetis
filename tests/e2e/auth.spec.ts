import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should navigate to login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/arcetis/i);
    await expect(page.locator("text=Sign In")).toBeVisible();
  });

  test("should show validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid email")).toBeVisible();
  });
});
