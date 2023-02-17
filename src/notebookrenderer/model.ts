import { IDisposable } from '@lumino/disposable';

import { IJupyterCadModel } from '../types';
import { IJupyterCadWidgetManager } from './token';

export class NotebookRendererModel implements IDisposable {
  constructor(options: NotebookRendererModel.IOptions) {
    this._widgetManager = options.widgetManager;
    this._kernelId = options.kernelId;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
  }

  createJcadModel(commId: string): IJupyterCadModel | undefined {
    if (this._kernelId) {
      return this._widgetManager.getWidgetModel(this._kernelId, commId);
    }
  }

  private _isDisposed = false;
  private _kernelId?: string;
  private _widgetManager: IJupyterCadWidgetManager;
}

export namespace NotebookRendererModel {
  export interface IOptions {
    kernelId?: string;
    widgetManager: IJupyterCadWidgetManager;
  }
}
