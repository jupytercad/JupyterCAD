import { CommandToolbarButton } from '@jupyterlab/apputils';
import {
  Toolbar,
  ReactWidget,
  undoIcon,
  redoIcon
} from '@jupyterlab/ui-components';

import { CommandRegistry } from '@lumino/commands';

import * as React from 'react';

import { ToolbarReact } from './toolbar';
import { ToolbarModel } from './model';

export class ToolbarWidget extends Toolbar {
  constructor(options: ToolbarWidget.IOptions) {
    const { model, ...rest } = options;
    super(rest);
    this.addClass('jpcad-toolbar-widget');
    this._model = model;

    this.addItem(
      'undo',
      new CommandToolbarButton({
        id: ToolbarWidget.CommandIDs.undo,
        label: '',
        icon: undoIcon,
        commands: options.commands
      })
    );
    this.addItem(
      'redo',
      new CommandToolbarButton({
        id: ToolbarWidget.CommandIDs.redo,
        label: '',
        icon: redoIcon,
        commands: options.commands
      })
    );

    const body = ReactWidget.create(
      <ToolbarReact toolbarModel={this._model} />
    );
    this.addItem('body', body);
  }

  private _model: ToolbarModel;
}

export namespace ToolbarWidget {
  export interface IOptions extends Toolbar.IOptions {
    model: ToolbarModel;
    commands: CommandRegistry;
  }

  /**
   * The command IDs used by the FreeCAD plugin.
   */
  export namespace CommandIDs {
    export const redo = 'jupytercad:redo';
    export const undo = 'jupytercad:undo';
  }
}
