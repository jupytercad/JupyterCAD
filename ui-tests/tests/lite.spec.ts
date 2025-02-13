import { expect, test, galata } from '@jupyterlab/galata';

test.describe('JupyterCAD Lite Tests', () => {
  test.beforeEach(({ page }) => {
    page.setDefaultTimeout(600000);

    page.on('console', message => {
      console.log('CONSOLE MSG ---', message.text());
    });
  });

  test.afterEach(async ({ page }) => {
    await page.close({ runBeforeUnload: true });
  });

  test('Render Tree', async ({ page }, testInfo) => {
    await page.goto('lite');

    const widget = await page.getByText('widgets');

    // Wait a bit for the theme to be applied
    await page.waitForTimeout(1000);

    expect(await page.screenshot()).toMatchSnapshot('jupytercad-lite-tree.png');

    await widget.click();

    expect(await page.screenshot()).toMatchSnapshot(
      'jupytercad-lite-subtree.png'
    );

    const goUp = await page.getByTitle('Jupyter Server Root').locator('svg');
    await goUp.click();

    expect(await page.screenshot()).toMatchSnapshot('jupytercad-lite-tree.png');
  });
});
