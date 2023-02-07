import {
  createRendermimePlugin,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISessionContext, WidgetTracker } from '@jupyterlab/apputils';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { MimeDocument } from '@jupyterlab/docregistry';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { ServerConnection } from '@jupyterlab/services';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

import { IAnnotationModel, IDict } from '../types';
import { IAnnotation } from './../token';
import { NotebookRendererModelFactory } from './modelFactory';
import { NotebookRenderer } from './view';

const MIME_TYPE = 'application/FCStd';

export const notebookRendererPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:notebookRenderer',
  autoStart: true,
  requires: [IRenderMimeRegistry, IAnnotation],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    annotationModel: IAnnotationModel
  ) => {
    const modelFactory = new NotebookRendererModelFactory({
      manager: app.serviceManager,
      annotationModel
    });

    const rendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: options => {
        const mimeType = options.mimeType;
        return new NotebookRenderer({ mimeType, factory: modelFactory });
      }
    };

    const namespace = 'jupytercad-mimedocuments';
    const tracker = new WidgetTracker<MimeDocument>({ namespace });
    const extension: IRenderMime.IExtension = {
      id: 'jupytercad:notebookRenderer',
      rendererFactory,
      rank: 1000,
      dataType: 'string'
    };
    const mimePlugin = createRendermimePlugin(tracker, extension);

    mimePlugin.activate(app, rendermime);
  }
};

function generatePythonCode(data: IDict): string {
  const variables = JSON.stringify(data);
  return `
import os
os.environ['__JUPYTERCAD_SERVER_INFO__'] = '${variables}'
  `;
}

export const serverInfoPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:serverInfoPlugin',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, tracker: INotebookTracker) => {
    const serverSettings = ServerConnection.makeSettings();
    const { appUrl, baseUrl, token, wsUrl } = serverSettings;
    const onKernelChanged = (
      _: ISessionContext,
      changedArgs: IChangedArgs<
        IKernelConnection | null,
        IKernelConnection | null,
        'kernel'
      >
    ) => {
      if (changedArgs.newValue) {
        const kernelConnection = changedArgs.newValue;
        const msg = kernelConnection.requestExecute({
          code: generatePythonCode({ appUrl, baseUrl, token, wsUrl })
        });
        msg.onReply = e => {
          if (e.content.status === 'error') {
            console.error(e.content);
          }
        };
      }
    };
    tracker.widgetAdded.connect(async (_, notebook) => {
      notebook.sessionContext.kernelChanged.connect(onKernelChanged);
      notebook.disposed.connect(() => {
        notebook.sessionContext.kernelChanged.disconnect(onKernelChanged);
      });
    });
  }
};
