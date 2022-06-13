import { TopoDS_Shape } from 'opencascade.js';

type IOperatorFunc<T> = (args: T) => TopoDS_Shape;

export interface IBox {
  x: number;
  y: number;
  z: number;
  center?: number[];
}
export interface ISphere {
  center: number[];
  radius: number;
}
export type IAllOperatorFunc = IOperatorFunc<IBox> | IOperatorFunc<ISphere>;
export type IOperatorArg = IBox & ISphere;
