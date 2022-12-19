import { expect, test } from '@jupyterlab/galata';


test.use({ autoGoto: false });

test('should emit an activation console message', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });

  await page.goto();

  expect(
    logs.filter(s => s === 'JupyterLab extension jupytercad is actisvated!')
  ).toHaveLength(1);
});
