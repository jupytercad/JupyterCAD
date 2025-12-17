import { MapChange } from '@jupyter/ydoc';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { PartialJSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import Ajv from 'ajv';

import { IJCadContent, IJCadModel, IJCadObject } from './_interface/jcad';
import { JupyterCadDoc } from './doc';
import {
  Camera,
  IAnnotationModel,
  IJcadObjectDocChange,
  IJupyterCadClientState,
  IJupyterCadDoc,
  IJupyterCadModel,
  ISelection,
  IUserData,
  Pointer,
  IJCadSettings
} from './interfaces';
import jcadSchema from './schema/jcad.json';
import { Contents } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const SETTINGS_ID = '@jupytercad/jupytercad-core:jupytercad-settings';

export class JupyterCadModel implements IJupyterCadModel {
  constructor(options: JupyterCadModel.IOptions) {
    const { annotationModel, sharedModel, settingRegistry } = options;
    if (sharedModel) {
      this._sharedModel = sharedModel;
    } else {
      this._sharedModel = this.createSharedModel();
    }
    this._connectSignal();
    this.annotationModel = annotationModel;
    this.settingRegistry = settingRegistry;
    this._copiedObject = null;
    this._pathChanged = new Signal<JupyterCadModel, string>(this);
    this._settingsChanged = new Signal<JupyterCadModel, string>(this);
  }

  /**
   * Initialize custom settings for JupyterLab.
   */
  async initSettings() {
    if (this.settingRegistry) {
      try {
        const setting = await this.settingRegistry.load(SETTINGS_ID);
        this._settings = setting;

        this._updateLocalSettings();

        setting.changed.connect(this._onSettingsChanged, this);
      } catch (error) {
        console.error(`Failed to load settings for ${SETTINGS_ID}:`, error);
        this._jcadSettings = {
          showAxesHelper: false,
          cameraType: 'Perspective'
        };
      }
    } else {
      this._jcadSettings = {
        showAxesHelper: false,
        cameraType: 'Perspective'
      };
    }
  }

  private _onSettingsChanged(): void {
    const oldSettings = this._jcadSettings;
    this._updateLocalSettings();
    const newSettings = this._jcadSettings;

    if (oldSettings.showAxesHelper !== newSettings.showAxesHelper) {
      this._settingsChanged.emit('showAxesHelper');
    }

    if (oldSettings.cameraType !== newSettings.cameraType) {
      this._settingsChanged.emit('cameraType');
    }
  }

  private _updateLocalSettings(): void {
    const composite = this._settings.composite;

    this._jcadSettings = {
      showAxesHelper: (composite.showAxesHelper as boolean) ?? false,
      cameraType:
        (composite.cameraType as 'Perspective' | 'Orthographic') ??
        'Perspective'
    };
  }

  get jcadSettings(): IJCadSettings {
    return this._jcadSettings;
  }

  /**
   * Expose the settingsChanged signal for external use.
   */
  get settingsChanged(): ISignal<JupyterCadModel, string> {
    return this._settingsChanged;
  }

  emitSettingChanged(settingName: string) {
    this._settingsChanged.emit(settingName);
  }

  /**
   * Return stored settings.
   */
  async getSettings(): Promise<ISettingRegistry.ISettings> {
    return this._settings;
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
    this._usersMap = this.sharedModel?.awareness.getStates();
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

  /**
   * Getter for the contents manager.
   */
  get contentsManager(): Contents.IManager | undefined {
    return this._contentsManager;
  }

  /**
   * Setter for the contents manager.
   * Also updates the file path.
   */
  set contentsManager(manager: Contents.IManager | undefined) {
    this._contentsManager = manager;
  }

  get clientStateChanged(): ISignal<this, Map<number, IJupyterCadClientState>> {
    return this._clientStateChanged;
  }

  get sharedMetadataChanged(): ISignal<this, MapChange> {
    return this._sharedMetadataChanged;
  }

  get sharedOptionsChanged(): ISignal<this, MapChange> {
    return this._sharedOptionsChanged;
  }

  get sharedObjectsChanged(): ISignal<this, IJcadObjectDocChange> {
    return this._sharedObjectsChanged;
  }
  get sharedModelSwapped(): ISignal<this, void> {
    return this._sharedModelSwapped;
  }

  /**
   * Getter for the file path associated with the contents manager.
   */
  get filePath(): string {
    return this._filePath;
  }

  /**
   * Setter for the file path associated with the contents manager.
   */
  set filePath(path: string) {
    this._filePath = path;
    this._pathChanged.emit(path);
  }

  get pathChanged(): ISignal<JupyterCadModel, string> {
    return this._pathChanged;
  }

  get disposed(): ISignal<JupyterCadModel, void> {
    return this._disposed;
  }

  swapSharedModel(newSharedModel: IJupyterCadDoc): void {
    this._disconnectSignal();
    this._sharedModel.dispose();
    this._sharedModel = newSharedModel;
    this._connectSignal();
    this._sharedObjectsChanged.emit({ objectChange: [] });
    this._sharedModelSwapped.emit();
  }
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._disconnectSignal();
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
      let errorMsg = 'JupyterCAD File format invalid:\n';
      for (const error of validate.errors || []) {
        errorMsg = `${errorMsg}- ${error.instancePath} ${error.message}\n`;
      }
      console.warn(errorMsg);
    }

    this.sharedModel.transact(() => {
      this.sharedModel.addObjects(jsonData.objects);
      this.sharedModel.setOptions(jsonData.options ?? {});
    });
    this.dirty = true;
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

  syncSelected(value: { [key: string]: ISelection }, emitter?: string): void {
    this.sharedModel.awareness.setLocalStateField('selected', {
      value,
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
    if (this.sharedModel) {
      this.sharedModel.awareness.setLocalStateField('remoteUser', userId);
    }
  }

  syncFormData(form: any): void {
    if (this.sharedModel) {
      this.sharedModel.awareness.setLocalStateField('toolbarForm', form);
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

  setCopiedObject(object: IJCadObject | null): void {
    this._copiedObject = object ? { ...object } : null;
  }

  getCopiedObject(): IJCadObject | null {
    return this._copiedObject ? { ...this._copiedObject } : null;
  }

  protected createSharedModel(): IJupyterCadDoc {
    return JupyterCadDoc.create();
  }

  private _onSharedModelChanged = (sender: any, changes: any): void => {
    if (changes && changes?.objectChange?.length) {
      this._contentChanged.emit(void 0);
      this.dirty = true;
    }
  };

  private _onClientStateChanged = changed => {
    const clients = this.sharedModel.awareness.getStates() as Map<
      number,
      IJupyterCadClientState
    >;
    this._clientStateChanged.emit(clients);
    if (changed.added.length || changed.removed.length) {
      this._userChanged.emit(this.users);
    }
  };

  private _connectSignal() {
    this._sharedModel.changed.connect(this._onSharedModelChanged);
    this._sharedModel.awareness.on('change', this._onClientStateChanged);
    this._sharedModel.metadataChanged.connect(
      this._metadataChangedHandler,
      this
    );
    this._sharedModel.optionsChanged.connect(this._optionsChangedHandler, this);
    this._sharedModel.objectsChanged.connect(this._objectsChangedHandler, this);
  }
  private _disconnectSignal() {
    this._sharedModel.changed.disconnect(this._onSharedModelChanged);
    this._sharedModel.awareness.off('change', this._onClientStateChanged);
    this._sharedModel.metadataChanged.disconnect(
      this._metadataChangedHandler,
      this
    );
    this._sharedModel.optionsChanged.disconnect(
      this._optionsChangedHandler,
      this
    );
    this._sharedModel.objectsChanged.disconnect(
      this._objectsChangedHandler,
      this
    );
  }

  private _metadataChangedHandler(_: IJupyterCadDoc, args: MapChange) {
    this._sharedMetadataChanged.emit(args);
  }
  private _optionsChangedHandler(_: IJupyterCadDoc, args: MapChange) {
    this._sharedOptionsChanged.emit(args);
  }
  private _objectsChangedHandler(
    _: IJupyterCadDoc,
    args: IJcadObjectDocChange
  ) {
    this._sharedObjectsChanged.emit(args);
  }
  readonly defaultKernelName: string = '';
  readonly defaultKernelLanguage: string = '';
  readonly annotationModel?: IAnnotationModel;
  readonly settingRegistry?: ISettingRegistry;

  private _settings: ISettingRegistry.ISettings;
  private _sharedModel: IJupyterCadDoc;
  private _copiedObject: IJCadObject | null;

  private _dirty = false;
  private _readOnly = false;
  private _isDisposed = false;
  private _filePath: string;
  private _pathChanged: Signal<JupyterCadModel, string>;
  private _contentsManager?: Contents.IManager;
  private _jcadSettings: IJCadSettings = {
    showAxesHelper: false,
    cameraType: 'Perspective'
  };

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
  private _settingsChanged: Signal<JupyterCadModel, string>;

  private _sharedMetadataChanged = new Signal<this, MapChange>(this);
  private _sharedOptionsChanged = new Signal<this, MapChange>(this);
  private _sharedObjectsChanged = new Signal<this, IJcadObjectDocChange>(this);
  private _sharedModelSwapped = new Signal<this, void>(this);
  static worker: Worker;
}

export namespace JupyterCadModel {
  export interface IOptions extends DocumentRegistry.IModelOptions<IJupyterCadDoc> {
    annotationModel?: IAnnotationModel;
    settingRegistry?: ISettingRegistry;
  }
}
