import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { CommandRegistry } from '@lumino/commands';

import { JupyterCadModel } from './model';
import { IJupyterCadTracker } from './token';
import { ToolbarWidget } from './toolbar/widget';
import { JupyterCadPanel, JupyterCadWidget } from './widget';

interface IOptios extends DocumentRegistry.IWidgetFactoryOptions {
  tracker: IJupyterCadTracker;
  commands: CommandRegistry;
  backendCheck?: () => boolean;
}

export class JupyterCadWidgetFactory extends ABCWidgetFactory<
  JupyterCadWidget,
  JupyterCadModel
> {
  constructor(options: IOptios) {
    const { backendCheck, ...rest } = options;
    super(rest);
    this._backendCheck = backendCheck;
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
    if (this._backendCheck) {
      const checked = this._backendCheck();
      if (!checked) {
        throw new Error('Requested backend is not installed');
      }
    }
    const { model } = context;
    const content = new JupyterCadPanel({ model });
    const toolbar = new ToolbarWidget({
      commands: this._commands,
      model
    });
    return new JupyterCadWidget({ context, content, toolbar });
  }

  private _commands: CommandRegistry;
  private _backendCheck?: () => boolean;
}
