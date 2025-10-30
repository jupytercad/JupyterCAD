import { IGeomPoint } from '@jupytercad/schema';
import { getOcc, setShapePlacement } from './common';

export function _GeomPoint(arg: IGeomPoint): any {
  const oc = getOcc();
  // Create a small sphere for visibility
  const radius = 1e-3;
  const sphere = new oc.BRepPrimAPI_MakeSphere_4(radius, 0, 0, 0);
  const shape = sphere.Shape();
  // Position the sphere at the sketch point coordinates
  const placement = {
    Position: [arg.X, arg.Y, arg.Z],
    Axis: [0, 0, 1],
    Angle: 0
  };
  return setShapePlacement(shape, placement);
}
