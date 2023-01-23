import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('Sketcher test', () => {
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

  test(`Should open the sketcher dialog`, async ({ page }) => {
    await page.goto();

    const fileName = 'example_2D.FCStd';
    const fullPath = `examples/${fileName}`;
    await page.notebook.openByPath(fullPath);
    await page.notebook.activate(fullPath);
    await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

    // Close the property panel
    await page
      .getByRole('tablist', { name: 'alternate sidebar' })
      .getByRole('tab', { name: 'JupyterCad Control Panel' })
      .click();

    await page.getByRole('combobox').selectOption('SKETCHER');
    await page.getByRole('button', { name: 'NEW' }).click();
    const dialog = await page.$('.lm-Widget.lm-Panel.jp-Dialog-content');
    if (dialog) {
      expect(await dialog.screenshot()).toMatchSnapshot({
        name: `Sketcher-Display-${fileName}.png`
      });
    }
  });

  test(`Should draw a circle`, async ({ page }) => {
    await page.goto();

    const fileName = 'example_2D.FCStd';
    const fullPath = `examples/${fileName}`;
    await page.notebook.openByPath(fullPath);
    await page.notebook.activate(fullPath);
    await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

    // Close the property panel
    await page
      .getByRole('tablist', { name: 'alternate sidebar' })
      .getByRole('tab', { name: 'JupyterCad Control Panel' })
      .click();

    await page.getByRole('combobox').selectOption('SKETCHER');
    await page.getByRole('button', { name: 'NEW' }).click();
    await page.getByRole('button', { name: 'CIRCLE' }).click();
    await page
      .locator('canvas')
      .nth(3)
      .click({
        position: {
          x: 455,
          y: 209
        }
      });
    await page
      .locator('canvas')
      .nth(3)
      .click({
        position: {
          x: 455,
          y: 335
        }
      });
    const dialog = await page.$('.lm-Widget.lm-Panel.jp-Dialog-content');
    if (dialog) {
      expect(await dialog.screenshot()).toMatchSnapshot({
        name: `Sketcher-Circle-${fileName}.png`
      });
    }
  });
});
