import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISessionContext } from '@jupyterlab/apputils';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Kernel } from '@jupyterlab/services';
import { ITranslator } from '@jupyterlab/translation';

import { NotebookRendererModel } from './model';
import { IJupyterCadWidgetManager } from './token';
import { NotebookRenderer } from './view';
import { JupyterCadWidgetManager } from './widgetManager';

const MIME_TYPE = 'application/FCStd';

export const notebookRendererPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:notebookRenderer',
  autoStart: true,
  optional: [IRenderMimeRegistry, INotebookTracker, IJupyterCadWidgetManager],
  activate: (
    app: JupyterFrontEnd,
    rendermime?: IRenderMimeRegistry,
    nbTracker?: INotebookTracker,
    wmManager?: IJupyterCadWidgetManager
  ) => {
    if (!rendermime || !nbTracker || !wmManager) {
      return;
    }
    const rendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: options => {
        const kernelId =
          nbTracker.currentWidget?.sessionContext.session?.kernel?.id;
        const mimeType = options.mimeType;
        const modelFactory = new NotebookRendererModel({
          kernelId,
          widgetManager: wmManager
        });
        return new NotebookRenderer({ mimeType, factory: modelFactory });
      }
    };
    rendermime.addFactory(rendererFactory, -100);
  }
};

export const ypyWidgetManager: JupyterFrontEndPlugin<IJupyterCadWidgetManager> =
  {
    id: 'jupytercad:serverInfoPlugin',
    autoStart: true,
    requires: [INotebookTracker, ITranslator],
    provides: IJupyterCadWidgetManager,
    activate: (
      app: JupyterFrontEnd,
      tracker: INotebookTracker,
      translator: ITranslator
    ): IJupyterCadWidgetManager => {
      const registry = new JupyterCadWidgetManager({
        manager: app.serviceManager,
        translator
      });
      const onKernelChanged = (
        _: ISessionContext,
        changedArgs: IChangedArgs<
          Kernel.IKernelConnection | null,
          Kernel.IKernelConnection | null,
          'kernel'
        >
      ) => {
        const { newValue, oldValue } = changedArgs;
        if (newValue) {
          registry.unregisterKernel(oldValue?.id);
          registry.registerKernel(newValue);
          newValue.disposed.connect(() => {
            registry.unregisterKernel(newValue.id);
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
