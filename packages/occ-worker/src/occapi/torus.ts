import { OCC } from '@jupytercad/opencascade';
import { IJCadContent, ITorus } from '@jupytercad/schema';

import { getOcc } from './common';
import { setShapePlacement, toRad } from './common';

export function _Torus(
  arg: ITorus,
  _: IJCadContent
): OCC.TopoDS_Shape | undefined {
  const { Radius1, Radius2, Angle1, Angle2, Angle3, Placement } = arg;
  const oc = getOcc();
  const torus = new oc.BRepPrimAPI_MakeTorus_4(
    Radius1,
    Radius2,
    toRad(Angle1),
    toRad(Angle2),
    toRad(Angle3)
  );
  const shape = torus.Shape();
  return setShapePlacement(shape, Placement);
}
