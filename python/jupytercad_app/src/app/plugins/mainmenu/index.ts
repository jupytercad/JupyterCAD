import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { AppTitle } from './titleWidget';
import { UserMenu } from './userWidget';
import { Toolbar } from '@jupyterlab/ui-components';
import { MainMenu } from './menuWidget';
import { IThemeManager } from '@jupyterlab/apputils';
const PLUGIN_ID = 'jupytercad:topmenu';

/**
 * A service providing an interface to the main menu.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  requires: [IThemeManager],
  autoStart: true,
  activate: (app: JupyterFrontEnd, themeManager: IThemeManager): void => {
    const { user } = app.serviceManager;
    const { commands } = app;
    const appTitle = new AppTitle();
    appTitle.id = 'jupytercad-topmenu';
    app.shell.add(appTitle, 'menu', { rank: 100 });
    const spacer = Toolbar.createSpacerItem();
    spacer.id = 'jupytercad-menu-spacer';
    app.shell.add(spacer, 'menu', { rank: 150 });

    const mainMenu = new MainMenu({ commands, themeManager });
    mainMenu.id = 'jupytercad-menu-mainmenu';
    app.shell.add(mainMenu, 'menu', { rank: 175 });

    const userMenu = new UserMenu({ user });
    userMenu.id = 'jupytercad-usermenu';
    app.shell.add(userMenu, 'menu', { rank: 200 });
  }
};

export default plugin;
