import { DocumentRegistry, IDocumentWidget } from '@jupyterlab/docregistry';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { ReactWidget } from '@jupyterlab/ui-components';
import { User } from '@jupyterlab/services';

import {
  MapChange,
  YDocument,
  StateChange,
  DocumentChange
} from '@jupyter/ydoc';

import { ISignal, Signal } from '@lumino/signaling';
import { JSONObject } from '@lumino/coreutils';

import { IJupyterCadTracker } from './token';
import {
  IJCadContent,
  IJCadObject,
  IJCadModel,
  IJCadOptions
} from './_interface/jcad';

export interface IDict<T = any> {
  [key: string]: T;
}

export type ValueOf<T> = T[keyof T];

/**
 * Action definitions for worker
 */
export enum WorkerAction {
  LOAD_FILE = 'LOAD_FILE',
  SAVE_FILE = 'SAVE_FILE',
  REGISTER = 'REGISTER'
}

interface IMainId {
  id: string;
}

export interface IRegister extends IMainId {
  action: WorkerAction.REGISTER;
  payload: {
    id: string;
  };
}

export interface ILoadFile extends IMainId {
  action: WorkerAction.LOAD_FILE;
  payload: {
    content: IJCadContent;
  };
}

export interface IUserData {
  userId: number;
  userData: User.IIdentity;
}

export type IWorkerMessage = ILoadFile | IRegister;

/**
 * Action definitions for main thread
 */
export enum MainAction {
  DISPLAY_SHAPE = 'DISPLAY_SHAPE',
  INITIALIZED = 'INITIALIZED'
}

export interface IFace {
  vertexCoord: Array<number>;
  normalCoord: Array<number>;
  triIndexes: Array<number>;
  numberOfTriangles: number;
}

export interface IEdge {
  vertexCoord: number[];
  numberOfCoords: number;
}
export interface IDisplayShape {
  action: MainAction.DISPLAY_SHAPE;
  payload: {
    [key: string]: {
      edgeList: IEdge[];
      faceList: IFace[];
      jcObject: IJCadObject;
    };
  };
}
export interface IWorkerInitialized {
  action: MainAction.INITIALIZED;
  payload: boolean;
}

export type IMainMessage = IDisplayShape | IWorkerInitialized;

/**
 * User pointer in the 3D environment
 */
export type Pointer = {
  parent: string;
  x: number;
  y: number;
  z: number;
};

/**
 * Position and orientation of the user Camera
 */
export type Camera = {
  position: number[];
  rotation: number[];
  up: number[];
};

/**
 * Axe's dimensions
 */
export type AxeHelper = {
  size: number;
  visible: boolean;
};

/**
 * The state of the exploded view
 */
export type ExplodedView = {
  enabled: boolean;
  factor: number;
};

export interface IJcadObjectDocChange {
  objectChange?: Array<{
    name: string;
    key: string;
    newValue: IJCadObject | undefined;
  }>;
}

export interface IJupyterCadDocChange extends DocumentChange {
  contextChange?: MapChange;
  contentChange?: MapChange;
  objectChange?: Array<{
    name: string;
    key: string;
    newValue: IJCadObject | undefined;
  }>;
  optionChange?: MapChange;
  stateChange?: StateChange<any>[];
}

export interface IJupyterCadDoc extends YDocument<IJupyterCadDocChange> {
  objects: Array<IJCadObject>;
  options: JSONObject;
  metadata: JSONObject;

  objectExists(name: string): boolean;
  getObjectByName(name: string): IJCadObject | undefined;
  removeObjectByName(name: string): void;
  addObject(value: IJCadObject): void;
  addObjects(value: Array<IJCadObject>): void;
  updateObjectByName(name: string, key: string, value: any): void;

  getOption(key: keyof IJCadOptions): IDict | undefined;
  setOption(key: keyof IJCadOptions, value: IDict): void;
  setOptions(options: IJCadOptions): void;

  getMetadata(key: string): string | undefined;
  setMetadata(key: string, value: string): void;
  removeMetadata(key: string): void;

  metadataChanged: ISignal<IJupyterCadDoc, MapChange>;
  optionsChanged: ISignal<IJupyterCadDoc, MapChange>;
  objectsChanged: ISignal<IJupyterCadDoc, IJcadObjectDocChange>;
}

export interface IJupyterCadClientState {
  pointer: { value?: Pointer; emitter?: string | null };
  camera: { value?: Camera; emitter?: string | null };
  selected: { value?: string[]; emitter?: string | null };
  selectedPropField?: {
    id: string | null;
    value: any;
    parentType: 'panel' | 'dialog';
  };
  user: User.IIdentity;
  remoteUser?: number;
  toolbarForm?: IDict;
}

export interface IJupyterCadModel extends DocumentRegistry.IModel {
  isDisposed: boolean;
  sharedModel: IJupyterCadDoc;
  annotationModel?: IAnnotationModel;
  localState: IJupyterCadClientState | null;

  themeChanged: Signal<
    IJupyterCadModel,
    IChangedArgs<string, string | null, string>
  >;
  clientStateChanged: ISignal<
    IJupyterCadModel,
    Map<number, IJupyterCadClientState>
  >;
  sharedMetadataChanged: ISignal<IJupyterCadDoc, MapChange>;
  sharedOptionsChanged: ISignal<IJupyterCadDoc, MapChange>;
  sharedObjectsChanged: ISignal<IJupyterCadDoc, IJcadObjectDocChange>;

  getWorker(): Worker;
  getContent(): IJCadContent;
  getAllObject(): IJCadModel;

  syncPointer(position: Pointer | undefined, emitter?: string): void;
  syncCamera(camera: Camera | undefined, emitter?: string): void;
  syncSelectedObject(name: string[], emitter?: string): void;
  syncSelectedPropField(data: {
    id: string | null;
    value: any;
    parentType: 'panel' | 'dialog';
  });
  setUserToFollow(userId?: number): void;
  syncFormData(form: any): void;

  getClientId(): number;

  addMetadata(key: string, value: string): void;
  removeMetadata(key: string): void;

  disposed: ISignal<any, void>;
}

export type IJupyterCadWidget = IDocumentWidget<ReactWidget, IJupyterCadModel>;

export interface IControlPanelModel {
  disconnect(f: any): void;
  documentChanged: ISignal<IJupyterCadTracker, IJupyterCadWidget | null>;
  filePath: string | undefined;
  jcadModel: IJupyterCadModel | undefined;
  sharedModel: IJupyterCadDoc | undefined;
}

export interface IAnnotationContent {
  user?: User.IIdentity;
  value: string;
}

export interface IAnnotation {
  label: string;
  position: [number, number, number];
  contents: IAnnotationContent[];
  parent: string;
}

export interface IAnnotationModel {
  updateSignal: ISignal<this, null>;
  user: User.IIdentity | undefined;

  context: DocumentRegistry.IContext<IJupyterCadModel> | undefined;
  contextChanged: ISignal<this, void>;

  update(): void;

  getAnnotation(id: string): IAnnotation | undefined;

  getAnnotationIds(): string[];

  addAnnotation(key: string, value: IAnnotation): void;

  removeAnnotation(key): void;

  addContent(id: string, value: string): void;
}
