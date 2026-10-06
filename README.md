# Playwright Screening Task

**Author:** Risni Weerasooriya ([RishiYash](https://github.com/RishiYash)) · risniyash12@gmail.com

[![Playwright Tests](https://github.com/RishiYash/playwright-screening-task/actions/workflows/playwright.yml/badge.svg)](https://github.com/RishiYash/playwright-screening-task/actions/workflows/playwright.yml)

End-to-end tests written with **Playwright Test + TypeScript** for:

- the TodoMVC demo app: https://demo.playwright.dev/todomvc
- the Playwright docs site: https://playwright.dev

**Repository:** https://github.com/RishiYash/playwright-screening-task  
**CI runs:** https://github.com/RishiYash/playwright-screening-task/actions/workflows/playwright.yml

## Requirements

- Node.js 18 or newer (LTS recommended)

## Install

```bash
git clone https://github.com/RishiYash/playwright-screening-task.git
cd playwright-screening-task
npm ci                       # or: npm install
npx playwright install       # downloads Chromium and Firefox
```

## Run

| Command | What it does |
| --- | --- |
| `npm test` | Run all tests on Chromium and Firefox (headless, in parallel) |
| `npm run test:headed` | Run all tests with a visible browser |
| `npm run test:chromium` / `npm run test:firefox` | Run a single browser project |
| `npm run test:ui` | Open Playwright's UI mode for debugging |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | Type-check the project with `tsc` |

## Project structure

```
.github/workflows/playwright.yml   CI: install, type-check, test, upload HTML report
fixtures/fixtures.ts               Custom test (test.extend) that provides the TodoPage
pages/TodoPage.ts                  Page object for TodoMVC
test-data/todos.ts                 Data for the data-driven test
tests/todo/todo.spec.ts            TodoMVC tests (Part 2)
tests/docs/docs.spec.ts            playwright.dev tests (Part 3)
playwright.config.ts               baseURL, Chromium + Firefox projects, retries, trace, reporter
```

## Design decisions

- **Page object through a fixture.** Tests ask for `todoPage` instead of building it themselves. The fixture also opens the page, so each test starts from a known state with no setup boilerplate.
- **User-facing locators only.** Everything uses `getByRole`, `getByPlaceholder` or `getByText`, so tests break when behaviour changes, not when CSS class names do. Todo rows are found as list items that contain a checkbox, which separates them from the filter links (also list items).
- **No hard waits.** All waiting is done by Playwright's auto-waiting actions and web-first assertions (`toHaveText`, `toBeVisible`, `toHaveCount`, ...), which retry until the condition is met or time out.
- **Independent, parallel tests.** Each test gets a fresh browser context, so localStorage (where TodoMVC keeps its data) is never shared. `fullyParallel: true` is enabled.
- **Retries only on CI** (`retries: 2`), with `trace: 'on-first-retry'` so any retried failure leaves a full trace in the HTML report. Locally, retries are 0 so flakiness is not hidden.
- **Two hosts, one config.** `baseURL` points to the TodoMVC demo; the docs spec overrides it with `test.use({ baseURL: 'https://playwright.dev' })`.
- **Network control.** The `page.route` test aborts every image request on playwright.dev and asserts that the page still renders and that images were actually intercepted.

## How I would deal with a flaky test

First I reproduce it, for example with `npx playwright test <file> --repeat-each=20 --workers=4`, and open the trace from the failed attempt to see exactly what the page looked like at the moment of failure. Most flakiness comes from timing assumptions, shared state between tests, or locators that match more than one element, so I fix the root cause: replace manual waits with web-first assertions, isolate the test's data, or make the locator more specific. If the cause is outside our control (for example, an unstable third-party service), I mock it with `page.route`. Retries and `test.fixme()` quarantine are only a temporary safety net with a tracked ticket, never the fix.
