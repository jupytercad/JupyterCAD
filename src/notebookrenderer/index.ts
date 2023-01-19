import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentProviderFactory } from '@jupyterlab/docprovider';

import { IAnnotationModel } from '../types';
import { IAnnotation } from './../token';
import { MODULE_NAME, MODULE_VERSION } from './version';
import * as widgetExports from './widget';

/**
 * Extension definition.
 */
const notebookRendererPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:notebookRenderer',
  autoStart: true,
  requires: [IJupyterWidgetRegistry, IDocumentProviderFactory, IAnnotation],
  activate: (
    app: JupyterFrontEnd,
    widgetRegistry: IJupyterWidgetRegistry,
    docProviderFactory: IDocumentProviderFactory,
    annotationModel: IAnnotationModel
  ) => {
    widgetExports.JupyterCadWidgetModel.serviceManager = app.serviceManager;
    widgetExports.JupyterCadWidgetModel.docProviderFactory = docProviderFactory;
    widgetExports.JupyterCadWidgetModel.annotationModel = annotationModel;

    widgetRegistry.registerWidget({
      name: MODULE_NAME,
      version: MODULE_VERSION,
      exports: widgetExports
    });
  }
};

export default notebookRendererPlugin;
