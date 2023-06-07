import { IJCadContent, IShapeMetadata } from '../_interface/jcad';
import { TopoDS_Shape } from '@jupytercad/jupytercad-opencascade';
import { IBox } from '../_interface/box';
import { ICylinder } from '../_interface/cylinder';
import { ISphere } from '../_interface/sphere';
import { ICone } from '../_interface/cone';
import { ITorus } from '../_interface/torus';
import { ICut } from '../_interface/cut';
import { IFuse } from '../_interface/fuse';
import { IIntersection } from '../_interface/intersection';
import { ISketchObject } from '../_interface/sketch';
import { IExtrusion } from '../_interface/extrusion';
import { IAny } from '../_interface/any';

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
