import { PartialJSONObject } from '@lumino/coreutils';

export interface IDict<T = any> {
  [key: string]: T;
}

/**
 * Action definitions for worker
 */
export enum WorkerAction {
  LOAD_FILE = 'LOAD_FILE',
  SAVE_FILE = 'SAVE_FILE',
  CLOSE_FILE = 'CLOSE_FILE',
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
    fileName: string;
    content: PartialJSONObject;
  };
}

export interface ICloseFile extends IMainId {
  action: WorkerAction.CLOSE_FILE;
  payload: {
    fileName: string;
  };
}

export type IWorkerMessage = ILoadFile | IRegister | ICloseFile;

/**
 * Action definitions for main thread
 */
export enum MainAction {
  DISPLAY_SHAPE = 'DISPLAY_SHAPE',
  INITIALIZED = 'INITIALIZED'
}

export interface IDisplayShape {
  action: MainAction.DISPLAY_SHAPE;
  payload: {
    edgeList: any;
    faceList: any;
  };
}
export interface IWorkerInitialized {
  action: MainAction.INITIALIZED;
  payload: boolean;
}

export type IMainMessage = IDisplayShape | IWorkerInitialized;

export type Position = {
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
  z: number;
};

export enum PrimitiveShapes {
  BOX = 'Box',
  SPHERE = 'Sphere'
}
export interface IJcadModel {
  objects: Array<{
    id: string;
    shape: PrimitiveShapes;
    parameters: IDict;
    visible: boolean;
    operator?: Array<IDict>;
    dependencies?: Array<string>;
  }>;
}
