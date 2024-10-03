import { IJCadExternalCommand, JupyterCadModel } from '@jupytercad/schema';
import { CommandToolbarButton } from '@jupyterlab/apputils';
import {
  ReactWidget,
  redoIcon,
  Toolbar,
  undoIcon,
  terminalIcon
} from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';
import * as React from 'react';
import { LabIcon } from '@jupyterlab/ui-components';
import { wireframeIcon } from '../tools';

import { CommandIDs } from '../commands';
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

export class CommandToggleToolbarButton extends Widget {
  private _toggled: boolean;
  private _commands: CommandRegistry;
  private _id: string;

  constructor(options: {
    id: string;
    label?: string;
    icon?: LabIcon;
    commands: CommandRegistry;
    initialToggled?: boolean;
  }) {
    super();
    this._toggled = options.initialToggled ?? false;
    this._commands = options.commands;
    this._id = options.id;

    const button = document.createElement('jp-button');
    button.className = 'jp-ToolbarButtonComponent';
    button.setAttribute('aria-label', options.label ?? 'Button');
    button.setAttribute('data-command', options.id);
    button.setAttribute('appearance', 'stealth');

    if (options.icon) {
      const iconElement = document.createElement('span');
      options.icon.element({
        container: iconElement,
        stylesheet: 'toolbarButton'
      });
      button.prepend(iconElement);
    }

    if (this._toggled) {
      button.classList.add('jpcad-button-enabled');
    }

    button.addEventListener('click', () => {
      this._toggled = !this._toggled;
      button.classList.toggle('jpcad-button-enabled', this._toggled);
      this._commands.execute(this._id);
    });

    this.node.appendChild(button);
  }
}
export class ToolbarWidget extends Toolbar {
  constructor(options: ToolbarWidget.IOptions) {
    super(options);
    this.addClass('jpcad-toolbar-widget');
    setTimeout(() => {
      // Allow the widget tracker to propagate the new widget signal.
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
          'Chamfer',
          new CommandToolbarButton({
            id: CommandIDs.chamfer,
            label: '',
            commands: options.commands
          })
        );

        this.addItem(
          'Fillet',
          new CommandToolbarButton({
            id: CommandIDs.fillet,
            label: '',
            commands: options.commands
          })
        );

        this.addItem('separator4', new Separator());

        this.addItem(
          'New Sketch',
          new CommandToolbarButton({
            id: CommandIDs.newSketch,
            label: '',
            commands: options.commands
          })
        );

        this.addItem('separator5', new Separator());

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
        this.addItem(
          'Camera Settings',
          new CommandToolbarButton({
            id: CommandIDs.updateCameraSettings,
            label: '',
            commands: options.commands
          })
        );
        this.addItem(
          'Clip View',
          new CommandToolbarButton({
            id: CommandIDs.updateClipView,
            label: '',
            commands: options.commands
          })
        );

        this.addItem('separator6', new Separator());
        this.addItem(
          'Toggle console',
          new CommandToolbarButton({
            id: CommandIDs.toggleConsole,
            commands: options.commands,
            label: '',
            icon: terminalIcon
          })
        );

        this.addItem(
          'Toggle Wireframe',
          new CommandToggleToolbarButton({
            id: CommandIDs.wireframe,
            label: '',
            commands: options.commands,
            icon: wireframeIcon
          })
        );

        this.addItem('separator7', new Separator());
        (options.externalCommands ?? []).forEach(cmd => {
          this.addItem(
            cmd.name,
            new CommandToolbarButton({
              id: cmd.id,
              label: cmd.label ?? '',
              commands: options.commands!
            })
          );
        });
        this.addItem('spacer', Toolbar.createSpacerItem());

        // Users
        this.addItem(
          'users',
          ReactWidget.create(<UsersItem model={options.model} />)
        );
      }
    }, 100);
  }
}

export namespace ToolbarWidget {
  export interface IOptions extends Toolbar.IOptions {
    commands?: CommandRegistry;
    model: JupyterCadModel;
    externalCommands: IJCadExternalCommand[];
  }
}
