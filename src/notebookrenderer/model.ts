import { IDisposable } from '@lumino/disposable';
import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { Context, DocumentRegistry } from '@jupyterlab/docregistry';
import { ServiceManager } from '@jupyterlab/services';
import { IJupyterCadModel } from '../types';
import { IWidgetMessage } from './types';
import { ISignal, Signal } from '@lumino/signaling';

export class NotebookWidgetModel implements IDisposable {
  constructor(options: NotebookWidgetModel.IOptions) {
    this._docProviderFactory = options.docProviderFactory;
    this._manager = options.manager;
    this._docModelFactory = options.docModelFactory;
    this._path = options.path;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  get messageSent(): ISignal<NotebookWidgetModel, IWidgetMessage> {
    return this._messageSent;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._context?.dispose();
    this._isDisposed = true;
  }

  async createContext(): Promise<DocumentRegistry.IContext<IJupyterCadModel>> {
    if (this._context) {
      return this._context;
    }
    this._context = new Context({
      path: this._path,
      manager: this._manager,
      factory: this._docModelFactory,
      docProviderFactory: this._docProviderFactory
    });
    await this._context.initialize(false);
    const model = this._context.model;
    model.sharedObjectsChanged.connect(() => {
      // this.sendMsg({action:'updateAllObjects', payload: model.getAllObject()})
    });
    return this._context;
  }

  handleMessage(msg: IWidgetMessage): void {
    const { action, payload } = msg;
    switch (action) {
      case 'add_object':
        this._context?.model.sharedModel.addObject({
          name: 'name',
          visible: true,
          shape: 'Part::Box',
          parameters: payload
        });
        break;
      case 'remove_object':
        break;

      default:
        break;
    }
  }

  protected sendMsg(msg: IWidgetMessage): void {
    this._messageSent.emit(msg);
  }

  private _context: Context<IJupyterCadModel> | undefined;
  private _isDisposed = false;
  private _path: string;
  private _manager: ServiceManager.IManager;
  private _docProviderFactory: IDocumentProviderFactory;
  private _docModelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>;
  private _messageSent = new Signal<this, IWidgetMessage>(this);
}

export namespace NotebookWidgetModel {
  export interface IOptions {
    path: string;
    manager: ServiceManager.IManager;
    docProviderFactory: IDocumentProviderFactory;
    docModelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>;
  }
}
