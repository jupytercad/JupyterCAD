import { TopoDS_Shape } from 'opencascade.js';
import { IBox } from '../_interface/box';
import { ICylinder } from '../_interface/cylinder';

type IOperatorFunc<T> = (args: T) => TopoDS_Shape;

export type IAllOperatorFunc = IOperatorFunc<IBox> | IOperatorFunc<ICylinder>;
export type IOperatorArg = IBox & ICylinder;
