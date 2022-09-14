import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { JupyterCadModel } from './model';
import { JupyterCadPanel, JupyterCadWidget } from './widget';

export class JupyterCadWidgetFactory extends ABCWidgetFactory<
  JupyterCadWidget,
  JupyterCadModel
> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
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
    return new JupyterCadWidget({
      context,
      content: new JupyterCadPanel(context)
    });
  }
}
