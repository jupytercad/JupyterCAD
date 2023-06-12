import { MessageLoop } from '@lumino/messaging';
import { Panel, Widget } from '@lumino/widgets';

import { WebSocketProvider } from '@jupyter/docprovider';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection, User } from '@jupyterlab/services';
import { ITranslator } from '@jupyterlab/translation';

import * as Y from 'yjs';

import {
  JupyterYModel,
  IJupyterYWidgetManager,
  IJupyterYWidget
} from 'yjs-widgets';

import { JupyterCadModel } from '../model';
import { JupyterCadPanel } from '../widget';

export interface ICommMetadata {
  create_ydoc: boolean;
  path: string;
  format: string;
  contentType: string;
  ymodel_name: string;
}

const Y_DOCUMENT_PROVIDER_URL = 'api/collaboration/room';
export const CLASS_NAME = 'jupytercad-notebook-widget';

export class YJupyterCADModel extends JupyterYModel {
  jupyterCADModel: JupyterCadModel;
}

export class YJupyterCADLuminoWidget extends Panel {
  constructor(model: JupyterCadModel) {
    super();

    this.addClass(CLASS_NAME);
    this._jcadWidget = new JupyterCadPanel({ model: model });
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
}

class YJupyterCADWidget implements IJupyterYWidget {
  constructor(yModel: YJupyterCADModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;

    const widget = new YJupyterCADLuminoWidget(yModel.jupyterCADModel);
    // Widget.attach(widget, node);

    MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    node.appendChild(widget.node);
    MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
  }

  readonly yModel: YJupyterCADModel;
  readonly node: HTMLElement;
}

export const yJupyterCADWidgetPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:yjswidget-plugin',
  autoStart: true,
  requires: [ITranslator],
  optional: [IJupyterYWidgetManager],
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,
    yWidgetManager?: IJupyterYWidgetManager
  ): void => {
    if (!yWidgetManager) {
      console.error('Missing IJupyterYWidgetManager token!');
      return;
    }
    class YJupyterCADModelFactory extends YJupyterCADModel {
      ydocFactory(commMetadata: ICommMetadata): Y.Doc {
        const { path, format, contentType } = commMetadata;

        this.jupyterCADModel = new JupyterCadModel({});
        const user = app.serviceManager.user;
        if (path && format && contentType) {
          const server = ServerConnection.makeSettings();
          const serverUrl = URLExt.join(server.wsUrl, Y_DOCUMENT_PROVIDER_URL);
          const ywsProvider = new WebSocketProvider({
            url: serverUrl,
            path,
            format,
            contentType,
            model: this.jupyterCADModel.sharedModel,
            user,
            translator: translator.load('jupyterlab')
          });
          this.jupyterCADModel.disposed.connect(() => {
            ywsProvider.dispose();
          });
        } else {
          const awareness = this.jupyterCADModel.sharedModel.awareness;
          const _onUserChanged = (user: User.IManager) => {
            awareness.setLocalStateField('user', user.identity);
          };
          user.ready
            .then(() => {
              _onUserChanged(user);
            })
            .catch(e => console.error(e));
          user.userChanged.connect(_onUserChanged, this);
        }

        return this.jupyterCADModel.sharedModel.ydoc;
      }
    }

    yWidgetManager.registerWidget(
      '@jupytercad:widget',
      YJupyterCADModelFactory,
      YJupyterCADWidget
    );
  }
};
