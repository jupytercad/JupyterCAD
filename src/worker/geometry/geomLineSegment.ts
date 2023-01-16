import { IGeomLineSegment } from '../../_interface/geomLineSegment';
import { getOcc } from '../actions';

export function _GeomLine(arg: IGeomLineSegment): any {
  const oc = getOcc();
  const start = new oc.gp_Pnt_3(arg.StartX, arg.StartY, arg.StartZ);
  const end = new oc.gp_Pnt_3(arg.EndX, arg.EndY, arg.EndZ);

  const edge = new oc.BRepBuilderAPI_MakeEdge_3(start, end).Edge();
  const lineWire = new oc.BRepBuilderAPI_MakeWire_2(edge).Wire();

  return lineWire;
}
