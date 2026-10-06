import { test, expect } from '@playwright/test';

// The docs site lives on a different host from the TodoMVC demo.
test.use({ baseURL: 'https://playwright.dev' });

test.describe('playwright.dev', () => {
  test('home page title contains "Playwright"', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Playwright/);
  });

  test('"Get started" opens the installation docs', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Get started' }).click();

    await expect(page).toHaveURL(/\/docs\/intro/);
    await expect(page.getByRole('heading', { name: 'Installation', level: 1 })).toBeVisible();
  });

  test('site search finds results for "locators"', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /search/i }).click();
    await page.getByRole('searchbox').fill('locators');

    const firstResult = page.getByRole('option').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText(/locator/i);
  });

  test('page still renders when all images are blocked (page.route)', async ({ page }) => {
    const blockedImages: string[] = [];

    await page.route('**/*', (route) => {
      if (route.request().resourceType() === 'image') {
        blockedImages.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });

    await page.goto('/');

    // Core content and navigation still work without images...
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    // ...and the route handler really intercepted image requests.
    expect(blockedImages.length).toBeGreaterThan(0);
  });
});
