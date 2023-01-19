import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { Context, DocumentRegistry } from '@jupyterlab/docregistry';
import { ServiceManager } from '@jupyterlab/services';
import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

import { ToolbarModel } from '../toolbar/model';
import { ToolbarWidget } from '../toolbar/widget';
import { IJupyterCadModel } from '../types';
import { JupyterCadPanel, JupyterCadWidget } from '../widget';
import { CLASS_NAME, INotebookRendererOptions } from './types';

export class NotebookRenderer extends Widget {
  /**
   * Construct a new output widget.
   */
  constructor(options: INotebookRendererOptions) {
    super();
    this._docProviderFactory = options.docProviderFactory;
    this._manager = options.manager;
    this._modelFactory = options.modelFactory;
    this.addClass(CLASS_NAME);
  }

  dispose(): void {
    this._jcadWidget.context.dispose();
    super.dispose();
  }
  renderModel(path: string): Promise<void> {
    const context = new Context({
      manager: this._manager,
      path,
      factory: this._modelFactory,
      docProviderFactory: this._docProviderFactory
    });
    return context.initialize(false).then(() => {
      const content = new JupyterCadPanel(context);
      const toolbarModel = new ToolbarModel({ panel: content, context });
      const toolbar = new ToolbarWidget({
        model: toolbarModel
      });
      this._jcadWidget = new JupyterCadWidget({ context, content, toolbar });
      MessageLoop.sendMessage(this._jcadWidget, Widget.Msg.BeforeAttach);
      this.node.appendChild(this._jcadWidget.node);
      MessageLoop.sendMessage(this._jcadWidget, Widget.Msg.AfterAttach);
    });
  }

  onResize = (): void => {
    if (this._jcadWidget) {
      MessageLoop.sendMessage(
        this._jcadWidget,
        Widget.ResizeMessage.UnknownSize
      );
    }
  };
  private _jcadWidget: JupyterCadWidget;
  private _manager: ServiceManager.IManager;
  private _docProviderFactory: IDocumentProviderFactory;
  private _modelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>;
}
