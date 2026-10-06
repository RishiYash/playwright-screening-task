import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Fail the CI build if someone accidentally leaves test.only in the code.
  forbidOnly: isCI,
  // Retries only on CI, so flakiness is visible locally instead of hidden.
  retries: isCI ? 2 : 0,
  // A small, fixed number of workers keeps parallel runs stable on laptops
  // and CI runners, and avoids overloading the public demo sites.
  workers: 2,
  // Extra headroom for slower networks; web-first assertions still finish
  // as soon as the condition is met.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : [['html', { open: 'never' }], ['list']],
  use: {
    // TodoMVC is the default target; the docs spec overrides this with test.use().
    baseURL: 'https://demo.playwright.dev',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});