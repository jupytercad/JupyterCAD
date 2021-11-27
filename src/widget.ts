import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

import { Widget } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

import { JupyterCadModel } from './model';

import {
  IMainMessage,
  IWorkerMessage,
  WorkerAction,
  MainAction
} from './types';

export class JupyterCadWidget extends DocumentWidget<
  JupyterCadPanel,
  JupyterCadModel
> {
  constructor(
    options: DocumentWidget.IOptions<JupyterCadPanel, JupyterCadModel>
  ) {
    super(options);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }
}

export class JupyterCadPanel extends Widget {
  /**
   * Construct a `ExamplePanel`.
   *
   * @param context - The documents context.
   */
  constructor(context: DocumentRegistry.IContext<JupyterCadModel>) {
    super();
    this.addClass('jp-jupytercad-panel');
    this._context = context;
    this.messageHandler = this.messageHandler.bind(this);
    const content = document.createElement('div');
    this.node.appendChild(content);
    this._context.ready.then(() => {
      const model = context.model as JupyterCadModel;
      this._worker = model.startWorker();
      console.log('worker', this._worker);
      this.postMessage({
        action: WorkerAction.LOAD_FILE,
        payload: { fileName: this._context.path, content: model.toString() }
      });
      this._worker.onmessage = msgEvent => {
        this.messageHandler(msgEvent.data);
      };
    });
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    Signal.clearData(this);
    super.dispose();
  }

  messageHandler(msg: IMainMessage): void {
    const { action, payload } = msg;
    switch (action) {
      case MainAction.DISPLAY_SHAPE: {
        console.log(payload);
        break;
      }
    }
  }

  private postMessage = (msg: IWorkerMessage) => {
    if (this._worker) {
      this._worker.postMessage(msg);
    }
  };
  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private _worker?: Worker = undefined;
}
