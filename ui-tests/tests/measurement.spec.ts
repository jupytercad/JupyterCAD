import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('Measurement Test', () => {
  test.beforeAll(async ({ request }) => {
    const content = galata.newContentsHelper(request);
    await content.deleteDirectory('/examples');
    await content.uploadDirectory(
      path.resolve(__dirname, '../../examples'),
      '/examples'
    );
  });

  let errors = 0;
  /**
   * Sets up the test environment before each test.
   * - Sets the viewport size.
   * - Listens for console errors and increments the error count.
   */
  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 1920, height: 1080 });
    page.on('console', message => {
      if (message.type() === 'error') {
        console.log('ERROR MSG', message.text());
        errors += 1;
      }
    });
  });

  /**
   * Resets the error count after each test.
   */
  test.afterEach(async () => {
    errors = 0;
  });

  test('Toggle measurement displays annotations', async ({ page }) => {
    await page.goto();

    const fullPath = 'examples/test.jcad';
    await page.notebook.openByPath(fullPath);
    await page.notebook.activate(fullPath);
    await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

    // Ensure left sidebar (object tree) is open and right sidebar is closed
    await page.sidebar.open('left');
    await page.sidebar.close('right');
    await page.waitForTimeout(500);

    // Select 'box2' in the tree so measurement has a selection to measure
    await page
      .locator('[data-test-id="react-tree-root"]')
      .getByText('box2')
      .click();

    // Make sure any modal is dismissed
    if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
      await page.getByRole('button', { name: 'Ok' }).click();
    }

    // Enable measurement after selection
    await page.getByTitle('Toggle Measurement').click();

    // Wait for measurement labels to appear in the label renderer
    const label = page.locator('.measurement-label');
    await label.first().waitFor({ state: 'visible' });

    expect(errors).toBe(0);

    const main = await page.$('#jp-main-split-panel');
    if (main) {
      expect(await main.screenshot()).toMatchSnapshot({
        name: `Measurement-On-test.jcad.png`,
        maxDiffPixelRatio: 0.01
      });
    }

    // Disable measurement and ensure labels disappear
    await page.getByTitle('Toggle Measurement').click();
    await expect(page.locator('.measurement-label')).toHaveCount(0, {
      timeout: 1000
    });
  });
});
