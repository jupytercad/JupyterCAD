import {
  IDict,
  IJCadContent,
  IJCadObject,
  IPostOperatorInput,
  WorkerAction
} from '@jupytercad/schema';

import { ObjectFile, getShapesFactory } from './occapi';

import { OccParser } from './occparser';
import { IOperatorArg, IOperatorFuncOutput } from './types';

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
    const shapeFactory = getShapesFactory();
    let shapeData: IOperatorFuncOutput | undefined = undefined;
    if (shapeFactory[shape]) {
      shapeData = shapeFactory[shape]?.(parameters as IOperatorArg, model);
    } else if (parameters['Shape']) {
      // Creating occ shape from brep file.
      const type = parameters['Type'] ?? 'brep';
      shapeData = ObjectFile({ content: parameters['Shape'], type }, model);
    } else if (shape.startsWith('Post::')) {
      shapeData = shapeFactory['Post::Operator']?.(
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

function loadFile(payload: { content: IJCadContent }): IDict | null {
  const { content } = payload;
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
  return { result, postResult };
}

const WorkerHandler: {
  [key in WorkerAction]: (payload: any) => any;
} = {} as any;
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;

export default WorkerHandler;
