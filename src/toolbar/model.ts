import { Signal, ISignal } from '@lumino/signaling';
import { IJCadModel } from './../_interface/jcad.d';
import { IDict } from './../types';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import formSchema from '../_interface/forms.json';
import { IJupyterCadDoc } from '../types';
import { JupyterCadModel } from './../model';
import { User } from '@jupyterlab/services';

export interface IUserData {
  userId: number;
  userData: User.IIdentity;
}

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

  get currentUserId(): number | undefined {
    return this.sharedModel?.awareness.clientID;
  }

  get users(): IUserData[] {
    this._usersMap = this._sharedModel?.awareness.getStates();
    const users: IUserData[] = [];
    if (this._usersMap) {
      this._usersMap.forEach((val, key) => {
        users.push({ userId: key, userData: val.user });
      });
    }
    return users;
  }

  get userChanged(): ISignal<this, IUserData[]> {
    return this._userChanged;
  }

  async ready(): Promise<void> {
    await this._context.ready;
    this._sharedModel = this._context.model.sharedModel;
    this._sharedModel.awareness.on('change', update => {
      if (update.added.length || update.removed.length) {
        this._userChanged.emit(this.users);
      }
    });
  }

  setUserToFollow(userId?: number): void {
    if (this._sharedModel) {
      this._sharedModel.awareness.setLocalStateField('remoteUser', userId);
    }
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
  private _userChanged = new Signal<this, IUserData[]>(this);
  private _usersMap?: Map<number, any>;
}

export namespace ToolbarModel {
  export interface IOptions {
    context: DocumentRegistry.IContext<JupyterCadModel>;
  }
}
