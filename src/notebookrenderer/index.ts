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
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

import { IAnnotationModel } from '../types';
import { IAnnotation } from './../token';
import { NotebookRendererModelFactory } from './modelFactory';
import { IJupyterCadWidgetRegistry } from './token';
import { NotebookRenderer } from './view';
import { WidgetManager, WidgetManagerRegister } from './widgetManager';

const MIME_TYPE = 'application/FCStd';

export const notebookRendererPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:notebookRenderer',
  autoStart: true,
  requires: [
    IRenderMimeRegistry,
    IAnnotation,
    INotebookTracker,
    IJupyterCadWidgetRegistry
  ],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    annotationModel: IAnnotationModel,
    nbTracker: INotebookTracker,
    wmRegistry: IJupyterCadWidgetRegistry
  ) => {
    const rendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: options => {
        const kernel = nbTracker.currentWidget?.sessionContext.session?.kernel;
        const widgetManager = wmRegistry.getWidgetManager(kernel?.id);
        const mimeType = options.mimeType;
        const modelFactory = new NotebookRendererModelFactory({
          manager: app.serviceManager,
          widgetManager,
          annotationModel
        });
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

export const ypyWidgetManager: JupyterFrontEndPlugin<IJupyterCadWidgetRegistry> =
  {
    id: 'jupytercad:serverInfoPlugin',
    autoStart: true,
    requires: [INotebookTracker],
    provides: IJupyterCadWidgetRegistry,
    activate: (
      app: JupyterFrontEnd,
      tracker: INotebookTracker
    ): IJupyterCadWidgetRegistry => {
      const registry = new WidgetManagerRegister();
      const onKernelChanged = (
        _: ISessionContext,
        changedArgs: IChangedArgs<
          IKernelConnection | null,
          IKernelConnection | null,
          'kernel'
        >
      ) => {
        const { newValue, oldValue } = changedArgs;
        if (newValue) {
          registry.removeWidgetManager(oldValue?.id);
          const wm = new WidgetManager(newValue);
          registry.registerWidgetManager(newValue.id, wm);
          newValue.disposed.connect(() => {
            registry.removeWidgetManager(newValue.id);
          });
        }
      };
      tracker.widgetAdded.connect(async (_, notebook) => {
        notebook.sessionContext.kernelChanged.connect(onKernelChanged);
        notebook.disposed.connect(() => {
          notebook.sessionContext.kernelChanged.disconnect(onKernelChanged);
        });
      });

      return registry;
    }
  };
