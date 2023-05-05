import * as React from 'react';

import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';

import { CommandToolbarButton } from '@jupyterlab/apputils';
import {
  Toolbar,
  undoIcon,
  redoIcon,
  ReactWidget
} from '@jupyterlab/ui-components';

import { CommandIDs } from '../commands';
import { JupyterCadModel } from '../model';
import { UsersItem } from './usertoolbaritem';

export const TOOLBAR_SEPARATOR_CLASS = 'jcad-Toolbar-Separator';

export class Separator extends Widget {
  /**
   * Construct a new separator widget.
   */
  constructor() {
    super();
    this.addClass(TOOLBAR_SEPARATOR_CLASS);
  }
}

export class ToolbarWidget extends Toolbar {
  constructor(options: ToolbarWidget.IOptions) {
    super(options);

    this.addClass('jpcad-toolbar-widget');

    if (options.commands) {
      this.addItem(
        'undo',
        new CommandToolbarButton({
          id: CommandIDs.undo,
          label: '',
          icon: undoIcon,
          commands: options.commands
        })
      );

      this.addItem(
        'redo',
        new CommandToolbarButton({
          id: CommandIDs.redo,
          label: '',
          icon: redoIcon,
          commands: options.commands
        })
      );

      this.addItem('separator1', new Separator());

      // Parts
      this.addItem(
        'New Box',
        new CommandToolbarButton({
          id: CommandIDs.newBox,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'New Cylinder',
        new CommandToolbarButton({
          id: CommandIDs.newCylinder,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'New Sphere',
        new CommandToolbarButton({
          id: CommandIDs.newSphere,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'New Cone',
        new CommandToolbarButton({
          id: CommandIDs.newCone,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'New Torus',
        new CommandToolbarButton({
          id: CommandIDs.newTorus,
          label: '',
          commands: options.commands
        })
      );

      this.addItem('separator2', new Separator());

      // Operators
      this.addItem(
        'Cut',
        new CommandToolbarButton({
          id: CommandIDs.cut,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'Union',
        new CommandToolbarButton({
          id: CommandIDs.union,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'Intersection',
        new CommandToolbarButton({
          id: CommandIDs.intersection,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'Extrusion',
        new CommandToolbarButton({
          id: CommandIDs.extrusion,
          label: '',
          commands: options.commands
        })
      );

      this.addItem('separator3', new Separator());

      this.addItem(
        'New Sketch',
        new CommandToolbarButton({
          id: CommandIDs.newSketch,
          label: '',
          commands: options.commands
        })
      );

      this.addItem('separator4', new Separator());

      // View helpers
      this.addItem(
        'Axes Helper',
        new CommandToolbarButton({
          id: CommandIDs.updateAxes,
          label: '',
          commands: options.commands
        })
      );
      this.addItem(
        'Exploded View',
        new CommandToolbarButton({
          id: CommandIDs.updateExplodedView,
          label: '',
          commands: options.commands
        })
      );

      this.addItem('spacer', Toolbar.createSpacerItem());

      // Users
      this.addItem(
        'users',
        ReactWidget.create(<UsersItem model={options.model} />)
      );
    }
  }
}

export namespace ToolbarWidget {
  export interface IOptions extends Toolbar.IOptions {
    commands?: CommandRegistry;
    model: JupyterCadModel;
  }
}
