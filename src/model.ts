import { DocumentRegistry } from '@jupyterlab/docregistry';

import { IModelDB, ModelDB } from '@jupyterlab/observables';

import { ISignal, Signal } from '@lumino/signaling';

import { PartialJSONObject } from '@lumino/coreutils';

import { IChangedArgs } from '@jupyterlab/coreutils';

import { YDocument, MapChange } from '@jupyterlab/shared-models';

import * as Y from 'yjs';

export class JupyterCadModel implements DocumentRegistry.IModel {
  constructor(languagePreference?: string, modelDB?: IModelDB) {
    this.modelDB = modelDB || new ModelDB();
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  get contentChanged(): ISignal<this, void> {
    return this._contentChanged;
  }

  get stateChanged(): ISignal<this, IChangedArgs<any, any, string>> {
    return this._stateChanged;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    Signal.clearData(this);
  }

  get dirty(): boolean {
    return this._dirty;
  }
  set dirty(value: boolean) {
    this._dirty = value;
  }

  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(value: boolean) {
    this._readOnly = value;
  }

  toString(): string {
    return JSON.stringify(this.modelDB.getValue('content'));
  }

  fromString(data: string): void {
    if (!this.modelDB.has('content')) {
      this.modelDB.createValue('content');
    }
    this.modelDB.setValue('content', data);
  }

  toJSON(): PartialJSONObject {
    return {};
  }

  fromJSON(data: PartialJSONObject): void {}

  initialize(): void {
    // nothing to do
  }

  readonly defaultKernelName: string = '';
  readonly defaultKernelLanguage: string = '';
  readonly modelDB: IModelDB;
  readonly sharedModel = JupyterCadDoc.create();

  private _dirty = false;
  private _readOnly = false;
  private _isDisposed = false;
  private _contentChanged = new Signal<this, void>(this);
  private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
}

export type JupyterCadDocChange = {
contextChange?: MapChange;
  contentChange?: string;
};

export class JupyterCadDoc extends YDocument<JupyterCadDocChange> {
  constructor() {
    super();
    this._content = this.ydoc.getMap('content');
  }

  dispose(): void {
    console.log('called');
  }

  public static create(): JupyterCadDoc {
    return new JupyterCadDoc();
  }

  public getContent(key: string): any {
    return this._content.get(key);
  }

  public setContent(key: string, value: any): void {
    this._content.set(key, value);
  }

  private _content: Y.Map<any>;
}
