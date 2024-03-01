import { OCC } from '@jupytercad/opencascade';
import { IJCadContent, ICut } from '@jupytercad/schema';

import { getOcc } from './common';
import { setShapePlacement, getShapesFactory } from './common';
import { IOperatorArg } from '../types';

export function _Cut(
  arg: ICut,
  content: IJCadContent
): OCC.TopoDS_Shape | undefined {
  const { Placement, Base, Tool } = arg;
  const oc = getOcc();
  const baseObject = content.objects.filter(obj => obj.name === Base);
  const toolObject = content.objects.filter(obj => obj.name === Tool);
  if (baseObject.length === 0 || toolObject.length === 0) {
    return;
  }
  const baseShape = baseObject[0].shape;
  const toolShape = toolObject[0].shape;
  const shapesFactory = getShapesFactory();
  if (
    baseShape &&
    shapesFactory[baseShape] &&
    toolShape &&
    shapesFactory[toolShape]
  ) {
    const base = shapesFactory[baseShape]?.(
      baseObject[0].parameters as IOperatorArg,
      content
    );
    const tool = shapesFactory[toolShape]?.(
      toolObject[0].parameters as IOperatorArg,
      content
    );
    if (base && tool && base.occShape && tool.occShape) {
      baseObject[0].visible = false;
      toolObject[0].visible = false;
      const operator = new oc.BRepAlgoAPI_Cut_3(
        base.occShape,
        tool.occShape,
        new oc.Message_ProgressRange_1()
      );
      if (operator.IsDone()) {
        return setShapePlacement(operator.Shape(), Placement);
      }
    }
  }
}
