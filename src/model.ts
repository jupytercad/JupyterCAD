import { DocumentRegistry } from '@jupyterlab/docregistry';

import { IModelDB, ModelDB } from '@jupyterlab/observables';

import { ISignal, Signal } from '@lumino/signaling';

import { PartialJSONObject } from '@lumino/coreutils';

import { IChangedArgs } from '@jupyterlab/coreutils';

import { YDocument, MapChange } from '@jupyterlab/shared-models';

import { JcadObjectDoc } from './objectmodel';
import { IDict, IJCadContent, IJcadModel, Position } from './types';

import * as Y from 'yjs';

// import initOpenCascade, { OpenCascadeInstance } from 'opencascade.js';
// import worker from './worker?raw';

export class JupyterCadModel implements DocumentRegistry.IModel {
  constructor(languagePreference?: string, modelDB?: IModelDB) {
    this.modelDB = modelDB || new ModelDB();
    console.log('clientID', this.sharedModel.awareness.clientID);

    this.sharedModel.awareness.on('change', this._onCameraChanged);
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

  get themeChanged(): Signal<
    this,
    IChangedArgs<string, string | null, string>
  > {
    return this._themeChanged;
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
    return JSON.stringify(this.getContent(), null, 2);
  }

  fromString(data: string): void {
    const jsonData: IJCadContent = JSON.parse(data);
    this.sharedModel.transact(() => {
      for (const [id, obj] of Object.entries(jsonData.objects)) {
        const entries = Object.entries({ ...obj, id });
        const jcadObj = new JcadObjectDoc(entries);
        this.sharedModel.setObject(id, jcadObj);
      }
      const options = jsonData.options;
      if (options) {
        for (const [opt, val] of Object.entries(options)) {
          this.sharedModel.setOption(opt, val);
        }
      }
    });
  }

  toJSON(): PartialJSONObject {
    return JSON.parse(this.toString());
  }

  fromJSON(data: PartialJSONObject): void {
    // nothing to do
  }

  initialize(): void {
    // nothing to do
  }

  getWorker(): Worker {
    if (!JupyterCadModel.worker) {
      JupyterCadModel.worker = new Worker(
        new URL('./worker', (import.meta as any).url)
      );
    }
    return JupyterCadModel.worker;
  }

  getContent(): IJCadContent {
    const content: IJCadContent = { objects: {}, options: {} };
    const sharedContent = this.sharedModel.objects;
    sharedContent.forEach((obj, id) => {
      content.objects[id] = obj.getObject();
    });
    const sharedOption = this.sharedModel.options;
    if (sharedOption) {
      sharedOption.forEach((obj, id) => {
        content.options![id] = obj.getObject();
      });
    }
    return content;
  }

  getAllObject(): IJcadModel {
    const all: IJcadModel = {};
    this.sharedModel.objects.forEach((value, key) => {
      all[key] = value.getObject();
    });
    return all;
  }

  syncCamera(pos: Position | undefined): void {
    this.sharedModel.awareness.setLocalStateField('mouse', pos);
  }

  getClientId(): number {
    return this.sharedModel.awareness.clientID;
  }

  get cameraChanged(): ISignal<this, Map<number, any>> {
    return this._cameraChanged;
  }

  private _onCameraChanged = () => {
    const clients = this.sharedModel.awareness.getStates();
    this._cameraChanged.emit(clients);
  };

  readonly defaultKernelName: string = '';
  readonly defaultKernelLanguage: string = '';
  readonly modelDB: IModelDB;
  readonly sharedModel = JupyterCadDoc.create();

  private _dirty = false;
  private _readOnly = false;
  private _isDisposed = false;
  private _contentChanged = new Signal<this, void>(this);
  private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
  private _themeChanged = new Signal<this, IChangedArgs<any>>(this);
  private _cameraChanged = new Signal<this, Map<number, any>>(this);

  static worker: Worker;
}

export type JupyterCadDocChange = {
  contextChange?: MapChange;
  contentChange?: MapChange;
  objectChange?: Array<{
    name: string;
    oldValue: any;
    newValue: any;
  }>;
  optionChange?: MapChange;
};

export class JupyterCadDoc extends YDocument<JupyterCadDocChange> {
  constructor() {
    super();
    this._objects = this.ydoc.getMap<JcadObjectDoc>('objects');
    this._options = this.ydoc.getMap<any>('option');

    // this._mainViewState = this.ydoc.getMap('mainViewState');
    // this._mainViewState.observe(this._mainViewStateObserver);
  }

  dispose(): void {
    //** */
  }

  get objects(): Y.Map<JcadObjectDoc> {
    return this._objects;
  }
  get options(): Y.Map<any> {
    return this._options;
  }

  public static create(): JupyterCadDoc {
    return new JupyterCadDoc();
  }

  public getObject(key: string): JcadObjectDoc | undefined {
    return this._objects.get(key);
  }

  public setObject(key: string, value: JcadObjectDoc): void {
    this._objects.set(key, value);
  }

  public getOption(key: string): any {
    return this._options.get(key);
  }

  public setOption(key: string, value: any): void {
    this._options.set(key, value);
  }

  // public get mainViewStateChanged(): Signal<this, IJCadContent> {
  //   return this._mainViewStateChanged;
  // }

  // public getMainViewState(): IJCadContent {
  //   const ret: IJCadContent = {};
  //   for (const key of this._mainViewState.keys()) {
  //     ret[key] = this._mainViewState.get(key);
  //   }
  //   return ret;
  // }
  // public getMainViewStateByKey(key: keyof IJCadContent): any {
  //   return this._mainViewState.get(key);
  // }

  // public setMainViewState(key: keyof IJCadContent, value: any): void {
  //   this._mainViewState.set(key, value);
  // }

  private _mainViewStateObserver = (event: Y.YMapEvent<any>): void => {
    // const changes: IJCadContent = {
    //   id: event.target.doc?.clientID
    // };
    // event.keysChanged.forEach(key => {
    //   changes[key] = this.getMainViewStateByKey(key);
    // });
    // this._mainViewStateChanged.emit(changes);
  };

  private _objects: Y.Map<JcadObjectDoc>;
  private _options: Y.Map<any>;
  // private _mainViewState: Y.Map<any>;
  // private _mainViewStateChanged = new Signal<this, IJCadContent>(this);
}
