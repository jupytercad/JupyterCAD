import { MapChange, YDocument } from '@jupyter/ydoc';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { JSONExt, JSONObject, PartialJSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import Ajv from 'ajv';
import * as Y from 'yjs';

import {
  IJCadContent,
  IJCadModel,
  IJCadObject,
  IJCadOptions
} from './_interface/jcad';
import jcadSchema from './schema/jcad.json';
import {
  Camera,
  IAnnotationModel,
  IDict,
  IJcadObjectDocChange,
  IJupyterCadClientState,
  IJupyterCadDoc,
  IJupyterCadDocChange,
  IJupyterCadModel,
  IUserData,
  Pointer
} from './types';
import { DocumentRegistry } from '@jupyterlab/docregistry';

export class JupyterCadModel implements IJupyterCadModel {
  constructor(options: JupyterCadModel.IOptions) {
    const { annotationModel, sharedModel } = options;
    if (sharedModel) {
      this._sharedModel = sharedModel;
    } else {
      this._sharedModel = JupyterCadDoc.create();
    }
    this.sharedModel.awareness.on('change', this._onClientStateChanged);
    this.annotationModel = annotationModel;
  }

  readonly collaborative = true;

  get sharedModel(): IJupyterCadDoc {
    return this._sharedModel;
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

  get localState(): IJupyterCadClientState | null {
    return this.sharedModel.awareness.getLocalState() as IJupyterCadClientState | null;
  }

  get clientStateChanged(): ISignal<this, Map<number, IJupyterCadClientState>> {
    return this._clientStateChanged;
  }

  get sharedMetadataChanged(): ISignal<IJupyterCadDoc, MapChange> {
    return this.sharedModel.metadataChanged;
  }

  get sharedOptionsChanged(): ISignal<IJupyterCadDoc, MapChange> {
    return this.sharedModel.optionsChanged;
  }

  get sharedObjectsChanged(): ISignal<IJupyterCadDoc, IJcadObjectDocChange> {
    return this.sharedModel.objectsChanged;
  }

  get disposed(): ISignal<JupyterCadModel, void> {
    return this._disposed;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._sharedModel.dispose();
    this._disposed.emit();
    Signal.clearData(this);
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
      this.sharedModel.addObjects(jsonData.objects);
      this.sharedModel.setOptions(jsonData.options ?? {});
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
    return {
      objects: this.sharedModel.objects,
      options: this.sharedModel.options
    };
  }

  getAllObject(): IJCadModel {
    return this.sharedModel.objects;
  }

  syncPointer(pointer?: Pointer, emitter?: string): void {
    this.sharedModel.awareness.setLocalStateField('pointer', {
      value: pointer,
      emitter: emitter
    });
  }

  syncCamera(camera?: Camera, emitter?: string): void {
    this.sharedModel.awareness.setLocalStateField('camera', {
      value: camera,
      emitter: emitter
    });
  }

  syncSelectedObject(name: string[], emitter?: string): void {
    this.sharedModel.awareness.setLocalStateField('selected', {
      value: name,
      emitter: emitter
    });
  }

  syncSelectedPropField(data: {
    id: string | null;
    value: any;
    parentType: 'panel' | 'dialog';
  }): void {
    this.sharedModel.awareness.setLocalStateField('selectedPropField', data);
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

  getClientId(): number {
    return this.sharedModel.awareness.clientID;
  }

  addMetadata(key: string, value: string): void {
    this.sharedModel.setMetadata(key, value);
  }

  removeMetadata(key: string): void {
    this.sharedModel.removeMetadata(key);
  }

  private _onClientStateChanged = changed => {
    const clients = this.sharedModel.awareness.getStates() as Map<
      number,
      IJupyterCadClientState
    >;

    this._clientStateChanged.emit(clients);

    this._sharedModel.awareness.on('change', update => {
      if (update.added.length || update.removed.length) {
        this._userChanged.emit(this.users);
      }
    });
  };

  readonly defaultKernelName: string = '';
  readonly defaultKernelLanguage: string = '';
  readonly annotationModel?: IAnnotationModel;

  private _sharedModel: IJupyterCadDoc;

  private _dirty = false;
  private _readOnly = false;
  private _isDisposed = false;

  private _userChanged = new Signal<this, IUserData[]>(this);
  private _usersMap?: Map<number, any>;

  private _disposed = new Signal<this, void>(this);
  private _contentChanged = new Signal<this, void>(this);
  private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
  private _themeChanged = new Signal<this, IChangedArgs<any>>(this);
  private _clientStateChanged = new Signal<
    this,
    Map<number, IJupyterCadClientState>
  >(this);

  static worker: Worker;
}

export class JupyterCadDoc
  extends YDocument<IJupyterCadDocChange>
  implements IJupyterCadDoc
{
  constructor() {
    super();

    this._options = this.ydoc.getMap<Y.Map<any>>('options');
    this._objects = this.ydoc.getArray<Y.Map<any>>('objects');
    this._metadata = this.ydoc.getMap<string>('metadata');
    this.undoManager.addToScope(this._objects);

    this._objects.observeDeep(this._objectsObserver);
    this._metadata.observe(this._metaObserver);
    this._options.observe(this._optionsObserver);
  }

  dispose(): void {
    this._objects.unobserveDeep(this._objectsObserver);
    this._metadata.unobserve(this._metaObserver);
    this._options.unobserve(this._optionsObserver);
    super.dispose();
  }

  get version(): string {
    return '0.1.0';
  }

  get objects(): Array<IJCadObject> {
    return this._objects.map(
      obj => JSONExt.deepCopy(obj.toJSON()) as IJCadObject
    );
  }

  get options(): JSONObject {
    return JSONExt.deepCopy(this._options.toJSON());
  }

  get metadata(): JSONObject {
    return JSONExt.deepCopy(this._metadata.toJSON());
  }

  get objectsChanged(): ISignal<IJupyterCadDoc, IJcadObjectDocChange> {
    return this._objectsChanged;
  }

  get optionsChanged(): ISignal<IJupyterCadDoc, MapChange> {
    return this._optionsChanged;
  }

  get metadataChanged(): ISignal<IJupyterCadDoc, MapChange> {
    return this._metadataChanged;
  }

  objectExists(name: string): boolean {
    return Boolean(this._getObjectAsYMapByName(name));
  }

  getObjectByName(name: string): IJCadObject | undefined {
    const obj = this._getObjectAsYMapByName(name);
    if (obj) {
      return JSONExt.deepCopy(obj.toJSON()) as IJCadObject;
    }
    return undefined;
  }

  removeObjectByName(name: string): void {
    let index = 0;
    for (const obj of this._objects) {
      if (obj.get('name') === name) {
        break;
      }
      index++;
    }

    if (this._objects.length > index) {
      this.transact(() => {
        this._objects.delete(index);
      });
    }
  }

  addObject(value: IJCadObject): void {
    this.addObjects([value]);
  }

  addObjects(value: Array<IJCadObject>): void {
    this.transact(() => {
      value.map(obj => {
        if (!this.objectExists(obj.name)) {
          this._objects.push([new Y.Map(Object.entries(obj))]);
        } else {
          console.error('There is already an object with the name:', obj.name);
        }
      });
    });
  }

  updateObjectByName(name: string, key: string, value: any): void {
    const obj = this._getObjectAsYMapByName(name);
    if (!obj) {
      return;
    }
    this.transact(() => obj.set(key, value));
  }

  getOption(key: keyof IJCadOptions): IDict | undefined {
    const content = this._options.get(key);
    if (!content) {
      return;
    }
    return JSONExt.deepCopy(content) as IDict;
  }

  setOption(key: keyof IJCadOptions, value: IDict): void {
    this._options.set(key, value);
  }

  setOptions(options: IJCadOptions): void {
    for (const [key, value] of Object.entries(options)) {
      this._options.set(key, value);
    }
  }

  getMetadata(key: string): string | undefined {
    return this._metadata.get(key);
  }

  setMetadata(key: string, value: string): void {
    this._metadata.set(key, value);
  }

  removeMetadata(key: string): void {
    if (this._metadata.has(key)) {
      this._metadata.delete(key);
    }
  }

  static create(): IJupyterCadDoc {
    return new JupyterCadDoc();
  }

  private _getObjectAsYMapByName(name: string): Y.Map<any> | undefined {
    for (const obj of this._objects) {
      if (obj.get('name') === name) {
        return obj;
      }
    }
    return undefined;
  }

  private _objectsObserver = (events: Y.YEvent<any>[]): void => {
    const changes: Array<{
      name: string;
      key: string;
      newValue: IJCadObject;
    }> = [];

    events.forEach(event => {
      const name = event.target.get('name');
      if (name) {
        event.keys.forEach((change, key) => {
          changes.push({
            name,
            key,
            newValue: JSONExt.deepCopy(event.target.toJSON())
          });
        });
      }
    });

    this._changed.emit({ objectChange: changes });
    this._objectsChanged.emit({ objectChange: changes });
  };

  private _metaObserver = (event: Y.YMapEvent<string>): void => {
    this._metadataChanged.emit(event.keys);
  };

  private _optionsObserver = (event: Y.YMapEvent<Y.Map<string>>): void => {
    this._optionsChanged.emit(event.keys);
  };

  private _objects: Y.Array<Y.Map<any>>;
  private _options: Y.Map<any>;
  private _metadata: Y.Map<string>;
  private _metadataChanged = new Signal<IJupyterCadDoc, MapChange>(this);
  private _optionsChanged = new Signal<IJupyterCadDoc, MapChange>(this);
  private _objectsChanged = new Signal<IJupyterCadDoc, IJcadObjectDocChange>(
    this
  );
}

export namespace JupyterCadModel {
  export interface IOptions
    extends DocumentRegistry.IModelOptions<IJupyterCadDoc> {
    annotationModel?: IAnnotationModel;
  }
}
