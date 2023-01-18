import {
  createRendermimePlugin,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { DocumentRegistry, MimeDocument } from '@jupyterlab/docregistry';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { JupyterCadFCModelFactory } from '../fcplugin/modelfactory';
import { JupyterCadJcadModelFactory } from '../jcadplugin/modelfactory';

import { IAnnotationModel, IJupyterCadModel } from '../types';
import { IAnnotation } from './../token';
import { MimeRenderer } from './renderer';

const FC_MIME_TYPE = 'application/FCStd';
const JCAD_MIME_TYPE = 'application/Jcad';

/**
 * Extension definition.
 */
const notebookRendererPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:notebookRenderer',
  autoStart: true,
  requires: [IRenderMimeRegistry, IDocumentProviderFactory, IAnnotation],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    docProviderFactory: IDocumentProviderFactory,
    annotationModel: IAnnotationModel
  ) => {
    const namespace = 'jupytercad-mimedocuments';
    const tracker = new WidgetTracker<MimeDocument>({ namespace });
    const createRenderer =
      (modelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>) =>
      (renderOptions: IRenderMime.IRendererOptions) =>
        new MimeRenderer({
          manager: app.serviceManager,
          docProviderFactory,
          modelFactory,
          renderOptions
        });

    const fcModelFactory = new JupyterCadFCModelFactory({ annotationModel });
    const fcRendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [FC_MIME_TYPE],
      createRenderer: createRenderer(fcModelFactory)
    };
    const fcExtension: IRenderMime.IExtension = {
      id: 'jupytercad:notebookFcRenderer',
      rendererFactory: fcRendererFactory,
      rank: 1000,
      dataType: 'string'
    };
    const fcMimePlugin = createRendermimePlugin(tracker, fcExtension);
    fcMimePlugin.activate(app, rendermime);

    const jcadModelFactory = new JupyterCadJcadModelFactory({
      annotationModel
    });
    const jcadRendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [JCAD_MIME_TYPE],
      createRenderer: createRenderer(jcadModelFactory)
    };
    const jcadExtension: IRenderMime.IExtension = {
      id: 'jupytercad:notebookJcadRenderer',
      rendererFactory: jcadRendererFactory,
      rank: 1000,
      dataType: 'string'
    };
    const jcadMimePlugin = createRendermimePlugin(tracker, jcadExtension);
    jcadMimePlugin.activate(app, rendermime);
  }
};

export default notebookRendererPlugin;
