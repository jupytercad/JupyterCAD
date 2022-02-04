export interface IDict<T = any> {
  [key: string]: T;
}

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
    fileName: string;
    content: string;
  };
}

export type IWorkerMessage = ILoadFile | IRegister;

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
