import { OCC } from '@jupytercad/opencascade';
import { IAny } from '@jupytercad/schema';

import { _loadBrepFile } from './brepIO';
import { _loadStepFile } from './stepIO';
import { _loadStlFile } from './stlIO';

export function _loadObjectFile(arg: {
  content: string;
  type: IAny['Type'];
}): OCC.TopoDS_Shape | undefined {
  switch (arg.type.toLowerCase()) {
    case 'brep':
      return _loadBrepFile(arg.content);
    case 'step':
      return _loadStepFile(arg.content);
    case 'stl':
      return _loadStlFile(arg.content);
    default:
      throw `${arg.type} file not supported`;
  }
}
