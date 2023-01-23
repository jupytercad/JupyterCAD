import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

import { ToolbarModel } from '../toolbar/model';
import { ToolbarWidget } from '../toolbar/widget';
import { JupyterCadPanel, JupyterCadWidget } from '../widget';
import { NotebookWidgetModel } from './model';

export const CLASS_NAME = 'mimerenderer-jupytercad';

export class NotebookRenderer extends Widget {
  /**
   * Construct a new output widget.
   */
  constructor(options: { model: NotebookWidgetModel }) {
    super();
    this._model = options.model;
    this.addClass(CLASS_NAME);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._model.dispose();
    super.dispose();
  }
  async renderModel(): Promise<void> {
    const context = await this._model.createContext();
    if (!context) {
      return;
    }
    const content = new JupyterCadPanel(context);
    const toolbar = new ToolbarWidget({
      model: new ToolbarModel({ panel: content, context })
    });
    this._jcadWidget = new JupyterCadWidget({ context, content, toolbar });

    MessageLoop.sendMessage(this._jcadWidget, Widget.Msg.BeforeAttach);
    this.node.appendChild(this._jcadWidget.node);
    MessageLoop.sendMessage(this._jcadWidget, Widget.Msg.AfterAttach);
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
  private _model: NotebookWidgetModel;
}
