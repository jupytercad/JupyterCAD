import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('UI Test', () => {
  const fileList = ['test.jcad', '3M_CONNECTOR.STEP', 'fan.stl'];

  test.describe('Extension activation test', () => {
    test('should emit an activation console message', async ({ page }) => {
      const logs: string[] = [];

      page.on('console', message => {
        console.log('CONSOLE MSG', message.text());
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
          console.log('ERROR MSG', message.text());
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

        await page.sidebar.close('left');
        await page.sidebar.close('right');
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
          console.log('ERROR MSG', message.text());
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
      await page.locator('input[id^="root_Name"][label="Name"]').fill('Foo');
      await page
        .locator('div.jp-Dialog-buttonLabel', {
          hasText: 'Submit'
        })
        .click();

      await page.sidebar.close('left');
      await page.sidebar.close('right');

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

      await page.sidebar.close('left');
      await page.sidebar.close('right');

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
      await page.locator('input#root_Height').click();
      await page.locator('input#root_Height').fill('32');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Deselect object for the screenshot
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Shape')
        .click();

      // Hide side bars for the screenshot
      await page.sidebar.close('left');
      await page.sidebar.close('right');

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
      await page.sidebar.close('right');
      // Create a cone
      await page.getByTitle('New Cone').click();
      await page.locator('input#root_Radius1').click();
      await page.locator('input#root_Radius1').fill('15');
      await page.locator('input#root_Radius2').click();
      await page.locator('input#root_Radius2').fill('5');
      await page.locator('input#root_Height').click();
      await page.locator('input#root_Height').fill('20');
      await page
        .locator('div.jp-Dialog-buttonLabel', {
          hasText: 'Submit'
        })
        .click();

      // Select cone
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Cone 1')
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

    test(`Test exploded view`, async ({ page }) => {
      await page.goto();

      const fileName = 'test.jcad';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });
      await page.sidebar.close('right');
      // Apply Exploded view
      await page.getByTitle('Exploded View').click();
      await page.getByRole('slider').fill('3.5');

      let main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `Exploded-${fileName}.png`
        });
      }
    });
  });

  test.describe('JCAD creation test', () => {
    test.describe('Extension activation test', () => {
      test('should create a CAD File', async ({ page, request }) => {
        await page.goto();
        await page.getByText('CAD File').click();

        await page.getByTitle('New Box').getByRole('button').click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(1000);
        await page.locator('#tab-key-1-6').click();

        await page.waitForTimeout(1000);
        const main = await page.locator('#jp-main-dock-panel');

        if (main) {
          expect(await main.screenshot()).toMatchSnapshot({
            name: `JCAD-New.png`
          });
        }
        await page.sidebar.open('left');
        await page.waitForTimeout(500);
        await page.locator('input#root_Height').fill('0.5');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(500);
        await page.locator('input#root_Width').fill('1.5');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(500);
        await page.locator('input#root_Height').fill('2');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.sidebar.close('left');
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
      await page.sidebar.close('right');
      await page.sidebar.close('left');
      await page.getByText('CAD File').click();
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

  test.describe('Suggestion Panel test', () => {
    test(`Test Delete Suggestion`, async ({ page }) => {
      await page.goto();

      const fileName = 'test.jcad';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

      // Activate Right Panel
      await page.locator('li#tab-key-1-8').click();
      await page.getByTitle('Create new fork').click();
      await page.locator('div.jp-Dialog-buttonLabel[aria-label="Ok"]').click();

      // Select cone
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Cone 1')
        .click();

      await page.locator('input#root_Height').click();
      await page.locator('input#root_Height').fill('20');

      await page
        .locator('div.jp-Dialog-buttonLabel', {
          hasText: 'Submit'
        })
        .click();

      await page.getByTitle('Delete suggestion').click();
      await page.locator('div.jp-Dialog-buttonLabel[aria-label="Ok"]').click();

      let main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `JCAD-Delete-Suggestion.png`
        });
      }
    });

    test(`Test Accept Suggestion`, async ({ page }) => {
      await page.goto();

      const fileName = 'test.jcad';
      const fullPath = `examples/${fileName}`;
      await page.notebook.openByPath(fullPath);
      await page.notebook.activate(fullPath);
      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

      // Activate Right Panel
      await page.locator('li#tab-key-1-8').click();
      await page.getByTitle('Create new fork').click();
      await page.locator('div.jp-Dialog-buttonLabel[aria-label="Ok"]').click();

      // Select cone
      await page
        .locator('[data-test-id="react-tree-root"]')
        .getByText('Cone 1')
        .click();

      await page.locator('input#root_Height').click();
      await page.locator('input#root_Height').fill('20');

      await page
        .locator('div.jp-Dialog-buttonLabel', {
          hasText: 'Submit'
        })
        .click();

      await page.getByTitle('Accept suggestion').click();
      await page.locator('div.jp-Dialog-buttonLabel[aria-label="Ok"]').click();

      let main = await page.$('#jp-main-split-panel');
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `JCAD-Accept-Suggestion.png`
        });
      }
    });
  });
});
