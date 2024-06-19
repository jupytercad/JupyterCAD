import { RankedMenu, MenuSvg, homeIcon } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { MenuBar } from '@lumino/widgets';
import { CommandIDs } from '@jupytercad/base/lib/commands';
import { IThemeManager } from '@jupyterlab/apputils';
export class MainMenu extends MenuBar {
  constructor(options: {
    commands: CommandRegistry;
    themeManager: IThemeManager;
  }) {
    super({ forceItemsPosition: { forceX: false, forceY: true } });
    this._commands = options.commands;
    this._themeManager = options.themeManager;
    this.addClass('jc-MainMenu');
    this._createFileMenu();
    this._createEditMenu();
    this._createViewMenu();
    this._createHelpMenu();
  }

  private _createHelpMenu(): void {
    this._commands.addCommand('jupytercad:help-menu:documentation', {
      label: 'Documentation',
      execute: () => {
        window.open('https://github.com/jupytercad/JupyterCAD', '_blank');
      },
      icon: homeIcon
    });
    const helpMenu = new MenuSvg({
      commands: this._commands
    });
    helpMenu.title.label = 'Help';
    helpMenu.title.mnemonic = 0;
    helpMenu.addClass('jc-MenuBar-MenuItem');
    this.addMenu(helpMenu);
    helpMenu.addItem({
      type: 'command',
      command: 'jupytercad:help-menu:documentation'
    });
  }
  private _createFileMenu(): void {
    const menu = new MenuSvg({
      commands: this._commands
    });
    menu.title.label = 'File';
    menu.title.mnemonic = 0;
    menu.addClass('jc-MenuBar-FileMenu');
    menu.addClass('jc-MenuBar-MenuItem');
    this.addMenu(menu);
    menu.addItem({
      type: 'command',
      command: 'jupytercad:create-new-jcad-file'
    });
    menu.addItem({
      type: 'command',
      command: 'jupytercad:open-file'
    });
  }
  private _createEditMenu(): void {
    const menu = new MenuSvg({
      commands: this._commands
    });
    menu.title.label = 'Edit';
    menu.title.mnemonic = 0;
    menu.addClass('jc-MenuBar-MenuItem');
    this.addMenu(menu);

    const shapeMenu = new RankedMenu({
      commands: this._commands,
      rank: 200
    });
    shapeMenu.title.label = 'Shape';
    shapeMenu.addClass('jc-MenuBar-MenuItem');
    shapeMenu.addItem({
      type: 'command',
      command: CommandIDs.newBox
    });
    shapeMenu.addItem({
      type: 'command',
      command: CommandIDs.newCone
    });
    shapeMenu.addItem({
      type: 'command',
      command: CommandIDs.newCylinder
    });
    shapeMenu.addItem({
      type: 'command',
      command: CommandIDs.newSketch
    });
    shapeMenu.addItem({
      type: 'command',
      command: CommandIDs.newSphere
    });
    shapeMenu.addItem({
      type: 'command',
      command: CommandIDs.newTorus
    });
    shapeMenu.addItem({
      type: 'command',
      command: CommandIDs.newCone
    });

    menu.addItem({
      type: 'submenu',
      submenu: shapeMenu
    });

    const operatorMenu = new RankedMenu({
      commands: this._commands,
      rank: 200
    });
    operatorMenu.title.label = 'Operators';
    operatorMenu.addClass('jc-MenuBar-MenuItem');
    operatorMenu.addItem({
      type: 'command',
      command: CommandIDs.cut
    });
    operatorMenu.addItem({
      type: 'command',
      command: CommandIDs.extrusion
    });
    operatorMenu.addItem({
      type: 'command',
      command: CommandIDs.intersection
    });
    operatorMenu.addItem({
      type: 'command',
      command: CommandIDs.union
    });
    operatorMenu.addItem({
      type: 'command',
      command: CommandIDs.chamfer
    });
    operatorMenu.addItem({
      type: 'command',
      command: CommandIDs.fillet
    });
    menu.addItem({
      type: 'submenu',
      submenu: operatorMenu
    });

    menu.addItem({
      type: 'command',
      command: CommandIDs.undo
    });
    menu.addItem({
      type: 'command',
      command: CommandIDs.redo
    });
  }

  private _createViewMenu(): void {
    const menu = new MenuSvg({
      commands: this._commands
    });
    menu.title.label = 'View';
    menu.title.mnemonic = 0;
    menu.addClass('jc-MenuBar-ViewMenu');
    menu.addClass('jc-MenuBar-MenuItem');
    this.addMenu(menu);
    menu.addItem({
      type: 'command',
      command: CommandIDs.updateExplodedView
    });
    menu.addItem({
      type: 'command',
      command: CommandIDs.updateAxes
    });
    menu.addItem({
      type: 'command',
      command: CommandIDs.updateCameraSettings
    });
    menu.addItem({
      type: 'command',
      command: CommandIDs.updateClipView
    });

    const themeMenu = new RankedMenu({
      commands: this._commands,
      rank: 200
    });
    themeMenu.title.label = 'Theme';
    themeMenu.addClass('jc-MenuBar-MenuItem');
    this._themeManager.themes.forEach((theme, index) => {
      themeMenu.insertItem(index, {
        command: 'apputils:change-theme',
        args: { theme }
      });
    });
    menu.addItem({
      type: 'submenu',
      submenu: themeMenu
    });
  }
  private _commands: CommandRegistry;
  private _themeManager: IThemeManager;
}
