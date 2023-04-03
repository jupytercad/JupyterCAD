import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { jupyterIcon } from '@jupyterlab/ui-components';

import { Widget } from '@lumino/widgets';

import { MainMenu } from '@jupyterlab/mainmenu';

import { IMainMenu } from '@jupyterlab/mainmenu';

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

    const menu = new MainMenu(commands);
    menu.id = 'jp-MainMenu';
    menu.addClass('jp-scrollbar-tiny');

    menu.fileMenu.addGroup([
      { command: CommandIDs.newFile },
      { command: CommandIDs.loadFile }
    ]);
    menu.helpMenu.addItem({ command: CommandIDs.about });
    menu.update();
    menu.setHidden(false);

    app.shell.add(logo, 'menu');
    app.shell.add(menu, 'menu');

    return menu;
  }
};

export default plugin;
