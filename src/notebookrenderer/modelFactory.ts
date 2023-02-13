import { URLExt } from '@jupyterlab/coreutils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ServerConnection, ServiceManager, User } from '@jupyterlab/services';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';
import { IDisposable } from '@lumino/disposable';
import { WebSocketProvider } from '@jupyterlab/docprovider';
import * as Y from 'yjs';
import { JupyterCadModel } from '../model';
import { IAnnotationModel, IJupyterCadModel } from '../types';
import { IJupyterCadWidgetManager, IJupyterCadWidgetRegistry } from './token';
import { YCommProvider } from './yCommProvider';

const Y_DOCUMENT_PROVIDER_URL = 'api/yjs';

export class NotebookRendererModelFactory implements IDisposable {
  constructor(options: NotebookRendererModel.IOptions) {
    this._manager = options.manager;
    this._annotationModel = options.annotationModel;
    this._wm = options.widgetManager;
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

  async createJcadModel(options: {
    commId: string;
    path: string;
    format: string;
    contentType: string;
  }): Promise<IJupyterCadModel | undefined> {
    await new Promise(r => setTimeout(r, 250));
    const { commId, path, format, contentType } = options;
    const comm = this._wm?.getComm(commId);
    if (!comm) {
      return;
    }

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

    const ywsProvider = new WebSocketProvider({
      url: serverUrl,
      path,
      format,
      contentType,
      model: jcadModel.sharedModel,
      user
    });
    jcadModel.disposed.connect(() => {
      ywsProvider.dispose();
    });
    await ywsProvider.ready;

    new YCommProvider({
      comm,
      ydoc: jcadModel.sharedModel.ydoc
    });

    return jcadModel;
  }

  private _isDisposed = false;
  private _annotationModel: IAnnotationModel;
  private _manager: ServiceManager.IManager;
  private _wm: IJupyterCadWidgetManager | undefined;
}

export namespace NotebookRendererModel {
  export interface IOptions {
    manager: ServiceManager.IManager;
    annotationModel: IAnnotationModel;
    widgetManager?: IJupyterCadWidgetManager;
  }
}
