import { OCC } from '@jupytercad/opencascade';
import { IFillet, IJCadContent } from '@jupytercad/schema';

import { getOcc } from './common';
import { IOperatorArg } from '../types';
import { setShapePlacement, getShapesFactory } from './common';

export function _Fillet(
  arg: IFillet,
  content: IJCadContent
): OCC.TopoDS_Shape | undefined {
  const { Base, Edge, Radius, Placement } = arg;
  const oc = getOcc();
  const baseObject = content.objects.filter(obj => obj.name === Base);

  if (baseObject.length === 0) {
    return;
  }
  const baseShape = baseObject[0].shape;
  const shapesFactory = getShapesFactory();
  if (baseShape && shapesFactory[baseShape]) {
    const base = shapesFactory[baseShape]?.(
      baseObject[0].parameters as IOperatorArg,
      content
    );
    if (!base || !base.occShape) {
      return;
    }

    const mapOfShape = new oc.TopTools_IndexedMapOfShape_1();
    oc.TopExp.MapShapes_1(
      base.occShape,
      oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
      mapOfShape
    );

    const filletBuilder = new oc.BRepFilletAPI_MakeFillet(
      base.occShape,
      oc.ChFi3d_FilletShape
    );
    const edgeList = Array.isArray(Edge) ? Edge : [Edge];
    for (const edgeIdx of edgeList) {
      const e = oc.TopoDS.Edge_1(mapOfShape.FindKey(edgeIdx + 1));
      filletBuilder.Add_2(Radius, e);
    }

    filletBuilder.Build(new oc.Message_ProgressRange_1());

    if (filletBuilder.IsDone()) {
      return setShapePlacement(filletBuilder.Shape(), Placement);
    } else {
      console.error('Failed to create fillet');
    }
  }
}
