import { expect, test, galata } from '@jupyterlab/galata';

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

      await page.locator('div.jpcad-Spinner').waitFor({ state: 'hidden' });

      if (await page.getByRole('button', { name: 'Ok' }).isVisible()) {
        await page.getByRole('button', { name: 'Ok' }).click();
      }

      const main = await page.waitForSelector('.jp-MainAreaWidget', {
        state: 'visible'
      });

      await page.waitForTimeout(10000);

      expect(errors).toBe(0);
      if (main) {
        expect(await main.screenshot()).toMatchSnapshot({
          name: `Render-${file}.png`,
          maxDiffPixelRatio: 0.01
        });
      }
    });
  }

  test('Should open jcad.ipynb and execute it', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('lab/index.html?path=jcad.ipynb', {
      waitUntil: 'domcontentloaded'
    });

    const Notebook = await page.waitForSelector('.jp-Notebook', {
      state: 'visible'
    });
    await Notebook.click();

    await page.keyboard.press('Control+Enter');

    await page.locator('.jp-InputArea-prompt >> text="[1]:"').first().waitFor();

    const outputErrors = await page.$$('.jp-OutputArea-error');
    expect(outputErrors.length).toBe(0);

    const jcadWidget = await page.waitForSelector(
      '.jupytercad-notebook-widget',
      {
        state: 'visible'
      }
    );

    expect(await jcadWidget.screenshot()).toMatchSnapshot({
      name: 'Render-notebook.png',
      maxDiffPixelRatio: 0.01
    });
  });
});
