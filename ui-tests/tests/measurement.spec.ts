import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('Measurement test', () => {
  test.beforeEach(async ({ page, request }) => {
    page.setViewportSize({ width: 1920, height: 1080 });
    const content = galata.newContentsHelper(request);
    await content.deleteDirectory('/examples');
    await content.uploadDirectory(
      path.resolve(__dirname, '../../examples'),
      '/examples'
    );
  });

  test('Should display measurement on object selection', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto();

    const fileName = 'test.jcad';
    const fullPath = `examples/${fileName}`;
    await page.notebook.openByPath(fullPath);
    await page.notebook.activate(fullPath);
    await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

    // Select 'box2' from the tree
    await page
      .locator('[data-test-id="react-tree-root"]')
      .getByText('box2')
      .click();

    // Check if the measurement labels are displayed
    const xLabel = page.locator('.measurement-label', {
      hasText: /X: \d+\.\d{2}/
    });
    const yLabel = page.locator('.measurement-label', {
      hasText: /Y: \d+\.\d{2}/
    });
    const zLabel = page.locator('.measurement-label', {
      hasText: /Z: \d+\.\d{2}/
    });

    await expect(xLabel).toBeVisible();
    await expect(yLabel).toBeVisible();
    await expect(zLabel).toBeVisible();

    // Deselect the object by clicking on the canvas
    await page.locator('canvas').click({
      position: { x: 10, y: 10 }
    });

    // Check if the measurement labels are hidden
    await expect(xLabel).toBeHidden();
    await expect(yLabel).toBeHidden();
    await expect(zLabel).toBeHidden();
  });
});
