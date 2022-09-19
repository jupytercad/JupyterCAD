import { IChangedArgs } from '@jupyterlab/coreutils';
import { IModelDB, ModelDB } from '@jupyterlab/observables';
import { YDocument } from '@jupyterlab/shared-models';
import { PartialJSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import Ajv from 'ajv';
import * as Y from 'yjs';

import { IJCadContent, IJCadModel } from './_interface/jcad';
import jcadSchema from './schema/jcad.json';
import {
  IJCadObjectDoc,
  IJupyterCadDoc,
  IJupyterCadDocChange,
  IJupyterCadModel,
  Position
} from './types';
import { yMapToJcadObject } from './tools';

export class JupyterCadModel implements IJupyterCadModel {
  constructor(languagePreference?: string, modelDB?: IModelDB) {
    this.modelDB = modelDB || new ModelDB();
    this.sharedModel.changed.connect(this._onSharedModelChanged);
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

  get sharedModelChanged(): ISignal<this, IJupyterCadDocChange> {
    return this._sharedModelChanged;
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
    const ajv = new Ajv();
    const validate = ajv.compile(jcadSchema);
    const valid = validate(jsonData);
    if (!valid) {
      throw Error('File format error');
    }
    this.sharedModel.transact(() => {
      for (const obj of jsonData.objects) {
        const entries = Object.entries(obj);
        const jcadObj = new Y.Map<any>(entries);
        this.sharedModel.addObject(jcadObj);
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
    //
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
    const content: IJCadContent = { objects: [], options: {} };
    const sharedContent = this.sharedModel.objects;
    sharedContent.forEach((obj, id) => {
      const newObj = yMapToJcadObject(obj);
      content.objects[id] = newObj;
    });
    const sharedOption = this.sharedModel.options;
    if (sharedOption) {
      sharedOption.forEach((obj, id) => {
        content.options![id] = obj;
      });
    }
    return content;
  }

  getAllObject(): IJCadModel {
    const all: IJCadModel = [];
    this.sharedModel.objects.forEach(obj => {
      all.push(yMapToJcadObject(obj));
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

  private _onSharedModelChanged = (
    sender: IJupyterCadDoc,
    changes: IJupyterCadDocChange
  ): void => {
    this._sharedModelChanged.emit(changes);
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
  private _sharedModelChanged = new Signal<this, IJupyterCadDocChange>(this);
  static worker: Worker;
}

export class JupyterCadDoc
  extends YDocument<IJupyterCadDocChange>
  implements IJupyterCadDoc
{
  constructor() {
    super();

    this._objects = this.ydoc.getArray<IJCadObjectDoc>('objects');
    this._options = this.ydoc.getMap<any>('options');

    this._objects.observe(this._objectsObserver);
  }

  dispose(): void {
    // this._objects.unobserve(this._objectsObserver);
    // this._options.unobserve(this._optionsObserver);
  }

  get objects(): Y.Array<IJCadObjectDoc> {
    return this._objects;
  }
  get options(): Y.Map<any> {
    return this._options;
  }

  public getObjectById(key: number): IJCadObjectDoc | undefined {
    for (const iterator of this._objects) {
      if (iterator.get('id') === key) {
        return iterator;
      }
    }
    return undefined;
  }

  public addObject(value: IJCadObjectDoc): void {
    this._objects.push([value]);
  }

  public getOption(key: string): any {
    return this._options.get(key);
  }

  public setOption(key: string, value: any): void {
    this._options.set(key, value);
  }

  public static create(): IJupyterCadDoc {
    return new JupyterCadDoc();
  }

  private _objectsObserver = (event: Y.YArrayEvent<IJCadObjectDoc>): void => {

    event.changes.added.forEach(item => {
      const type = (item.content as Y.ContentType).type as Y.Map<any>;
      type.observe(this.emitChange);
    });
    event.changes.deleted.forEach(item => {
      const type = (item.content as Y.ContentType).type as Y.Map<any>;
      type.unobserve(this.emitChange);
    });
    const objectChange = [];
    this._changed.emit({ objectChange });
  };

  private emitChange = () => {
    this._changed.emit({});
  };

  private _objects: Y.Array<IJCadObjectDoc>;
  private _options: Y.Map<any>;
}
