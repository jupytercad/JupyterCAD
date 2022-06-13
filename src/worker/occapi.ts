import { getOcc } from './actions';
import { TopoDS_Shape } from 'opencascade.js';
import { IBox, ISphere, IAllOperatorFunc } from './types';
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

function _Box(arg: IBox): TopoDS_Shape {
  const { x, y, z } = arg;
  const oc = getOcc();
  const box = new oc.BRepPrimAPI_MakeBox_2(x, y, z);
  return box.Shape();
}
function _Sphere(arg: ISphere): TopoDS_Shape {
  throw Error('Not implemented');
}

const Box = operatorCache<IBox>('Box', _Box);
const Sphere = operatorCache<ISphere>('Sphere', _Sphere);

export const PrimitiveShapesFactory: {
  [key in PrimitiveShapes]: IAllOperatorFunc;
} = { Box, Sphere };
