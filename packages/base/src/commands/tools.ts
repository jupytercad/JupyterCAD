import {
  IDryRunResponsePayload,
  IJCadContent,
  IJCadObject,
  IJupyterCadDoc,
  IJupyterCadModel,
  ISelection
} from '@jupytercad/schema';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { showErrorMessage } from '@jupyterlab/apputils';
import { v4 as uuid } from 'uuid';

import { MainViewModel } from '../3dview/mainviewmodel';
import { JupyterCadWidget } from '../widget';

export const DEFAULT_PLACEMENT_SCHEMA = {
  type: 'object',
  description: 'Placement of the object',
  additionalProperties: false,
  required: ['Position', 'Axis', 'Angle'],
  properties: {
    Position: {
      type: 'array',
      description: 'Position',
      items: { type: 'number' },
      default: [0, 0, 0]
    },
    Axis: {
      type: 'array',
      description: 'Rotation Axis',
      items: { type: 'number' },
      default: [0, 0, 1]
    },
    Angle: {
      type: 'number',
      description: 'Rotation Angle (degrees)',
      default: 0
    }
  }
};

/**
 * Generates a new unique name for an object based on the given type.
 * @param type The type of object (e.g., 'Box', 'Cylinder')
 * @param model The JupyterCad model containing the shared model
 * @returns A unique name for the new object
 */
export function newName(type: string, model: IJupyterCadModel): string {
  const sharedModel = model.sharedModel;

  let n = 1;
  let name = `${type} 1`;
  while (sharedModel.objectExists(name)) {
    name = `${type} ${++n}`;
  }

  return name;
}

/**
 * Performs a dry run check to verify if an operation can be performed.
 * @param options Configuration options for the dry run
 * @param options.jcadContent The JCad content to check
 * @param options.mainView The main view model
 * @param options.requestedOperator The operator being checked
 * @returns The dry run response payload if successful, null otherwise
 */
export async function dryRunCheck(options: {
  jcadContent: IJCadContent;
  mainView: MainViewModel;
  requestedOperator: string;
}): Promise<IDryRunResponsePayload | null> {
  const { jcadContent, mainView, requestedOperator } = options;
  const dryRunResult = await mainView.dryRun(jcadContent);
  if (dryRunResult.status === 'error') {
    showErrorMessage(
      `Failed to apply ${requestedOperator} operator`,
      `The ${requestedOperator} tool was unable to create the desired shape due to invalid parameter values. The values you entered may not be compatible with the dimensions of your piece.`
    );
    return null;
  }
  return dryRunResult;
}

/**
 * Gets the name of the selected object from the application context or model.
 * @param app The JupyterFrontEnd application instance
 * @param model The JupyterCad model
 * @param objectNames Array of available object names
 * @returns The name of the selected object
 */
export function getSelectedObject(
  app: JupyterFrontEnd,
  model: IJupyterCadModel,
  objectNames: string[]
): string {
  const node = app.contextMenuHitTest(node =>
    node.classList.contains('jpcad-object-tree-item')
  );
  if (node?.dataset.objectName) {
    return node.dataset.objectName;
  }

  const selected = Object.keys(model.localState?.selected?.value || {});
  if (selected.length > 0) {
    return selected[0];
  }

  return objectNames[0];
}

/**
 * Sets the visibility of an object in the shared model.
 * @param sharedModel The shared JupyterCad document model
 * @param name The name of the object to update
 * @param value The visibility value to set
 */
export function setVisible(
  sharedModel: IJupyterCadDoc,
  name: string,
  value: boolean
) {
  sharedModel.updateObjectByName(name, { data: { key: 'visible', value } });
}

export const PARTS = {
  box: {
    title: 'Box parameters',
    shape: 'Part::Box',
    default: (model: IJupyterCadModel) => {
      return {
        Name: newName('Box', model),
        Length: 1,
        Width: 1,
        Height: 1,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  cylinder: {
    title: 'Cylinder parameters',
    shape: 'Part::Cylinder',
    default: (model: IJupyterCadModel) => {
      return {
        Name: newName('Cylinder', model),
        Radius: 1,
        Height: 1,
        Angle: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  sphere: {
    title: 'Sphere parameters',
    shape: 'Part::Sphere',
    default: (model: IJupyterCadModel) => {
      return {
        Name: newName('Sphere', model),
        Radius: 1,
        Angle1: -90,
        Angle2: 90,
        Angle3: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  cone: {
    title: 'Cone parameters',
    shape: 'Part::Cone',
    default: (model: IJupyterCadModel) => {
      return {
        Name: newName('Cone', model),
        Radius1: 1,
        Radius2: 0.5,
        Height: 1,
        Angle: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  torus: {
    title: 'Torus parameters',
    shape: 'Part::Torus',
    default: (model: IJupyterCadModel) => {
      return {
        Name: newName('Torus', model),
        Radius1: 1,
        Radius2: 0.5,
        Angle1: -180,
        Angle2: 180,
        Angle3: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  }
};

/**
 * Gets the name of the selected mesh at the specified index.
 * @param selection The selection object containing selected items
 * @param index The index of the selected mesh to retrieve
 * @returns The name of the selected mesh, or an empty string if not found
 */
export function getSelectedMeshName(
  selection: { [key: string]: ISelection } | undefined,
  index: number
): string {
  if (selection === undefined) {
    return '';
  }

  const selectedNames = Object.keys(selection);

  if (selectedNames[index]) {
    const selected = selection[selectedNames[index]];

    if (selected.type === 'shape') {
      return selectedNames[index];
    } else {
      return selected.parent as string;
    }
  }

  return '';
}

/**
 * Gets the selected edges from the selection object.
 * @param selection The selection object containing selected items
 * @returns An object containing the shape name and array of edge indices, or undefined if no edges are selected
 */
export function getSelectedEdges(
  selection: { [key: string]: ISelection } | undefined
): { shape: string; edgeIndices: number[] } | undefined {
  if (selection === undefined) {
    return;
  }
  const shape = Object.values(selection)
    .filter(
      sel =>
        sel.type === 'edge' && sel.parent !== undefined && sel.parent !== null
    )
    .map(sel => sel.parent)[0];
  const edgeIndices = Object.values(selection)
    .filter(
      sel =>
        sel.type === 'edge' &&
        sel.parent === shape &&
        sel.edgeIndex !== undefined
    )
    .map(sel => sel.edgeIndex as number);
  if (shape && edgeIndices.length) {
    return { shape, edgeIndices };
  }
}

/**
 * Adds an object to the shared model after performing a dry run check.
 * @param options Configuration options for adding the object
 * @param options.jcadWidget The JupyterCad widget
 * @param options.objectModel The object model to add
 */
export async function addObjectToSharedModel({
  jcadWidget,
  objectModel
}: {
  objectModel: IJCadObject;
  jcadWidget: JupyterCadWidget;
}) {
  const jcadModel = jcadWidget.model;
  if (!jcadModel || !objectModel.shape) {
    return;
  }
  const sharedModel = jcadModel.sharedModel;
  if (!sharedModel.objectExists(objectModel.name)) {
    // Try a dry run with the update content to verify its feasibility
    const currentJcadContent = jcadModel.getContent();
    const updatedContent: IJCadContent = {
      ...currentJcadContent,
      objects: [...currentJcadContent.objects, objectModel]
    };

    const dryRunResult = await dryRunCheck({
      jcadContent: updatedContent,
      mainView: jcadWidget.content.currentViewModel,
      requestedOperator: objectModel.shape
    });
    if (!dryRunResult) {
      return;
    }
    const objMeta = dryRunResult.shapeMetadata?.[objectModel.name];
    if (objMeta) {
      objectModel.shapeMetadata = objMeta;
    }
    sharedModel.addObject(objectModel);
    jcadModel.syncSelected({ [objectModel.name]: { type: 'shape' } }, uuid());
  } else {
    showErrorMessage(
      'The object already exists',
      'There is an existing object with the same name.'
    );
  }
}

export async function executeOperator(
  name: string,
  objectModel: IJCadObject,
  current: JupyterCadWidget,
  transaction: (sharedModel: IJupyterCadDoc) => any
) {
  const sharedModel = current.model.sharedModel;

  if (!sharedModel) {
    return;
  }

  if (sharedModel.objectExists(objectModel.name)) {
    showErrorMessage(
      'The object already exists',
      'There is an existing object with the same name.'
    );

    return;
  }

  // Try a dry run with the update content to verify its feasibility
  const currentJcadContent = current.model.getContent();
  const updatedContent: IJCadContent = {
    ...currentJcadContent,
    objects: [...currentJcadContent.objects, objectModel]
  };

  const dryRunResult = await dryRunCheck({
    jcadContent: updatedContent,
    mainView: current.content.currentViewModel,
    requestedOperator: name
  });
  if (!dryRunResult) {
    return;
  }
  // Everything's good, we can apply the change to the shared model

  const objMeta = dryRunResult.shapeMetadata?.[objectModel.name];
  if (objMeta) {
    objectModel.shapeMetadata = objMeta;
  }
  sharedModel.transact(() => {
    transaction(sharedModel);
    current.model.syncSelected(
      { [objectModel.name]: { type: 'shape' } },
      uuid()
    );
  });
}
