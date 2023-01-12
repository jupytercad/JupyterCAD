import { Signal, ISignal } from '@lumino/signaling';
import { IJCadModel } from './../_interface/jcad.d';
import { IDict, IJupyterCadModel } from './../types';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import formSchema from '../_interface/forms.json';
import { IJupyterCadDoc } from '../types';
import { JupyterCadModel } from './../model';
import { User } from '@jupyterlab/services';
import { JupyterCadPanel } from '../widget';

export interface IUserData {
  userId: number;
  userData: User.IIdentity;
}

export class ToolbarModel {
  constructor(options: ToolbarModel.IOptions) {
    this._panel = options.panel;
    this._context = options.context;
    this._context.ready.then(() => {
      this._filePath = this._context.path;
    });

    this._prepareSchema();
  }

  get panel(): JupyterCadPanel {
    return this._panel;
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

  get jcadModel(): IJupyterCadModel | undefined {
    return this._context.model;
  }

  get filePath(): string | undefined {
    return this._filePath;
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

  syncFormData(form: any): void {
    if (this._sharedModel) {
      this._sharedModel.awareness.setLocalStateField('toolbarForm', form);
    }
  }

  syncSelectedPropField = (
    id: string | null,
    value: any,
    parentType: 'panel' | 'dialog'
  ): void => {
    this.jcadModel?.syncSelectedPropField({
      parentType,
      id,
      value
    });
  };

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

  private _panel: JupyterCadPanel;
  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private _sharedModel?: IJupyterCadDoc;
  private _formSchema = JSON.parse(JSON.stringify(formSchema));
  private _userChanged = new Signal<this, IUserData[]>(this);
  private _usersMap?: Map<number, any>;
  private _filePath?: string;
}

export namespace ToolbarModel {
  export interface IOptions {
    panel: JupyterCadPanel;
    context: DocumentRegistry.IContext<JupyterCadModel>;
  }
}
