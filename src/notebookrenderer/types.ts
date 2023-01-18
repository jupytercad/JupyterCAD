import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { ServiceManager } from '@jupyterlab/services';

import { IJupyterCadModel } from '../types';

export const CLASS_NAME = 'mimerenderer-jupytercad';

export interface INotebookRendererOptions {
  manager: ServiceManager.IManager;
  docProviderFactory: IDocumentProviderFactory;
  modelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>;
  renderOptions: IRenderMime.IRendererOptions;
}
