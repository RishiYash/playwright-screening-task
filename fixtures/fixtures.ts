import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

type Fixtures = {
  todoPage: TodoPage;
};

/**
 * Custom test with a ready-to-use TodoPage.
 * Each test gets a fresh browser context (and so empty localStorage),
 * which keeps tests independent and safe to run in parallel.
 */
export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

export { expect } from '@playwright/test';
