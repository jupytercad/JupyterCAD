import { OCC } from '@jupytercad/opencascade';
import { IIntersection, IJCadContent } from '@jupytercad/schema';

import { getOcc } from './common';
import { IOperatorArg } from '../types';
import { setShapePlacement, getShapesFactory } from './common';

export function _Intersection(
  arg: IIntersection,
  content: IJCadContent
): OCC.TopoDS_Shape | undefined {
  const oc = getOcc();
  const { Shapes, Placement } = arg;
  const occShapes: OCC.TopoDS_Shape[] = [];
  Shapes.forEach(Base => {
    const baseObject = content.objects.filter(obj => obj.name === Base);
    if (baseObject.length === 0) {
      return;
    }
    const shapesFactory = getShapesFactory();
    const baseShape = baseObject[0].shape;
    if (baseShape && shapesFactory[baseShape]) {
      const base = shapesFactory[baseShape]?.(
        baseObject[0].parameters as IOperatorArg,
        content
      );
      if (base && base.occShape) {
        occShapes.push(base.occShape);
        baseObject[0].visible = false;
      }
    }
  });
  const operator = new oc.BRepAlgoAPI_Common_3(
    occShapes[0],
    occShapes[1],
    new oc.Message_ProgressRange_1()
  );
  if (operator.IsDone()) {
    return setShapePlacement(operator.Shape(), Placement);
  }
  return;
}
