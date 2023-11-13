import { TopoDS_Shape } from '@jupytercad/jupytercad-opencascade';
import {
  IAny,
  IBox,
  ICone,
  ICut,
  ICylinder,
  IExtrusion,
  IFuse,
  IIntersection,
  IJCadContent,
  IJCadObject,
  IShapeMetadata,
  ISketchObject,
  ISphere,
  ITorus
} from '@jupytercad/schema';

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
export interface IParsedShape {
  jcObject: IJCadObject;
  faceList: Array<IFace>;
  edgeList: Array<IEdge>;
  meta?: IDict;
  guiData?: IDict;
}
export interface IDisplayShape {
  action: MainAction.DISPLAY_SHAPE;
  payload: IDict<IParsedShape>;
}
export interface IWorkerInitialized {
  action: MainAction.INITIALIZED;
  payload: boolean;
}

export type IMainMessage = IDisplayShape | IWorkerInitialized;

export interface IOperatorFuncOutput {
  occShape: TopoDS_Shape;
  metadata?: IShapeMetadata | undefined;
}

type IOperatorFunc<T> = (
  args: T,
  jcadContent: IJCadContent
) => IOperatorFuncOutput | undefined;

export type IAllOperatorFunc =
  | IOperatorFunc<IAny>
  | IOperatorFunc<IBox>
  | IOperatorFunc<ICylinder>
  | IOperatorFunc<ISphere>
  | IOperatorFunc<ICone>
  | IOperatorFunc<ITorus>
  | IOperatorFunc<ICut>
  | IOperatorFunc<IFuse>
  | IOperatorFunc<IIntersection>
  | IOperatorFunc<IExtrusion>
  | IOperatorFunc<ISketchObject>;
export type IOperatorArg = IAny &
  IBox &
  ICylinder &
  ISphere &
  ICone &
  ITorus &
  ICut &
  IFuse &
  IExtrusion &
  ISketchObject;
