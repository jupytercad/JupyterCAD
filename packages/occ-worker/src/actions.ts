import { OCC } from '@jupytercad/opencascade';
import { IJCadContent, IJCadObject } from '@jupytercad/schema';

import { IDict, WorkerAction } from './types';
import { BrepFile, ShapesFactory } from './occapi';
import { OccParser } from './occparser';
import { IOperatorArg, IOperatorFuncOutput } from './types';

let occ: OCC.OpenCascadeInstance;

export function getOcc(): OCC.OpenCascadeInstance {
  if (!occ) {
    occ = (self as any).occ as OCC.OpenCascadeInstance;
  }
  return occ;
}

function buildModel(
  model: IJCadContent
): { shapeData: IOperatorFuncOutput; jcObject: IJCadObject }[] {
  const outputModel: {
    shapeData: IOperatorFuncOutput;
    jcObject: IJCadObject;
  }[] = [];
  const { objects } = model;

  objects.forEach(object => {
    const { shape, parameters } = object;
    if (!shape || !parameters) {
      return;
    }
    if (ShapesFactory[shape]) {
      const shapeData = ShapesFactory[shape](parameters as IOperatorArg, model);
      if (shapeData) {
        outputModel.push({ shapeData, jcObject: object });
      }
    } else if (parameters['Shape']) {
      // Creating occ shape from brep file.
      const shapeData = BrepFile({ content: parameters['Shape'] }, model);
      if (shapeData) {
        outputModel.push({ shapeData, jcObject: object });
      }
    }
  });
  return outputModel;
}

function loadFile(payload: { content: IJCadContent }): IDict | null {
  const { content } = payload;
  const outputModel = buildModel(content);
  const parser = new OccParser(outputModel);
  const result = parser.execute();
  return result;
}

const WorkerHandler: {
  [key in WorkerAction]: (payload: any) => any;
} = {} as any;
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;

export default WorkerHandler;
