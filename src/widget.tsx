import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { ObservableMap, IObservableMap } from '@jupyterlab/observables';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

import { ISignal, Signal } from '@lumino/signaling';

import { MainView } from './mainview';
import { JupyterCadModel } from './model';
import {
  AxeHelper,
  ExplodedView,
  IJupyterCadModel,
  IJupyterCadWidget
} from './types';
import { JSONValue } from '@lumino/coreutils';

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
  constructor(context: DocumentRegistry.IContext<IJupyterCadModel>) {
    super();
    this.addClass('jp-jupytercad-panel');
    this._context = context;

    this._view = new ObservableMap<JSONValue>();
  }

  get viewChanged(): ISignal<
    ObservableMap<JSONValue>,
    IObservableMap.IChangedArgs<JSONValue>
  > {
    return this._view.changed;
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

  get axes(): AxeHelper | undefined {
    return this._view.get('axes') as AxeHelper | undefined;
  }

  set axes(value: AxeHelper | undefined) {
    this._view.set('axes', value || null);
  }

  get explodedView(): ExplodedView | undefined {
    return this._view.get('explodedView') as ExplodedView | undefined;
  }

  set explodedView(value: ExplodedView | undefined) {
    this._view.set('explodedView', value || null);
  }

  deleteAxes(): void {
    this._view.delete('axes');
  }

  render(): JSX.Element {
    return <MainView view={this._view} context={this._context} />;
  }

  private _view: ObservableMap<JSONValue>;
  private _context: DocumentRegistry.IContext<IJupyterCadModel>;
}
