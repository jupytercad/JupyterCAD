import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';

test.use({ autoGoto: false });

test.describe('UI Test', () => {
  const fileList = ['test.jcad', '3M_CONNECTOR.STEP', 'fan.stl'];
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
      browser
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(`lab/index.html?path=${file}`, {
        waitUntil: 'domcontentloaded'
      });
      console.log('FILE LOADED');

      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });
      await page.waitForTimeout(1000);

      if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
        await page.getByRole('button', { name: 'Ok' }).click();
      }

      // await page.sidebar.close('left');
      // await page.sidebar.close('right');
      await page.waitForTimeout(1000);

      const main = await page.waitForSelector('#jp-main-split-panel', {
        state: 'visible',
        timeout: 10000
      });

      console.log('hurrayyyy', main);

      expect(errors).toBe(0);
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `Render-${file}.png`,
          maxDiffPixelRatio: 0.01
        });
      }
    });
  }

  test('Should create and execute a new .ipynb file', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('lab/index.html?path=jcad.ipynb',  {
      waitUntil: 'domcontentloaded'
    });

    // await page.click('[title="Create a new notebook"]');
    // await page.waitForSelector('.jp-Notebook', { state: 'visible' });

    // await page.keyboard.type(
    //   'from jupytercad import CadDocument\n' +
    //     'doc = CadDocument()\n' +
    //     "doc.add_cone().add_sphere(radius=0.8).cut(color='#ff0000')"
    // );

    await page.keyboard.press('Control+Enter');

    await page.locator('.jp-InputArea-prompt >> text="[1]:"').first().waitFor();

    const outputErrors = await page.$$('.jp-OutputArea-error');
    expect(outputErrors.length).toBe(0);

    const jcadWidget = await page.waitForSelector(
      '.jupytercad-notebook-widget',
      {
        state: 'visible',
        timeout: 10000
      }
    );

    expect(await jcadWidget.screenshot()).toMatchSnapshot({
      name: 'Render-notebook.png',
      maxDiffPixelRatio: 0.01
    });
  });
});
