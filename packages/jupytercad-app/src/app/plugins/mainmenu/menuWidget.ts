import { RankedMenu } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { MenuBar } from '@lumino/widgets';

export class MainMenu extends MenuBar {
  constructor(commands: CommandRegistry) {
    const options = { forceItemsPosition: { forceX: false, forceY: true } };
    super(options);
    this._commands = commands;
    this.addClass('jc-MainMenu');
    this._createFileMenu();
    this._createHelpMenu();
  }

  private _createHelpMenu(): void {
    this._commands.addCommand('help-menu:one', {
      label: 'Item One',
      execute: () => {
        console.log('One');
      }
    });
    const helpMenu = new RankedMenu({
      commands: this._commands,
      rank: 200
    });
    helpMenu.title.label = 'Help';
    helpMenu.title.mnemonic = 0;
    helpMenu.addClass('jc-MenuBar-MenuItem');
    this.addMenu(helpMenu);
    helpMenu.addItem({
      type: 'command',
      command: 'help-menu:one'
    });
  }
  private _createFileMenu(): void {
    this._commands.addCommand('file-menu:one', {
      label: 'Item One',
      execute: () => {
        console.log('One');
      }
    });
    const menu = new RankedMenu({
      commands: this._commands,
      rank: 100
    });
    menu.title.label = 'File';
    menu.title.mnemonic = 0;
    menu.addClass('jc-MenuBar-MenuItem');
    this.addMenu(menu);
    menu.addItem({
      type: 'command',
      command: 'file-menu:one'
    });
  }
  private _commands: CommandRegistry;
}