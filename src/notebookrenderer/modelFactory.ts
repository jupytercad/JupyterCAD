import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { Context, DocumentRegistry } from '@jupyterlab/docregistry';
import { ServerConnection, ServiceManager, User } from '@jupyterlab/services';
import { IDisposable } from '@lumino/disposable';
import { JupyterCadModel } from '../model';
import { WebsocketProvider as YWebsocketProvider } from 'y-websocket';
import { IAnnotationModel, IJupyterCadModel } from '../types';
import { URLExt } from '@jupyterlab/coreutils';

const Y_DOCUMENT_PROVIDER_URL = 'api/yjs';

export class NotebookRendererModelFactory implements IDisposable {
  constructor(options: NotebookRendererModel.IOptions) {
    this._manager = options.manager;
    this._annotationModel = options.annotationModel;
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

  async createJcadModel(roomId: string): Promise<IJupyterCadModel | undefined> {
    const server = ServerConnection.makeSettings();
    const serverUrl = URLExt.join(server.wsUrl, Y_DOCUMENT_PROVIDER_URL);

    const jcadModel = new JupyterCadModel(this._annotationModel);
    const awareness = jcadModel.sharedModel.awareness;

    const _onUserChanged = (user: User.IManager) => {
      awareness.setLocalStateField('user', user.identity);
    };
    const user = this._manager.user;

    user.ready
      .then(() => {
        _onUserChanged(user);
      })
      .catch(e => console.error(e));
    user.userChanged.connect(_onUserChanged, this);

    await new Promise(r => setTimeout(r, 250));

    const ywsProvider = new YWebsocketProvider(
      serverUrl,
      roomId,
      jcadModel.sharedModel.ydoc,
      { awareness }
    );
    jcadModel.disposed.connect(() => {
      ywsProvider.destroy();
    });

    return jcadModel;
  }

  private _isDisposed = false;
  private _annotationModel: IAnnotationModel;
  private _manager: ServiceManager.IManager;
}

export namespace NotebookRendererModel {
  export interface IOptions {
    manager: ServiceManager.IManager;
    annotationModel: IAnnotationModel;
  }
}
