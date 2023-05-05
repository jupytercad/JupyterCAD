import { IJupyterCadTracker } from './token';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { CommandRegistry } from '@lumino/commands';

import { JupyterCadModel } from './model';
import { JupyterCadPanel, JupyterCadWidget } from './widget';
import { ToolbarWidget } from './toolbar/widget';

interface IOptios extends DocumentRegistry.IWidgetFactoryOptions {
  tracker: IJupyterCadTracker;
  commands: CommandRegistry;
}

export class JupyterCadWidgetFactory extends ABCWidgetFactory<
  JupyterCadWidget,
  JupyterCadModel
> {
  private _commands: CommandRegistry;

  constructor(options: IOptios) {
    const { ...rest } = options;
    super(rest);

    this._commands = options.commands;
  }

  /**
   * Create a new widget given a context.
   *
   * @param context Contains the information of the file
   * @returns The widget
   */
  protected createNewWidget(
    context: DocumentRegistry.IContext<JupyterCadModel>
  ): JupyterCadWidget {
    const { model } = context;
    const content = new JupyterCadPanel({ model });
    const toolbar = new ToolbarWidget({
      commands: this._commands,
      model
    });
    return new JupyterCadWidget({ context, content, toolbar });
  }
}
