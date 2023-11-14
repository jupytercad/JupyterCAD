import {
  DocumentChange,
  MapChange,
  StateChange,
  YDocument
} from '@jupyter/ydoc';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { User } from '@jupyterlab/services';
import { JSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';

import {
  IJCadContent,
  IJCadModel,
  IJCadObject,
  IJCadOptions
} from './_interface/jcad';

export interface IDict<T = any> {
  [key: string]: T;
}

/**
 * Position and orientation of the user Camera
 */
export type Camera = {
  position: number[];
  rotation: number[];
  up: number[];
};

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

export interface IJcadObjectDocChange {
  objectChange?: Array<{
    name: string;
    key: keyof IJCadObject;
    newValue: IJCadObject | undefined;
  }>;
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

  setShapeMeta(key: string, meta?: IDict): void;

  metadataChanged: ISignal<IJupyterCadDoc, MapChange>;
  optionsChanged: ISignal<IJupyterCadDoc, MapChange>;
  objectsChanged: ISignal<IJupyterCadDoc, IJcadObjectDocChange>;
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

export interface IUserData {
  userId: number;
  userData: User.IIdentity;
}

/**
 * User pointer in the 3D environment
 */
export type Pointer = {
  parent: string;
  x: number;
  y: number;
  z: number;
};

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
