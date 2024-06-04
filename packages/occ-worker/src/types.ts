import { OCC } from '@jupytercad/opencascade';
import {
  IAny,
  IBox,
  IChamfer,
  ICone,
  ICut,
  ICylinder,
  IExtrusion,
  IFillet,
  IFuse,
  IIntersection,
  IJCadContent,
  IPostOperator,
  IShapeMetadata,
  ISketchObject,
  ISphere,
  ITorus,
  IWorkerMessageBase,
  WorkerAction
} from '@jupytercad/schema';

export interface IDict<T = any> {
  [key: string]: T;
}

export type ValueOf<T> = T[keyof T];

export interface IRegister extends IWorkerMessageBase {
  action: WorkerAction.REGISTER;
  payload: {
    id: string;
  };
}

export interface ILoadFile extends IWorkerMessageBase {
  action: WorkerAction.LOAD_FILE;
  payload: {
    content: IJCadContent;
  };
}

export interface IDryRun extends IWorkerMessageBase {
  action: WorkerAction.DRY_RUN;
  payload: {
    id: string;
    content: IJCadContent;
  };
}

export type IWorkerMessage = ILoadFile | IRegister | IDryRun;

export interface IOperatorFuncOutput {
  occShape?: OCC.TopoDS_Shape;
  metadata?: IShapeMetadata | undefined;
  postShape?: string | ArrayBuffer;
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
  | IOperatorFunc<IChamfer>
  | IOperatorFunc<IFillet>
  | IOperatorFunc<ISketchObject>
  | IOperatorFunc<IPostOperator>;

export type IOperatorArg = IAny &
  IBox &
  ICylinder &
  ISphere &
  ICone &
  ITorus &
  ICut &
  IFuse &
  IExtrusion &
  IChamfer &
  IFillet &
  ISketchObject &
  IPostOperator;
