import { IJupyterCadTracker } from './token';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { JupyterCadModel } from './model';
import { JupyterCadPanel, JupyterCadWidget } from './widget';
import { ToolbarWidget } from './toolbar/widget';
import { ToolbarModel } from './toolbar/model';
// import { WidgetTracker } from '@jupyterlab/apputils';

interface IOptios extends DocumentRegistry.IWidgetFactoryOptions {
  tracker: IJupyterCadTracker;
}

export class JupyterCadWidgetFactory extends ABCWidgetFactory<
  JupyterCadWidget,
  JupyterCadModel
> {
  constructor(options: IOptios) {
    const { ...rest } = options;
    super(rest);
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
    const toolbarModel = new ToolbarModel({ context });
    const toolbar = new ToolbarWidget({ model: toolbarModel });
    return new JupyterCadWidget({
      context,
      content: new JupyterCadPanel(context),
      toolbar
    });
  }
}
