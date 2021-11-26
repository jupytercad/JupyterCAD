import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

import { Widget } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

import { JupyterCadModel } from './model';

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
    const content = document.createElement('div');
    this.node.appendChild(content);
    context.ready.then(() => {
      const model = context.model as JupyterCadModel;
      const worker = model.startWorker();
      console.log('worker', worker);
      worker.postMessage({ message: 'hello' });
      worker.onmessage = msg => {
        console.log('msg', msg);
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
}
