import { type Locator, type Page } from '@playwright/test';

export type TodoFilter = 'All' | 'Active' | 'Completed';

/**
 * Page object for https://demo.playwright.dev/todomvc
 * Only user-facing locators are used (role, placeholder, text) - no CSS or XPath.
 */
export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly counter: Locator;
  readonly clearCompletedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    // Todo rows are the list items that contain a checkbox. This excludes the
    // All / Active / Completed filter links, which are list items too.
    this.todoItems = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    this.counter = page.getByText(/^\d+ items? left$/);
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/todomvc');
  }

  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(...texts: string[]): Promise<void> {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  /** A single todo row, matched by its exact text. */
  todo(text: string): Locator {
    return this.todoItems.filter({ has: this.page.getByText(text, { exact: true }) });
  }

  checkbox(text: string): Locator {
    return this.todo(text).getByRole('checkbox');
  }

  async complete(text: string): Promise<void> {
    await this.checkbox(text).check();
  }

  async editTodo(oldText: string, newText: string): Promise<void> {
    await this.todo(oldText).dblclick();
    const editBox = this.page.getByRole('textbox', { name: 'Edit' });
    await editBox.fill(newText);
    await editBox.press('Enter');
  }

  async deleteTodo(text: string): Promise<void> {
    const row = this.todo(text);
    // The delete button only becomes visible on hover.
    await row.hover();
    await row.getByRole('button').click();
  }

  async filterBy(filter: TodoFilter): Promise<void> {
    await this.page.getByRole('link', { name: filter, exact: true }).click();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }
}
