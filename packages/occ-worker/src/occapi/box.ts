import { OCC } from '@jupytercad/opencascade';
import { IBox, IJCadContent } from '@jupytercad/schema';

import { getOcc, setShapePlacement } from './common';

export function _Box(arg: IBox, _: IJCadContent): OCC.TopoDS_Shape | undefined {
  const { Length, Width, Height, Placement } = arg;
  const oc = getOcc();
  const box = new oc.BRepPrimAPI_MakeBox_2(Length, Width, Height);
  const shape = box.Shape();
  return setShapePlacement(shape, Placement);
}
