import { OCC } from '@jupytercad/opencascade';
import { ICylinder, IJCadContent } from '@jupytercad/schema';

import { getOcc } from './common';
import { setShapePlacement, toRad } from './common';

export function _Cylinder(
  arg: ICylinder,
  _: IJCadContent
): OCC.TopoDS_Shape | undefined {
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
