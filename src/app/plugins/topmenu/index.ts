import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { jupyterIcon } from '@jupyterlab/ui-components';

import { Widget } from '@lumino/widgets';

import { MainMenu } from './menu';

import { IMainMenu } from './tokens';

import { CommandIDs } from '../commands/ids';

/**
 * The main menu plugin.
 */
const plugin: JupyterFrontEndPlugin<IMainMenu> = {
  id: 'jupytercad:menu',
  autoStart: true,
  provides: IMainMenu,
  activate: (app: JupyterFrontEnd): IMainMenu => {
    const logo = new Widget();
    jupyterIcon.element({
      container: logo.node,
      elementPosition: 'center',
      margin: '2px 2px 2px 8px',
      height: 'auto',
      width: '16px'
    });
    logo.id = 'jupyter-logo';

    const { commands } = app;

    const menu = new MainMenu({ commands });
    menu.id = 'main-menu';
    menu.fileMenu.addGroup([{ command: CommandIDs.newFile }]);
    menu.fileMenu.addGroup([{ command: CommandIDs.loadFile }]);
    menu.helpMenu.addGroup([{ command: CommandIDs.about }]);

    app.shell.add(logo, 'top');
    app.shell.add(menu, 'top');

    return menu;
  }
};

export default plugin;