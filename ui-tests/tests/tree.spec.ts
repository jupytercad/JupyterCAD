import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('Tree UI test', () => {
  test.use({
    mockSettings: {
      '@jupyterlab/apputils-extension:notification': {
        fetchNews: 'false'
      }
    }
  });

  let errors = 0;
  test.beforeEach(async ({ page, request }) => {
    page.setViewportSize({ width: 1920, height: 1080 });
    page.on('console', message => {
      if (message.type() === 'error') {
        errors += 1;
      }
    });

    const content = galata.newContentsHelper(request);
    await content.deleteDirectory('/examples');
    await content.uploadDirectory(
      path.resolve(__dirname, '../../examples'),
      '/examples'
    );
  });

  test.afterEach(async ({ page }) => {
    errors = 0;
  });

  test(`Should display the object tree`, async ({ page }) => {
    await page.goto();

    const fileName = 'example1.FCStd';
    const fullPath = `examples/${fileName}`;
    await page.notebook.openByPath(fullPath);
    await page.notebook.activate(fullPath);
    await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

    // Close the property panel
    await page
      .getByRole('tablist', { name: 'alternate sidebar' })
      .getByRole('tab', { name: 'JupyterCad Control Panel' })
      .click();

    await page
      .locator('[data-test-id="react-tree-root"] div.jpcad-control-panel-tree')
      .nth(0)
      .click();
    await page
      .locator('[data-test-id="react-tree-root"] div.jpcad-control-panel-tree')
      .nth(2)
      .click();
    await page
      .locator('[data-test-id="react-tree-root"] div.jpcad-control-panel-tree')
      .nth(4)
      .click();

    expect(errors).toBe(0);
    const tree = await page.getByRole('region', {
      name: 'Objects tree Section'
    });
    if (tree) {
      expect(await tree.screenshot()).toMatchSnapshot({
        name: `Tree-Display-${fileName}.png`
      });
    }
  });
});
