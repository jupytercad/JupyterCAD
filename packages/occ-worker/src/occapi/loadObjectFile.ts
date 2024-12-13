import { OCC } from '@jupytercad/opencascade';
import { IAny } from '@jupytercad/schema';

import { _loadBrepFile } from './brepIO';
import { _loadStepFile } from './stepIO';
import { _loadStlFile } from './stlIO';
import { setShapePlacement } from './common';

export function _loadObjectFile(arg: {
  content: string;
  type: IAny['Type'];
  placement?: {
    Position: number[];
    Axis: number[];
    Angle: number;
  };
}): OCC.TopoDS_Shape | undefined {
  let shape: OCC.TopoDS_Shape | undefined;

  switch (arg.type.toLowerCase()) {
    case 'brep':
      shape = _loadBrepFile(arg.content);
      break;
    case 'step':
      shape = _loadStepFile(arg.content);
      break;
    case 'stl':
      shape = _loadStlFile(arg.content);
      break;
    default:
      throw `${arg.type} file not supported`;
  }

  if (shape) {
    setShapePlacement(shape, arg.placement);
  }

  return shape;
}
