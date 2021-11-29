export interface IDict<T = any> {
  [key: string]: T;
}

export enum WorkerAction {
  LOAD_FILE = 'LOAD_FILE',
  SAVE_FILE = 'SAVE_FILE'
}

export interface ILoadFile {
  action: WorkerAction.LOAD_FILE;
  payload: {
    fileName: string;
    content: string;
  };
}
export interface ISaveFile {
  action: WorkerAction.SAVE_FILE;
  payload: {
    fileName: string;
    content: string;
  };
}

export type IWorkerMessage = ILoadFile | ISaveFile;

export enum MainAction {
  DISPLAY_SHAPE = 'DISPLAY_SHAPE'
}

export interface IDisplayShape {
  action: MainAction.DISPLAY_SHAPE;
  payload: {
    edgeList: any;
    faceList: any;
  };
}

export type IMainMessage = IDisplayShape;
