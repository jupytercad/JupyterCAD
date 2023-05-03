import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { MainMenu } from './widget';

const PLUGIN_ID = 'jupytercad:topmenu';

/**
 * A service providing an interface to the main menu.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  requires: [],
  autoStart: true,
  activate: (app: JupyterFrontEnd): void => {
    const menu = new MainMenu();
    menu.id = 'jupytercad-topmenu';
    app.shell.add(menu, 'menu', { rank: 100 });
  }
};

export default plugin;
