import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('UI Test', () => {
  const fileList = ['test.jcad', '3M_CONNECTOR.STEP', 'fan.stl'];

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

      expect(logs.filter(s => s === 'Initializing OCC...')).toHaveLength(1);
      expect(logs.filter(s => s === 'Done!')).toHaveLength(1);
    });
  });

  test.describe('File operations', () => {
    test.beforeAll(async ({ request }) => {
      const content = galata.newContentsHelper(request);
      await content.deleteDirectory('/examples');
      await content.uploadDirectory(
        path.resolve(__dirname, '../../examples'),
        '/examples'
      );
    });
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
        await page.waitForTimeout(1000);
        if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
          await page.getByRole('button', { name: 'Ok' }).click();
        }
        await page
          .getByRole('tablist', { name: 'main sidebar' })
          .getByRole('tab', { name: 'JupyterCad Control Panel' })
          .click();
        await page
          .getByRole('tablist', { name: 'alternate sidebar' })
          .getByRole('tab', { name: 'JupyterCad Control Panel' })
          .click();
        await page.waitForTimeout(1000);
        const main = await page.$('#jp-main-split-panel');
        expect(errors).toBe(0);
        if (main) {
          expect(await main.screenshot()).toMatchSnapshot({
            name: `Render-${file}.png`,
            maxDiffPixelRatio: 0.01
          });
        }
      });
    }
  });

  test.describe('File operator test', () => {
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

    test(`Should be able to add object to scene`, async ({ page }) => {
      await page.goto();

      const fileName = 'test.jcad';
      await page.getByTitle('Create a new JCAD Editor').first().click();
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

      await page.waitForTimeout(1000);
      if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
        await page.getByRole('button', { name: 'Ok' }).click();
      }

      await page.getByTitle('New Box').click();
      await page
        .locator('input[id^="id-jp-schemaform"][label="Name"]')
        .fill('Foo');
      await page
        .locator('div.jp-Dialog-buttonLabel', {
          hasText: 'Submit'
        })
        .click();

      await page
        .getByRole('tablist', { name: 'main sidebar' })
        .getByRole('tab', { name: 'JupyterCad Control Panel' })
        .click();
      await page
        .getByRole('tablist', { name: 'alternate sidebar' })
        .getByRole('tab', { name: 'JupyterCad Control Panel' })
        .click();

      await page.waitForTimeout(1000);
      expect(errors).toBe(0);
      const main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `Operator-Add-${fileName}.png`,
          maxDiffPixelRatio: 0.01
        });
      }
    });

    test(`Should be able to remove object`, async ({ page }) => {
      await page.goto();

      const fileName = 'test.jcad';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('box2')
        .click();
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByRole('button')
        .nth(1)
        .click();

      if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
        await page.getByRole('button', { name: 'Ok' }).click();
      }

      await page
        .getByRole('tablist', { name: 'main sidebar' })
        .getByRole('tab', { name: 'JupyterCad Control Panel' })
        .click();
      await page
        .getByRole('tablist', { name: 'alternate sidebar' })
        .getByRole('tab', { name: 'JupyterCad Control Panel' })
        .click();

      await page.waitForTimeout(1000);
      expect(errors).toBe(0);
      const main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `Operator-Remove-${fileName}.png`,
          maxDiffPixelRatio: 0.01
        });
      }
    });

    test(`Should be able to edit object`, async ({ page }) => {
      await page.goto();

      const fileName = 'test.jcad';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('box2')
        .click();
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Shape')
        .click();
      await page.getByLabel('Height*').click();
      await page.getByLabel('Height*').fill('32');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Deselect object for the screenshot
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Shape')
        .click();

      // Hide side bars for the screenshot
      await page
        .getByRole('tablist', { name: 'main sidebar' })
        .getByRole('tab', { name: 'JupyterCad Control Panel' })
        .click();
      await page
        .getByRole('tablist', { name: 'alternate sidebar' })
        .getByRole('tab', { name: 'JupyterCad Control Panel' })
        .click();

      await page.waitForTimeout(1000);
      expect(errors).toBe(0);
      const main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `Operator-Edit-${fileName}.png`,
          maxDiffPixelRatio: 0.01
        });
      }
    });

    test(`Should be able to do multi selection`, async ({ page }) => {
      await page.goto();

      const fileName = 'test.jcad';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

      // Create a cone
      await page.getByTitle('New Cone').click();
      await page.getByLabel('Radius1').click();
      await page.getByLabel('Radius1').fill('15');
      await page.getByLabel('Radius2').click();
      await page.getByLabel('Radius2').fill('5');
      await page.getByLabel('Height').click();
      await page.getByLabel('Height').fill('20');
      await page
        .locator('div.jp-Dialog-buttonLabel', {
          hasText: 'Submit'
        })
        .click();

      // Select cone
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Cone')
        .click();

      // Select other shape with ctrl key pressed
      await page.keyboard.down('Control');
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('box2')
        .click();

      let main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `MultiSelect-${fileName}.png`
        });
      }

      await page.waitForTimeout(1000);

      // Apply a cut operator from the selection
      await page.getByTitle('Cut').click();
      await page
        .locator('.jp-Dialog-body')
        .locator('div.jp-Dialog-buttonLabel', {
          hasText: 'Submit'
        })
        .click();

      main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `MultiSelect-Cut-${fileName}.png`
        });
      }
    });
  });

  test.describe('JCAD creation test', () => {
    test.describe('Extension activation test', () => {
      test('should create a CAD File', async ({ page, request }) => {
        await page.goto();
        await page.getByLabel('notebook content').getByText('CAD File').click();

        await page.getByTitle('New Box').getByRole('button').click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(1000);
        await page.getByText('Box 1').click();
        await page.locator('#tab-key-1-6').click();

        await page.waitForTimeout(1000);
        const main = await page.locator('#jp-main-dock-panel');

        if (main) {
          expect(await main.screenshot()).toMatchSnapshot({
            name: `JCAD-New.png`
          });
        }
        await page.getByLabel('Length*').fill('0.5');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('Width*').fill('1.5');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(500);
        await page.getByLabel('Height*').fill('2');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(500);
        if (main) {
          expect(await main.screenshot()).toMatchSnapshot({
            name: `JCAD-Modified.png`
          });
        }

        await page.getByTitle('Undo').getByRole('button').click();
        await page.getByTitle('Undo').getByRole('button').click();
        await page.getByTitle('Undo').getByRole('button').click();
        await page.waitForTimeout(1000);
        if (main) {
          expect(await main.screenshot()).toMatchSnapshot({
            name: `JCAD-Undo.png`
          });
        }
        await page.getByTitle('Redo').getByRole('button').click();
        await page.getByTitle('Redo').getByRole('button').click();
        await page.getByTitle('Redo').getByRole('button').click();
        await page.waitForTimeout(1000);
        if (main) {
          expect(await main.screenshot()).toMatchSnapshot({
            name: `JCAD-Redo.png`
          });
        }
      });
    });
  });

  test.describe('Console activation test', () => {
    test('should open console', async ({ page }) => {
      await page.goto();
      await page.getByLabel('notebook content').getByText('CAD File').click();
      await page.getByRole('button', { name: 'More commands' }).click();
      await page.getByRole('button', { name: 'Toggle console' }).click();
      await page.getByRole('button', { name: 'Remove console' });
      await page.getByRole('textbox').nth(1).click();
      await page.getByRole('textbox').nth(1).fill('doc.add_box()');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Shift+Enter');
      await page.waitForTimeout(1000);
      const main = await page.locator('#jp-main-dock-panel');

      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `JCAD-Console.png`
        });
      }
    });
  });
});
