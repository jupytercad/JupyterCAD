import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { Context, DocumentRegistry } from '@jupyterlab/docregistry';
import { ServiceManager } from '@jupyterlab/services';
import { IDisposable } from '@lumino/disposable';

import { IJupyterCadModel } from '../types';

export class NotebookRendererModel implements IDisposable {
  constructor(options: NotebookRendererModel.IOptions) {
    this._docProviderFactory = options.docProviderFactory;
    this._manager = options.manager;
    this._docModelFactory = options.docModelFactory;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._context?.dispose();
    this._isDisposed = true;
  }

  async createContext(
    path: string
  ): Promise<DocumentRegistry.IContext<IJupyterCadModel> | undefined> {
    if (this._context) {
      return this._context;
    }
    this._context = new Context({
      path,
      manager: this._manager,
      factory: this._docModelFactory,
      docProviderFactory: this._docProviderFactory
    });
    await this._context.initialize(false);
    return this._context;
  }

  private _context: Context<IJupyterCadModel> | undefined;
  private _isDisposed = false;
  private _manager: ServiceManager.IManager;
  private _docProviderFactory: IDocumentProviderFactory;
  private _docModelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>;
}

export namespace NotebookRendererModel {
  export interface IOptions {
    manager: ServiceManager.IManager;
    docProviderFactory: IDocumentProviderFactory;
    docModelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>;
  }
}
