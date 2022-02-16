import { IChangedArgs } from '@jupyterlab/coreutils';
import { IModelDB, ModelDB } from '@jupyterlab/observables';
import { YDocument } from '@jupyterlab/shared-models';
import { PartialJSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import * as Y from 'yjs';
import { JcadObjectDoc } from './objectmodel';

// import { JcadObjectDoc } from './objectmodel';
import {
  IJCadContent,
  IJcadModel,
  IJcadObject,
  IJcadObjectDoc,
  // IJcadObjectDoc,
  IJupyterCadDoc,
  IJupyterCadDocChange,
  IJupyterCadModel,
  Position
} from './types';

// import initOpenCascade, { OpenCascadeInstance } from 'opencascade.js';
// import worker from './worker?raw';

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
    this.sharedModel.transact(() => {
      for (const [id, obj] of Object.entries(jsonData.objects)) {
        const entries = Object.entries({ ...obj, id });
        const jcadObj = new Y.Map<any>(entries);
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
    const content: IJCadContent = { objects: {}, options: {} };
    const sharedContent = this.sharedModel.objects;
    sharedContent.forEach((obj, id) => {
      const newObj = {};
      for (const [key, value] of obj.entries()) {
        if (key !== 'id') {
          newObj[key] = value;
        }
      }

      content.objects[id] = newObj as IJcadObject;
    });
    const sharedOption = this.sharedModel.options;
    if (sharedOption) {
      sharedOption.forEach((obj, id) => {
        content.options![id] = obj;
      });
    }
    return content;
  }

  getAllObject(): IJcadModel {
    const all: IJcadModel = {};
    this.sharedModel.objects.forEach((value, key) => {
      if (value) {
        all[key] = JcadObjectDoc.yMapToJcadObject(value);
      }
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
    this._objects = this.ydoc.getMap<IJcadObjectDoc>('objects');
    this._options = this.ydoc.getMap<any>('option');
    this._objects.observe(this._objectsObserver);
    // this._options.observe(this._optionsObserver);
    // this._mainViewState = this.ydoc.getMap('mainViewState');
    // this._mainViewState.observe(this._mainViewStateObserver);
  }

  dispose(): void {
    this._objects.unobserve(this._objectsObserver);
    // this._options.unobserve(this._optionsObserver);
  }

  get objects(): Y.Map<IJcadObjectDoc> {
    return this._objects;
  }
  get options(): Y.Map<any> {
    return this._options;
  }

  public getObjectById(key: string): IJcadObjectDoc | undefined {
    return this._objects.get(key);
  }

  public setObject(key: string, value: IJcadObjectDoc): void {
    this._objects.set(key, value);
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

  private _objectsObserver = (event: Y.YMapEvent<any>): void => {
    event.changes.keys.forEach((val, key) => {
      if (val.action === 'add') {
        this._objects.get(key)?.observe(this.emitChange);
      } else if (val.action === 'delete') {
        val.oldValue.unobserve(this.emitChange);
      }
    });

    const objectChange = [];
    this._changed.emit({ objectChange });
  };

  private emitChange = () => {
    this._changed.emit({});
  };

  private _objects: Y.Map<IJcadObjectDoc>;
  private _options: Y.Map<any>;
  private initialized = false;
}
