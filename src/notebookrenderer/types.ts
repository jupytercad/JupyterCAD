import { IDocumentProviderFactory } from '@jupyterlab/docprovider';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ServiceManager } from '@jupyterlab/services';

import { IJupyterCadModel } from '../types';

export const CLASS_NAME = 'mimerenderer-jupytercad';

export interface INotebookRendererOptions {
  manager: ServiceManager.IManager;
  docProviderFactory: IDocumentProviderFactory;
  modelFactory: DocumentRegistry.IModelFactory<IJupyterCadModel>;
}
