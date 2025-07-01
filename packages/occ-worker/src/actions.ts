import {
  IDict,
  IJCadContent,
  IJCadObject,
  IPostOperatorInput,
  JCadWorkerSupportedFormat,
  WorkerAction
} from '@jupytercad/schema';

import { getShapesFactory, ObjectFile } from './occapi';
import { _PostOperatorForSTL } from './occapi/postOperator';
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
    // Three main paths:

    // 1. Regular shapes (Part::Box, Part::Cylinder, etc.)
    if (shapeFactory[shape]) {
      shapeData = shapeFactory[shape]?.(parameters as IOperatorArg, model);
    }
    // 2. Shapes from files (BREP, STL files)
    else if (parameters['Shape']) {
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
    }
    // 3. Post-processing operations (Post::*)
    else if (shape.startsWith('Post::') && shapeMetadata) {
      const shapeFormat = (shapeMetadata.shapeFormat ??
        JCadWorkerSupportedFormat.BREP) as JCadWorkerSupportedFormat;

      switch (shapeFormat) {
        case JCadWorkerSupportedFormat.BREP: {
          shapeData = shapeFactory['Post::Operator']?.(
            parameters as IOperatorArg,
            model
          );
          break;
        }
        case JCadWorkerSupportedFormat.GLTF: {
          shapeData = {
            postShape: ''
          };
          break;
        }
        case JCadWorkerSupportedFormat.STL: {
          shapeData = _PostOperatorForSTL(parameters as IOperatorArg, model);
          break;
        }

        default:
          break;
      }
    }
    if (shapeData) {
      outputModel.push({ shapeData, jcObject: object });
      if (shapeData.postShape) {
        console.log('Output Model:', { shapeData, jcObject: object });
      }
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
