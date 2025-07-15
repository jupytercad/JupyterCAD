import {
  IDict,
  IJCadContent,
  IJCadObject,
  IPostOperatorInput,
  JCadWorkerSupportedFormat,
  WorkerAction
} from '@jupytercad/schema';

import { getShapesFactory, ObjectFile } from './occapi';
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
    const { shape, parameters, shapeMetadata } = object;
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
      shapeData = ObjectFile(
        {
          content: parameters['Shape'],
          type,
          placement: parameters?.Placement
        },
        model
      );
    } else if (shape.startsWith('Post::') && shapeMetadata) {
      const shapeFormat = (shapeMetadata.shapeFormat ??
        JCadWorkerSupportedFormat.BREP) as JCadWorkerSupportedFormat;

      switch (shapeFormat) {
        case JCadWorkerSupportedFormat.GLTF: {
          shapeData = {
            postShape: ''
          };
          break;
        }
        case JCadWorkerSupportedFormat.BREP:
        case JCadWorkerSupportedFormat.STL: {
          shapeData = shapeFactory['Post::Operator']?.(
            parameters as IOperatorArg,
            model
          );
          break;
        }

        default:
          break;
      }
    }
    if (shapeData) {
      outputModel.push({ shapeData, jcObject: object });
    }
  });
  return outputModel;
}

function loadFile(
  payload: { content: IJCadContent },
  raiseOnFailure = false
): IDict | null {
  const { content } = payload;
  const outputModel = buildModel(content);

  const parser = new OccParser(outputModel);
  const result = parser.execute(raiseOnFailure);
  const postResult: IDict<IPostOperatorInput> = {};
  outputModel.forEach(item => {
    if (item.jcObject.shape?.startsWith('Post::')) {
      postResult[item.jcObject.name] = {
        jcObject: item.jcObject,
        postShape: item.shapeData.postShape
      };
    }
  });

  return { result, postResult };
}

function dryRun(payload: { content: IJCadContent }) {
  return loadFile(payload, true);
}

const WorkerHandler: {
  [key in WorkerAction]: (payload: any) => any;
} = {} as any;
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;
WorkerHandler[WorkerAction.DRY_RUN] = dryRun;

export default WorkerHandler;
