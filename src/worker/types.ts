import { IJCadContent } from '../_interface/jcad';
import { TopoDS_Shape } from 'jupytercad-opencascade';
import { IBox } from '../_interface/box';
import { ICylinder } from '../_interface/cylinder';
import { ISphere } from '../_interface/sphere';
import { ICone } from '../_interface/cone';
import { ITorus } from '../_interface/torus';
import { ICut } from '../_interface/cut';
import { IFuse } from '../_interface/fuse';
import { IIntersection } from '../_interface/intersection';
import { ISketchObject } from '../_interface/sketch';

type IOperatorFunc<T> = (
  args: T,
  jcadContent: IJCadContent
) => TopoDS_Shape | undefined;

export type IAllOperatorFunc =
  | IOperatorFunc<IBox>
  | IOperatorFunc<ICylinder>
  | IOperatorFunc<ISphere>
  | IOperatorFunc<ICone>
  | IOperatorFunc<ITorus>
  | IOperatorFunc<ICut>
  | IOperatorFunc<IFuse>
  | IOperatorFunc<IIntersection>
  | IOperatorFunc<ISketchObject>;
export type IOperatorArg = IBox &
  ICylinder &
  ISphere &
  ICone &
  ITorus &
  ICut &
  IFuse &
  ISketchObject;
