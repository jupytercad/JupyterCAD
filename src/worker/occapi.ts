import { getOcc } from './actions';
import { TopoDS_Shape } from 'opencascade.js';
import { IAllOperatorFunc } from './types';
import { hashCode, toRad } from './utils';
import { PrimitiveShapes } from '../_interface/jcad';
import { IBox } from '../_interface/box';
import { ICylinder } from '../_interface/cylinder';
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

function setShapePlacement(
  shape: TopoDS_Shape,
  placement: {
    Position: number[];
    Axis: number[];
    Angle: number;
  }
): TopoDS_Shape {
  const oc = getOcc();
  const trsf = new oc.gp_Trsf_1();

  const ax = new oc.gp_Ax1_2(
    new oc.gp_Pnt_3(0, 0, 0),
    new oc.gp_Dir_4(placement.Axis[0], placement.Axis[1], placement.Axis[2])
  );
  const angle = toRad(placement.Angle);
  trsf.SetRotation_1(ax, angle);
  trsf.SetTranslationPart(
    new oc.gp_Vec_4(
      placement.Position[0],
      placement.Position[1],
      placement.Position[2]
    )
  );
  const loc = new oc.TopLoc_Location_2(trsf);
  shape.Location_2(loc);
  return shape;
}

function _Box(arg: IBox): TopoDS_Shape {
  const { Length, Width, Height, Placement } = arg;
  const oc = getOcc();
  const box = new oc.BRepPrimAPI_MakeBox_2(Length, Width, Height);
  const shape = box.Shape();
  return setShapePlacement(shape, Placement);
}

function _Cylinder(arg: ICylinder): TopoDS_Shape {
  const { Radius, Height, Angle, Placement } = arg;
  const oc = getOcc();
  const cylinder = new oc.BRepPrimAPI_MakeCylinder_2(
    Radius,
    Height,
    toRad(Angle)
  );
  const shape = cylinder.Shape();
  return setShapePlacement(shape, Placement);
}

const Box = operatorCache<IBox>('Box', _Box);
const Cylinder = operatorCache<ICylinder>('Cylinder', _Cylinder);

export const PrimitiveShapesFactory: {
  [key in PrimitiveShapes]: IAllOperatorFunc;
} = { 'Part::Box': Box, 'Part::Cylinder': Cylinder };
