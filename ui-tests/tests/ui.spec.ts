import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('UI Test', () => {
  const fileList = [
    'box2.FCStd',
    'box4.FCStd',
    'common.FCStd',
    'cut.FCStd',
    'test.jcad'
  ];

  test.beforeAll(async ({ request }) => {
    const content = galata.newContentsHelper(request);
    await content.uploadDirectory(
      path.resolve(__dirname, '../../examples'),
      '/'
    );
  });

  test.describe('Extension activation test', () => {
    test('should emit an activation console message', async ({
      page,
      request
    }) => {
      const logs: string[] = [];

      page.on('console', message => {
        logs.push(message.text());
      });

      await page.goto();

      expect(
        logs.filter(s => s === 'JupyterLab extension jupytercad is activated!')
      ).toHaveLength(1);
      expect(logs.filter(s => s === 'Initializing OCC...')).toHaveLength(1);
      expect(logs.filter(s => s === 'Done!')).toHaveLength(1);
    });
  });

  test.describe('File rendering test', () => {
    let errors = 0;
    test.beforeEach(async ({ page }) => {
      page.setViewportSize({ width: 1920, height: 1080 });
      page.on('console', message => {
        if (message.type() === 'error') {
          errors += 1;
        }
      });
    });

    test.afterEach(async ({ page }) => {
      errors = 0;
    });
    for (const file of fileList) {
      test(`Should be able to render ${file} without error`, async ({
        page
      }) => {
        await page.goto();
        const fullPath = `examples/${file}`;
        await page.notebook.openByPath(fullPath);
        await page.notebook.activate(fullPath);
        await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });
        const main = await page.$('#jp-main-split-panel');
        expect(errors).toBe(0);
        if (main) {
          expect(await main.screenshot()).toMatchSnapshot();
        }
      });
    }
  });

  test.describe('File operator test', () => {
    let errors = 0;
    test.beforeEach(async ({ page }) => {
      page.setViewportSize({ width: 1920, height: 1080 });
      page.on('console', message => {
        if (message.type() === 'error') {
          errors += 1;
        }
      });
    });

    test.afterEach(async ({ page }) => {
      errors = 0;
    });

    test(`Should be able to add object to scene`, async ({ page }) => {
      await page.goto();

      const fileName = 'box3.FCStd';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });
      const btn = await page.locator('button.jp-ToolbarButtonComponent', {
        hasText: 'BOX'
      });
      await btn.click();
      const nameInput = await page.locator(
        'input[id^="id-jp-schemaform"][label="Name"]'
      );
      nameInput.fill('Foo');
      const accept = await page.locator('div.jp-Dialog-buttonLabel', {
        hasText: 'Submit'
      });
      accept.click();

      expect(errors).toBe(0);
      const main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot();
      }
    });

    test(`Should be able to remove objec`, async ({ page }) => {
      await page.goto();

      const fileName = 'box4.FCStd';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Cut')
        .click();
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByRole('button')
        .nth(1)
        .click();
      expect(errors).toBe(0);
      const main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot();
      }
    });

    test(`Should be able to edit object`, async ({ page }) => {
      await page.goto();

      const fileName = 'box5.FCStd';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('myBox')
        .click();
      await page.getByText('Shape').click();
      await page.getByLabel('Height*').click();
      await page.getByLabel('Height*').fill('32');
      await page.getByRole('button', { name: 'Submit' }).click();

      expect(errors).toBe(0);
      const main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot();
      }
    });
  });
});
