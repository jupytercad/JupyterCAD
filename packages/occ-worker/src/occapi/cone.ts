import { OCC } from '@jupytercad/opencascade';
import { ICone, IJCadContent } from '@jupytercad/schema';

import { getOcc } from './common';
import { setShapePlacement, toRad } from './common';

export function _Cone(
  arg: ICone,
  _: IJCadContent
): OCC.TopoDS_Shape | undefined {
  const { Radius1, Radius2, Height, Angle, Placement } = arg;
  const oc = getOcc();
  const cone = new oc.BRepPrimAPI_MakeCone_2(
    Radius1,
    Radius2,
    Height,
    toRad(Angle)
  );
  const shape = cone.Shape();
  return setShapePlacement(shape, Placement);
}
