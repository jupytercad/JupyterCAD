import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
  WidgetModel,
  WidgetView
} from '@jupyter-widgets/base';
import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ServiceManager } from '@jupyterlab/services';
import { Message, MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

import { JupyterCadFCModelFactory } from '../fcplugin/modelfactory';
import { JupyterCadJcadModelFactory } from '../jcadplugin/modelfactory';
import { IAnnotationModel, IJupyterCadModel } from '../types';
import { NotebookRenderer } from './renderer';
import { MODULE_NAME, MODULE_VERSION } from './version';

export class JupyterCadWidgetModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: JupyterCadWidgetModel.model_name,
      _model_module: JupyterCadWidgetModel.model_module,
      _model_module_version: JupyterCadWidgetModel.model_module_version,
      _view_name: JupyterCadWidgetModel.view_name,
      _view_module: JupyterCadWidgetModel.view_module,
      _view_module_version: JupyterCadWidgetModel.view_module_version,
      path: null
    };
  }

  docModelFactory():
    | DocumentRegistry.IModelFactory<IJupyterCadModel>
    | undefined {
    const path: string = this.get('path');
    if (!path) {
      return;
    }
    const ext = path.split('.').pop()?.toLowerCase();
    const annotationModel = JupyterCadWidgetModel.annotationModel;
    if (ext === 'fcstd') {
      return new JupyterCadFCModelFactory({ annotationModel });
    } else if (ext === 'jcad') {
      return new JupyterCadJcadModelFactory({ annotationModel });
    }
  }

  static serviceManager: ServiceManager.IManager;
  static docProviderFactory: IDocumentProviderFactory;
  static annotationModel: IAnnotationModel;

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers
  };

  static model_name = 'JupyterCadWidgetModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'JupyterCadWidgetView';
  static view_module = MODULE_NAME;
  static view_module_version = MODULE_VERSION;
}

export class JupyterCadWidgetView extends DOMWidgetView {
  processLuminoMessage(msg: Message) {
    switch (msg.type) {
      case 'resize': {
        if (this._view) {
          MessageLoop.sendMessage(this._view, Widget.ResizeMessage.UnknownSize);
        }
        break;
      }
      case 'before-detach': {
        this._view?.dispose();
        break;
      }
      default:
        break;
    }
  }
  initialize(parameters: WidgetView.IInitializeParameters<WidgetModel>): void {
    const model = this.model as JupyterCadWidgetModel;
    const modelFactory = model.docModelFactory();
    if (modelFactory) {
      this._view = new NotebookRenderer({
        manager: JupyterCadWidgetModel.serviceManager,
        docProviderFactory: JupyterCadWidgetModel.docProviderFactory,
        modelFactory: modelFactory
      });
    }
  }
  async render() {
    super.render();
    if (this._view) {
      await this._view.renderModel(this.model.get('path'));

      MessageLoop.sendMessage(this._view, Widget.Msg.BeforeAttach);
      this.el.appendChild(this._view.node);
      MessageLoop.sendMessage(this._view, Widget.Msg.AfterAttach);
    }
  }

  private _view?: NotebookRenderer;
}
