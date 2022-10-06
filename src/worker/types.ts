import { IJCadContent } from '../_interface/jcad';
import { TopoDS_Shape } from 'opencascade.js';
import { IBox } from '../_interface/box';
import { ICylinder } from '../_interface/cylinder';
import { ISphere } from '../_interface/sphere';
import { ICone } from '../_interface/cone';
import { ICut } from '../_interface/cut';

type IOperatorFunc<T> = (
  args: T,
  jcadContent: IJCadContent
) => TopoDS_Shape | undefined;

export type IAllOperatorFunc =
  | IOperatorFunc<IBox>
  | IOperatorFunc<ICylinder>
  | IOperatorFunc<ISphere>
  | IOperatorFunc<ICone>
  | IOperatorFunc<ICut>;
export type IOperatorArg = IBox & ICylinder & ISphere & ICone & ICut;
