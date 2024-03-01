import { IJCadContent, IPostOperator } from '@jupytercad/schema';

import { IOperatorArg } from '../types';
import { _writeBrep } from './brepIO';
import { getShapesFactory } from './common';

export function _PostOperator(
  arg: IPostOperator,
  content: IJCadContent
): { occBrep: string } {
  const baseObject = content.objects.filter(obj => obj.name === arg.Object);
  if (baseObject.length === 0) {
    return { occBrep: '' };
  }
  const shapesFactory = getShapesFactory();
  const baseShape = baseObject[0].shape;
  if (baseShape && shapesFactory[baseShape]) {
    const base = shapesFactory[baseShape]?.(
      baseObject[0].parameters as IOperatorArg,
      content
    );
    if (base?.occShape) {
      const occBrep = _writeBrep(base.occShape);
      return { occBrep };
    }
  }
  return { occBrep: '' };
}
