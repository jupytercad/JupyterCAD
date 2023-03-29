import { PageConfig, URLExt } from '@jupyterlab/coreutils';
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'cad/'
);

import { App } from './app/app';

/**
 * The main function
 */
async function main(): Promise<void> {
  const app = new App();
  const mods = [
    require('./app/plugins/paths'),
    require('./app/plugins/commands'),
    require('./app/plugins/topmenu')
    // require('./app/plugins/example')
  ];

  app.registerPluginModules(mods);

  await app.start();
}

window.addEventListener('load', main);
