import { IGeomPoint } from '@jupytercad/schema';
import { getOcc } from './common';

export function _GeomPoint(arg: IGeomPoint): any {
  const oc = getOcc();
  const position = new oc.gp_Pnt_3(arg.PositionX, arg.PositionY, arg.PositionZ);

  return position;
}
