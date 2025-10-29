import { IGeomPoint } from '@jupytercad/schema';
import { getOcc } from './common';

export function _GeomPoint(arg: IGeomPoint): any {
  const oc = getOcc();
  const point = new oc.gp_Pnt_3(arg.X, arg.Y, arg.Z);

  // create a very short edge to represent the point visually
  const eps = 1e-3;
  const point2 = new oc.gp_Pnt_3(arg.X + eps, arg.Y, arg.Z);
  const edge = new oc.BRepBuilderAPI_MakeEdge_3(point, point2).Edge();
  const pointWire = new oc.BRepBuilderAPI_MakeWire_2(edge).Wire();

  return pointWire;
}
