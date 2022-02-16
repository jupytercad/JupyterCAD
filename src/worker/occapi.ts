import { getOcc } from './actions';
import { TopoDS_Shape } from 'opencascade.js';
import { IOperatorArg, IBox, ISphere, IAllOperatorFunc } from './types';
import { hashCode } from './utils';
import { PrimitiveShapes } from '../types';
const SHAPE_CACHE = new Map<string, TopoDS_Shape>();

export function operatorCache<T>(name: string, ops: (args: T) => TopoDS_Shape) {
  return (args: T): TopoDS_Shape => {
    const hash = `${name}-${hashCode(JSON.stringify(args))}`;

    if (SHAPE_CACHE.has(hash)) {
      return SHAPE_CACHE.get(hash)!;
    } else {
      const shape = ops(args);
      SHAPE_CACHE.set(hash, shape);
      return shape;
    }
  };
}

function _Box(arg: IBox) {
  const { x, y, z, center = [0, 0, 0] } = arg;
  const oc = getOcc();
  let box = new oc.BRepPrimAPI_MakeBox_2(x, y, z);
  return box.Shape();
}
function _Sphere(arg: ISphere) {
  const oc = getOcc();
  const { center, radius } = arg;

  let box = new oc.BRepPrimAPI_MakeBox_2(1, 3, 2);
  return box.Shape();
}

const Box = operatorCache<IBox>('Box', _Box);
const Sphere = operatorCache<ISphere>('Sphere', _Sphere);

export const PrimitiveShapesFactory: {
  [key in PrimitiveShapes]: IAllOperatorFunc;
} = { Box, Sphere };
