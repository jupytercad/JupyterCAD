import { IJCadModel } from './../_interface/jcad.d';
import { IDict } from './../types';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import formSchema from '../_interface/forms.json';
import { IJupyterCadDoc } from '../types';
import { JupyterCadModel } from './../model';
import { User } from '@jupyterlab/services';

export class ToolbarModel {
  constructor(options: ToolbarModel.IOptions) {
    this._context = options.context;
    this._prepareSchema();
  }
  get sharedModel(): IJupyterCadDoc | undefined {
    return this._sharedModel;
  }

  get formSchema(): IDict {
    return this._formSchema;
  }

  get allObject(): IJCadModel {
    return this._context.model.getAllObject();
  }

  get users(): Map<number, User.IIdentity>{
    const state = this._sharedModel?.awareness.getStates()
    console.log('state', state);
    
    const users = new Map<number, User.IIdentity>()
    if(state){
      state.forEach((val, key)=>{
        users.set(key, val.user)
      })
    }
    return users
  }

  async ready(): Promise<void> {
    await this._context.ready;
    this._sharedModel = this._context.model.sharedModel;
  }

  private _prepareSchema(): void {
    Object.keys(this._formSchema).forEach(key => {
      if (key === 'Placement of the box') {
        return;
      }
      const value = this._formSchema[key];
      value['required'] = ['Name', ...value['required']];
      value['properties'] = {
        Name: { type: 'string', description: 'The name of object' },
        ...value['properties']
      };
    });
  }

  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private _sharedModel?: IJupyterCadDoc;
  private _formSchema = JSON.parse(JSON.stringify(formSchema));
}

export namespace ToolbarModel {
  export interface IOptions {
    context: DocumentRegistry.IContext<JupyterCadModel>;
  }
}
