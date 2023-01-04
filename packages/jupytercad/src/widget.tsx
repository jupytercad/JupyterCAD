import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

import { Signal } from '@lumino/signaling';

import { MainView } from './mainview';
import { JupyterCadModel } from './model';
import { IJupyterCadWidget } from './types';

export class JupyterCadWidget
  extends DocumentWidget<JupyterCadPanel, JupyterCadModel>
  implements IJupyterCadWidget
{
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

  onResize = (msg: any): void => {
    window.dispatchEvent(new Event('resize'));
  };
}

export class JupyterCadPanel extends ReactWidget {
  /**
   * Construct a `ExamplePanel`.
   *
   * @param context - The documents context.
   */
  constructor(context: DocumentRegistry.IContext<JupyterCadModel>) {
    super();
    this.addClass('jp-jupytercad-panel');
    this._context = context;
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

  render(): JSX.Element {
    return <MainView context={this._context} />;
  }

  private _context: DocumentRegistry.IContext<JupyterCadModel>;
}
