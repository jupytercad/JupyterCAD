import { MessageLoop } from '@lumino/messaging';
import { Panel, Widget } from '@lumino/widgets';

import { JupyterCadPanel } from '../widget';
import { NotebookRendererModel } from './model';
import { IRenderMime } from '@jupyterlab/rendermime';
import { IJupyterCadModel } from '../types';

export const CLASS_NAME = 'mimerenderer-jupytercad';

export class NotebookRenderer extends Panel implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: { factory: NotebookRendererModel; mimeType: string }) {
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
    const { commId } = JSON.parse(mimeModel.data[this._mimeType] as string) as {
      commId: string;
    };

    this._jcadModel = await this._modelFactory.createJcadModel(commId);
    if (!this._jcadModel) {
      return;
    }
    this._jcadWidget = new JupyterCadPanel({ model: this._jcadModel });
    this.addWidget(this._jcadWidget);
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
  private _modelFactory: NotebookRendererModel;
  private _mimeType: string;
  private _jcadModel?: IJupyterCadModel;
}
