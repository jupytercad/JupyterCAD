import { OCC } from '@jupytercad/opencascade';
import { IJCadContent, ISketchObject } from '@jupytercad/schema';

import { getOcc } from './common';
import { _GeomCircle } from './geomCircle';
import { _GeomLine } from './geomLineSegment';

export function _SketchObject(
  arg: ISketchObject,
  content: IJCadContent
): OCC.TopoDS_Shape | undefined {
  const oc = getOcc();
  const builder = new oc.BRep_Builder();
  const compound = new oc.TopoDS_Compound();
  if (arg.Geometry.length === 0) {
    return undefined;
  }
  builder.MakeCompound(compound);
  for (const geom of arg.Geometry) {
    switch (geom.TypeId) {
      case 'Part::GeomCircle':
        builder.Add(compound, _GeomCircle(geom));
        break;

      case 'Part::GeomLineSegment': {
        builder.Add(compound, _GeomLine(geom));
        break;
      }
      default:
        break;
    }
  }
  return compound;
}
