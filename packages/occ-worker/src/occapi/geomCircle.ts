import { IGeomCircle } from '@jupytercad/schema';
import { getOcc } from './common';

export function _GeomCircle(arg: IGeomCircle): any {
  const oc = getOcc();
  const center = new oc.gp_Pnt_3(arg.CenterX, arg.CenterY, arg.CenterZ);
  const norm = new oc.gp_Dir_4(arg.NormalX, arg.NormalY, arg.NormalZ);
  const radius = arg.Radius;
  const circle = new oc.GC_MakeCircle_6(center, norm, radius).Value();
  const edge = new oc.BRepBuilderAPI_MakeEdge_8(circle.get().Circ()).Edge();
  const circleWire = new oc.BRepBuilderAPI_MakeWire_2(edge).Wire();

  return circleWire;
}
