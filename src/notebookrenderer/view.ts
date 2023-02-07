import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

import { JupyterCadPanel } from '../widget';
import { NotebookRendererModelFactory } from './modelFactory';
import { IRenderMime } from '@jupyterlab/rendermime';
import { IJupyterCadModel } from '../types';

export const CLASS_NAME = 'mimerenderer-jupytercad';

export class NotebookRenderer extends Widget {
  /**
   * Construct a new output widget.
   */
  constructor(options: {
    factory: NotebookRendererModelFactory;
    mimeType: string;
  }) {
    super();
    this._modelFactory = options.factory;
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._jcadModel?.dispose();
    super.dispose();
  }
  async renderModel(mimeModel: IRenderMime.IMimeModel): Promise<void> {
    const path = mimeModel.data[this._mimeType] as string;
    this._jcadModel = await this._modelFactory.createJcadModel(path);
    if (!this._jcadModel) {
      return;
    }
    this._jcadWidget = new JupyterCadPanel({ model: this._jcadModel });

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
  private _jcadWidget: JupyterCadPanel;
  private _modelFactory: NotebookRendererModelFactory;
  private _mimeType: string;
  private _jcadModel?: IJupyterCadModel;
}
