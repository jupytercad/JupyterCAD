import { OCC } from '@jupytercad/opencascade';
import {
  IDict,
  IJCadContent,
  IJCadObject,
  IPostOperatorInput,
  WorkerAction
} from '@jupytercad/schema';

import { ObjectFile, ShapesFactory } from './occapi';

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

    let shapeData: IOperatorFuncOutput | undefined = undefined;
    if (ShapesFactory[shape]) {
      shapeData = ShapesFactory[shape](parameters as IOperatorArg, model);
    } else if (parameters['Shape'] && parameters['Type']) {
      // Creating occ shape from brep file.
      shapeData = ObjectFile(
        { content: parameters['Shape'], type: parameters['Type'] },
        model
      );
    } else if (shape.startsWith('Post::')) {
      shapeData = ShapesFactory['Post::Operator'](
        parameters as IOperatorArg,
        model
      );
    }
    if (shapeData) {
      outputModel.push({ shapeData, jcObject: object });
    }
  });
  return outputModel;
}

function loadFile(payload: {
  content: IJCadContent;
  init?: boolean;
}): IDict | null {
  const { content } = payload;
  const init = Boolean(payload?.init);
  const outputModel = buildModel(content);

  const parser = new OccParser(outputModel);
  const result = parser.execute();
  const postResult: IDict<IPostOperatorInput> = {};
  outputModel.forEach(item => {
    if (item.jcObject.shape?.startsWith('Post::')) {
      postResult[item.jcObject.name] = {
        jcObject: item.jcObject,
        occBrep: item.shapeData.occBrep
      };
    }
  });
  return { result, postResult, init };
}

const WorkerHandler: {
  [key in WorkerAction]: (payload: any) => any;
} = {} as any;
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;

export default WorkerHandler;
