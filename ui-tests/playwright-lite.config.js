/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  webServer: {
    command: 'jlpm start:lite',
    // url: 'http://localhost:8866/lab',
    port: 8866,
    timeout: 120 * 1000,
    reuseExistingServer: false
  },
  retries: 1,
  use: {
    ...baseConfig.use,
    trace: 'off',

  },
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.002,
    },
  },
};
