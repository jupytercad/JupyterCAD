import { OCC } from '@jupytercad/opencascade';
import { IAny } from '@jupytercad/schema';

import { _loadBrepFile } from './brepIO';
import { _loadStepFile } from './stepIO';

export function _loadObjectFile(arg: {
  content: string;
  type: IAny['Type'];
}): OCC.TopoDS_Shape | undefined {
  switch (arg.type.toLowerCase()) {
    case 'brep':
      return _loadBrepFile(arg.content);
    case 'step':
      return _loadStepFile(arg.content);
    default:
      throw `${arg.type} file not supported`;
  }
}
