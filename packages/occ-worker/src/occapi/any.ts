import { OCC } from '@jupytercad/opencascade';
import { IAny, IJCadContent } from '@jupytercad/schema';

import { _loadObjectFile } from './loadObjectFile';

export function _Any(
  arg: IAny,
  content: IJCadContent
): OCC.TopoDS_Shape | undefined {
  const { Content, Type, Placement } = arg;
  const result = _loadObjectFile({
    content: Content,
    type: Type,
    placement: Placement
  });
  return result;
}
