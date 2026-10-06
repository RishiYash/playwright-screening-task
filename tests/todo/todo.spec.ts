import { test, expect } from '../../fixtures/fixtures';
import { BULK_TODOS } from '../../test-data/todos';

test.describe('TodoMVC', () => {
  test('adds three todos and shows them in the list', async ({ todoPage }) => {
    await todoPage.addTodos('Buy milk', 'Walk the dog', 'Write tests');

    await expect(todoPage.todoItems).toHaveText(['Buy milk', 'Walk the dog', 'Write tests']);
    await expect(todoPage.counter).toHaveText('3 items left');
  });

  test('marking one todo complete shows "2 items left"', async ({ todoPage }) => {
    await todoPage.addTodos('Buy milk', 'Walk the dog', 'Write tests');

    await todoPage.complete('Walk the dog');

    await expect(todoPage.checkbox('Walk the dog')).toBeChecked();
    await expect(todoPage.counter).toHaveText('2 items left');
  });

  test('Active and Completed filters show the correct items', async ({ todoPage, page }) => {
    await todoPage.addTodos('Buy milk', 'Walk the dog', 'Write tests');
    await todoPage.complete('Walk the dog');

    await todoPage.filterBy('Active');
    await expect(page).toHaveURL(/#\/active$/);
    await expect(todoPage.todoItems).toHaveText(['Buy milk', 'Write tests']);

    await todoPage.filterBy('Completed');
    await expect(page).toHaveURL(/#\/completed$/);
    await expect(todoPage.todoItems).toHaveText(['Walk the dog']);

    await todoPage.filterBy('All');
    await expect(todoPage.todoItems).toHaveText(['Buy milk', 'Walk the dog', 'Write tests']);
  });

  test('edits a todo by double-clicking it', async ({ todoPage }) => {
    await todoPage.addTodos('Buy milk', 'Walk the dog');

    await todoPage.editTodo('Walk the dog', 'Walk the cat');

    await expect(todoPage.todoItems).toHaveText(['Buy milk', 'Walk the cat']);
    await expect(todoPage.todo('Walk the dog')).toHaveCount(0);
  });

  test('deletes a todo', async ({ todoPage }) => {
    await todoPage.addTodos('Buy milk', 'Walk the dog', 'Write tests');

    await todoPage.deleteTodo('Walk the dog');

    await expect(todoPage.todo('Walk the dog')).toHaveCount(0);
    await expect(todoPage.todoItems).toHaveText(['Buy milk', 'Write tests']);
    await expect(todoPage.counter).toHaveText('2 items left');
  });

  test('"Clear completed" removes only the completed items', async ({ todoPage }) => {
    await todoPage.addTodos('Buy milk', 'Walk the dog', 'Write tests');
    await todoPage.complete('Buy milk');
    await todoPage.complete('Write tests');

    await todoPage.clearCompleted();

    await expect(todoPage.todoItems).toHaveText(['Walk the dog']);
    await expect(todoPage.checkbox('Walk the dog')).not.toBeChecked();
    await expect(todoPage.clearCompletedButton).toBeHidden();
  });

  test('todos are still there after a reload', async ({ todoPage, page }) => {
    await todoPage.addTodos('Buy milk', 'Walk the dog');
    await todoPage.complete('Buy milk');

    await page.reload();

    await expect(todoPage.todoItems).toHaveText(['Buy milk', 'Walk the dog']);
    await expect(todoPage.checkbox('Buy milk')).toBeChecked();
    await expect(todoPage.counter).toHaveText('1 item left');
  });

  test('empty or whitespace-only todos are not added', async ({ todoPage }) => {
    await todoPage.addTodo('');
    await todoPage.addTodo('    ');

    await expect(todoPage.todoItems).toHaveCount(0);

    // Sanity check: the input still works for a real todo.
    await todoPage.addTodo('Real todo');
    await expect(todoPage.todoItems).toHaveText(['Real todo']);
  });

  test('adds several todos from an array (data-driven)', async ({ todoPage }) => {
    await todoPage.addTodos(...BULK_TODOS);

    await expect(todoPage.todoItems).toHaveText([...BULK_TODOS]);
    await expect(todoPage.counter).toHaveText(`${BULK_TODOS.length} items left`);
  });
});
