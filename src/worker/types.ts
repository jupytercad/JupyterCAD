import { TopoDS_Shape } from 'opencascade.js';
import { IBox } from '../_interface/box';
import { ISphere } from '../_interface/sphere';

type IOperatorFunc<T> = (args: T) => TopoDS_Shape;

export type IAllOperatorFunc = IOperatorFunc<IBox> | IOperatorFunc<ISphere>;
export type IOperatorArg = IBox & ISphere;
