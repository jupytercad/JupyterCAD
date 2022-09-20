import { DocumentRegistry } from '@jupyterlab/docregistry';

import { IJupyterCadDoc } from '../types';
import { JupyterCadModel } from './../model';

export class ToolbarModel {
  constructor(options: ToolbarModel.IOptions) {
    this._context = options.context;
  }
  get sharedModel(): IJupyterCadDoc | undefined {
    return this._sharedModel;
  }
  async ready(): Promise<void> {
    await this._context.ready;
    this._sharedModel = this._context.model.sharedModel;
  }

  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private _sharedModel?: IJupyterCadDoc;
}

export namespace ToolbarModel {
  export interface IOptions {
    context: DocumentRegistry.IContext<JupyterCadModel>;
  }
}
