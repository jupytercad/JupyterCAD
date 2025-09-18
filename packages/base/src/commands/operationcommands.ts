import {
  IBox,
  IChamfer,
  ICone,
  ICut,
  ICylinder,
  IDict,
  IExtrusion,
  IFillet,
  IFuse,
  IIntersection,
  IJCadObject,
  IJupyterCadDoc,
  ISphere,
  ITorus
} from '@jupytercad/schema';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IRenderMime } from '@jupyterlab/rendermime';
import { CommandRegistry } from '@lumino/commands';

import { JupyterCadWidget } from '../widget';
import {
  addObjectToSharedModel,
  DEFAULT_PLACEMENT_SCHEMA,
  executeOperator,
  setVisible
} from './tools';
import { handleRemoveObject } from '../panelview';

export namespace ShapeCreationCommandIDs {
  export const newBoxWithParams = 'jupytercad:newBoxWithParams';
  export const newCylinderWithParams = 'jupytercad:newCylinderWithParams';
  export const newSphereWithParams = 'jupytercad:newSphereWithParams';
  export const newConeWithParams = 'jupytercad:newConeWithParams';
  export const newTorusWithParams = 'jupytercad:newTorusWithParams';
}

export const ShapeCreationCommandMap = {
  'Part::Box': ShapeCreationCommandIDs.newBoxWithParams,
  'Part::Cylinder': ShapeCreationCommandIDs.newCylinderWithParams,
  'Part::Sphere': ShapeCreationCommandIDs.newSphereWithParams,
  'Part::Cone': ShapeCreationCommandIDs.newConeWithParams,
  'Part::Torus': ShapeCreationCommandIDs.newTorusWithParams
};

export function addShapeCreationCommands(options: {
  tracker: WidgetTracker<JupyterCadWidget>;
  commands: CommandRegistry;
  trans: IRenderMime.TranslationBundle;
}) {
  const { commands, tracker, trans } = options;

  commands.addCommand(ShapeCreationCommandIDs.newBoxWithParams, {
    label: trans.__('New Box From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: ['Length', 'Width', 'Height', 'Placement'],
            properties: {
              Length: {
                type: 'number',
                exclusiveMinimum: 0,
                description: 'The length of the box (dX)'
              },
              Width: {
                type: 'number',
                exclusiveMinimum: 0,
                description: 'The width of the box (dY)'
              },
              Height: {
                type: 'number',
                exclusiveMinimum: 0,
                description: 'The height of the box (dZ)'
              },
              Color: {
                type: 'string',
                description: 'The color of the box',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: IBox;
    }) => {
      const { Name, filePath, parameters } = args;
      const current = tracker.find(w => w.model.filePath === filePath);

      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Box',
        parameters,
        visible: true,
        name: Name
      };

      await addObjectToSharedModel({ objectModel, jcadWidget: current });
    }) as any
  });
  commands.addCommand(ShapeCreationCommandIDs.newCylinderWithParams, {
    label: trans.__('New Cylinder From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: ['Radius', 'Angle', 'Height', 'Placement'],
            properties: {
              Radius: {
                type: 'number',
                exclusiveMinimum: 0,
                description: 'The radius of the cylinder base (must be > 0)'
              },
              Height: {
                type: 'number',
                exclusiveMinimum: 0,
                description: 'The cylinder height along its local Z axis'
              },
              Angle: {
                type: 'number',
                exclusiveMinimum: 0,
                default: 360,
                description:
                  'The angular span of the cylinder in degrees (0 = none, 360 = full).'
              },
              Color: {
                type: 'string',
                description: 'The color of the cylinder',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: ICylinder;
    }) => {
      const { Name, filePath, parameters } = args;
      const current = tracker.find(w => w.model.filePath === filePath);

      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Cylinder',
        parameters,
        visible: true,
        name: Name
      };

      await addObjectToSharedModel({ objectModel, jcadWidget: current });
    }) as any
  });
  commands.addCommand(ShapeCreationCommandIDs.newSphereWithParams, {
    label: trans.__('New Sphere From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: ['Radius', 'Angle1', 'Angle2', 'Angle3', 'Placement'],
            properties: {
              Radius: {
                type: 'number',
                exclusiveMinimum: 0,
                description: 'The radius of the sphere'
              },
              Angle1: {
                type: 'number',
                description:
                  'The lower polar angle limit in degrees (start of the vertical sweep, -90 = bottom pole).',
                default: -90
              },
              Angle2: {
                type: 'number',
                description:
                  'The upper polar angle limit in degrees (end of the vertical sweep, 90 = top pole).',
                default: 90
              },
              Angle3: {
                type: 'number',
                description:
                  'The azimuthal angle in degrees defining the sweep around the Z axis (360 = full sphere, < 360 = spherical wedge).',
                default: 360
              },
              Color: {
                type: 'string',
                description: 'The color of the sphere',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: ISphere;
    }) => {
      const { Name, filePath, parameters } = args;
      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Sphere',
        parameters,
        visible: true,
        name: Name
      };

      await addObjectToSharedModel({ objectModel, jcadWidget: current });
    }) as any
  });
  commands.addCommand(ShapeCreationCommandIDs.newConeWithParams, {
    label: trans.__('New Cone From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            required: ['Radius1', 'Radius2', 'Height', 'Angle', 'Placement'],
            type: 'object',
            properties: {
              Radius1: {
                type: 'number',
                exclusiveMinimum: 0,
                description:
                  'The radius of the bottom face of the cone (base circle).'
              },
              Radius2: {
                type: 'number',
                exclusiveMinimum: 0,
                description:
                  'The radius of the top face of the cone (tip circle). Set to 0 for a true cone.'
              },
              Height: {
                type: 'number',
                exclusiveMinimum: 0,
                description:
                  'The height of the cone along its local Z axis (distance between top and bottom faces).'
              },
              Angle: {
                type: 'number',
                exclusiveMinimum: 0,
                default: 360,
                description:
                  'The angular span of the cone in degrees (360 = full cone, < 360 = sector).'
              },
              Color: {
                type: 'string',
                description: 'The color of the cone',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: ICone;
    }) => {
      const { Name, filePath, parameters } = args;
      const current = tracker.find(w => w.model.filePath === filePath);

      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Cone',
        parameters,
        visible: true,
        name: Name
      };

      await addObjectToSharedModel({ objectModel, jcadWidget: current });
    }) as any
  });
  commands.addCommand(ShapeCreationCommandIDs.newTorusWithParams, {
    label: trans.__('New Torus From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: [
              'Radius1',
              'Radius2',
              'Angle1',
              'Angle2',
              'Angle3',
              'Placement'
            ],
            properties: {
              Radius1: {
                type: 'number',
                exclusiveMinimum: 0,
                description:
                  'The major radius of the torus (distance from the center of the torus to the center of the tube)'
              },
              Radius2: {
                type: 'number',
                exclusiveMinimum: 0,
                description:
                  'The minor radius of the torus (radius of the tube cross-section).'
              },
              Angle1: {
                type: 'number',
                default: -180,
                description:
                  'The start angle of the torus ring segment in degrees (defines the beginning of the sweep around the main axis).'
              },
              Angle2: {
                type: 'number',
                default: 180,
                description:
                  'The end angle of the torus ring segment in degrees (defines the end of the sweep around the main axis).'
              },
              Angle3: {
                type: 'number',
                default: 360,
                description:
                  'The angular span of the tube cross-section in degrees (360 = full tube, < 360 = partial tube).'
              },
              Color: {
                type: 'string',
                description: 'The color of the torus',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: ITorus;
    }) => {
      const { Name, filePath, parameters } = args;
      const current = tracker.find(w => w.model.filePath === filePath);

      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Torus',
        parameters,
        visible: true,
        name: Name
      };

      await addObjectToSharedModel({ objectModel, jcadWidget: current });
    }) as any
  });
}

export namespace DocumentActionCommandIDs {
  export const undoWithParams = 'jupytercad:undoWithParams';
  export const redoWithParams = 'jupytercad:redoWithParams';
  export const removeObjectWithParams = 'jupytercad:removeObjectWithParams';
  export const editShapeWithParams = 'jupytercad:editShapeWithParams';
}

export function addDocumentActionCommands(options: {
  tracker: WidgetTracker<JupyterCadWidget>;
  commands: CommandRegistry;
  trans: IRenderMime.TranslationBundle;
}) {
  const { commands, tracker, trans } = options;
  commands.addCommand(DocumentActionCommandIDs.undoWithParams, {
    label: trans.__('Undo from file name'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          }
        }
      }
    },
    execute: (async (args: { filePath: string }) => {
      const { filePath } = args;
      const current = tracker.find(w => w.model.filePath === filePath);
      if (current) {
        return current.model.sharedModel.undo();
      }
    }) as any
  });
  commands.addCommand(DocumentActionCommandIDs.redoWithParams, {
    label: trans.__('Redo from file name'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          }
        }
      }
    },
    execute: (async (args: { filePath: string }) => {
      const { filePath } = args;
      const current = tracker.find(w => w.model.filePath === filePath);
      if (current) {
        return current.model.sharedModel.redo();
      }
    }) as any
  });
  commands.addCommand(DocumentActionCommandIDs.removeObjectWithParams, {
    label: trans.__('Remove object from jcad file'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'objectId'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          objectId: {
            type: 'string',
            description: 'The id of the object to be removed'
          }
        }
      }
    },
    execute: ((args: { filePath: string; objectId: string }) => {
      const { filePath, objectId } = args;
      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current || !current.model.sharedModel.editable) {
        return;
      }
      const sharedModel = current.model.sharedModel;

      handleRemoveObject(objectId, sharedModel, () =>
        sharedModel.awareness.setLocalStateField('selected', {})
      );
    }) as any
  });
  commands.addCommand(DocumentActionCommandIDs.editShapeWithParams, {
    label: trans.__('Edit an object of the jcad file'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'objectName', 'objectProperties'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          objectName: {
            type: 'string',
            description: 'Name of the object to be edited'
          },
          objectProperties: {
            type: 'object',
            description:
              'The properties of the object to be edited, it must match the parameter schema of the object being edited'
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      objectName: string;
      objectProperties: IDict;
    }) => {
      const { filePath, objectName, objectProperties } = args;
      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current || !current.model.sharedModel.editable) {
        return;
      }
      await current.content.currentViewModel.maybeUpdateObjectParameters(
        objectName,
        objectProperties
      );
    }) as any
  });
}

export namespace ShapeOperationCommandIDs {
  export const cutWithParams = 'jupytercad:cutWithParamsWithParams';
  export const extrusionWithParams = 'jupytercad:extrusionWithParams';
  export const unionWithParams = 'jupytercad:unionWithParams';
  export const intersectionWithParams = 'jupytercad:intersectionWithParams';
  export const chamferWithParams = 'jupytercad:chamferWithParams';
  export const filletWithParams = 'jupytercad:filletWithParams';
}

export function addShapeOperationCommands(options: {
  tracker: WidgetTracker<JupyterCadWidget>;
  commands: CommandRegistry;
  trans: IRenderMime.TranslationBundle;
}) {
  const { commands, tracker, trans } = options;
  commands.addCommand(ShapeOperationCommandIDs.cutWithParams, {
    label: trans.__('Cut From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          Name: { type: 'string', description: 'The name of the cut object' },
          filePath: {
            type: 'string',
            description: 'The file path of the cut object'
          },
          parameters: {
            type: 'object',
            required: ['Base', 'Tool'],
            properties: {
              Base: {
                type: 'string',
                description: 'The base of the cut operator'
              },
              Tool: {
                type: 'string',
                description: 'The tool of the cut operator'
              },
              Refine: { type: 'boolean', description: 'Refine shape' },
              Color: {
                type: 'string',
                description: 'The color of the cut object',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: ICut;
    }) => {
      const { filePath, Name, parameters } = args;

      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Cut',
        parameters,
        visible: true,
        name: Name,
        dependencies: [parameters.Base, parameters.Tool]
      };
      return executeOperator(
        'Cut',
        objectModel,
        current,
        (sharedModel: IJupyterCadDoc) => {
          setVisible(sharedModel, parameters['Base'], false);
          setVisible(sharedModel, parameters['Tool'], false);

          sharedModel.addObject(objectModel);
        }
      );
    }) as any
  });

  commands.addCommand(ShapeOperationCommandIDs.extrusionWithParams, {
    label: trans.__('Extrusion From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: [
              'Base',
              'Dir',
              'LengthFwd',
              'LengthRev',
              'Solid',
              'Placement'
            ],
            properties: {
              Base: {
                type: 'string',
                description: 'Shape to extrude',
                fcType: 'App::PropertyLink'
              },
              Dir: {
                type: 'array',
                description: 'Direction of extrusion',
                items: { type: 'number' }
              },
              LengthFwd: {
                type: 'number',
                description: 'Length of extrusion along the direction'
              },
              LengthRev: {
                type: 'number',
                description: 'Length of extrusion against the direction'
              },
              Solid: {
                type: 'boolean',
                description: 'If true, creating a solid'
              },
              Color: {
                type: 'string',
                description: 'The color of the extrusion',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: IExtrusion;
    }) => {
      const { filePath, Name, parameters } = args;

      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Extrusion',
        parameters,
        visible: true,
        name: Name,
        dependencies: [parameters.Base]
      };
      return executeOperator(
        'Extrusion',
        objectModel,
        current,
        (sharedModel: IJupyterCadDoc) => {
          setVisible(sharedModel, parameters['Base'], false);

          sharedModel.addObject(objectModel);
        }
      );
    }) as any
  });

  commands.addCommand(ShapeOperationCommandIDs.intersectionWithParams, {
    label: trans.__('Intersection From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: ['Shapes', 'Refine', 'Placement'],
            properties: {
              Shapes: {
                type: 'array',
                description: 'The objects to intersect',
                items: { type: 'string' }
              },
              Refine: { type: 'boolean', description: 'Refine shape' },
              Color: {
                type: 'string',
                description: 'The color of the intersection',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: IIntersection;
    }) => {
      const { filePath, Name, parameters } = args;

      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::MultiCommon',
        parameters,
        visible: true,
        name: Name,
        dependencies: parameters.Shapes
      };
      return executeOperator(
        'Intersection',
        objectModel,
        current,
        (sharedModel: IJupyterCadDoc) => {
          parameters.Shapes.map((shape: string) => {
            setVisible(sharedModel, shape, false);
          });
          sharedModel.addObject(objectModel);
        }
      );
    }) as any
  });

  commands.addCommand(ShapeOperationCommandIDs.unionWithParams, {
    label: trans.__('Union From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: ['Shapes', 'Refine', 'Placement'],
            properties: {
              Shapes: {
                type: 'array',
                description: 'The shapes of the individual elements',
                items: { type: 'string' }
              },
              Refine: { type: 'boolean', description: 'Refine shape' },
              Color: {
                type: 'string',
                description: 'The color of the fused object',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: IFuse;
    }) => {
      const { filePath, Name, parameters } = args;

      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::MultiFuse',
        parameters,
        visible: true,
        name: Name,
        dependencies: parameters.Shapes
      };
      return executeOperator(
        'Fuse',
        objectModel,
        current,
        (sharedModel: IJupyterCadDoc) => {
          parameters.Shapes.map((shape: string) => {
            setVisible(sharedModel, shape, false);
          });
          sharedModel.addObject(objectModel);
        }
      );
    }) as any
  });

  commands.addCommand(ShapeOperationCommandIDs.chamferWithParams, {
    label: trans.__('Chamfer From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: ['Base', 'Edge', 'Dist', 'Placement'],
            properties: {
              Base: { type: 'string', description: 'The name of input object' },
              Edge: {
                anyOf: [
                  { type: 'number', minimum: 0, description: 'The edge index' },
                  {
                    type: 'array',
                    items: { type: 'number', minimum: 0 },
                    description: 'List of edge indices'
                  }
                ]
              },
              Dist: {
                type: 'number',
                minimum: 0,
                description: 'The distance of the symmetric chamfer'
              },
              Color: {
                type: 'string',
                description: 'The color of the chamfer',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: IChamfer;
    }) => {
      const { filePath, Name, parameters } = args;
      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Chamfer',
        parameters,
        visible: true,
        name: Name,
        dependencies: [parameters.Base]
      };
      return executeOperator(
        'Chamfer',
        objectModel,
        current,
        (sharedModel: IJupyterCadDoc) => {
          setVisible(sharedModel, parameters.Base, false);

          sharedModel.addObject(objectModel);
        }
      );
    }) as any
  });

  commands.addCommand(ShapeOperationCommandIDs.filletWithParams, {
    label: trans.__('Fillet From Parameters'),
    isEnabled: () => true,
    describedBy: {
      args: {
        type: 'object',
        required: ['filePath', 'Name', 'parameters'],
        properties: {
          filePath: {
            type: 'string',
            description: 'The path to the jcad file to be modified'
          },
          Name: { type: 'string', description: 'Name of the new object' },
          parameters: {
            type: 'object',
            required: ['Base', 'Edge', 'Radius', 'Placement'],
            properties: {
              Base: {
                type: 'string',
                description: 'The name of input object',
                fcType: 'App::PropertyLink'
              },
              Edge: {
                anyOf: [
                  { type: 'number', minimum: 0, description: 'The edge index' },
                  {
                    type: 'array',
                    items: { type: 'number', minimum: 0 },
                    description: 'List of edge indices'
                  }
                ]
              },
              Radius: {
                type: 'number',
                exclusiveMinimum: 0,
                description: 'The radius for the fillet'
              },
              Color: {
                type: 'string',
                description: 'The color of the fillet',
                default: '#808080'
              },
              Placement: DEFAULT_PLACEMENT_SCHEMA
            }
          }
        }
      }
    },
    execute: (async (args: {
      filePath: string;
      Name: string;
      parameters: IFillet;
    }) => {
      const { filePath, Name, parameters } = args;

      const current = tracker.find(w => w.model.filePath === filePath);
      if (!current) {
        return;
      }
      const objectModel: IJCadObject = {
        shape: 'Part::Fillet',
        parameters,
        visible: true,
        name: Name,
        dependencies: [parameters.Base]
      };
      return executeOperator(
        'Fillet',
        objectModel,
        current,
        (sharedModel: IJupyterCadDoc) => {
          setVisible(sharedModel, parameters.Base, false);

          sharedModel.addObject(objectModel);
        }
      );
    }) as any
  });
}

export const ShapeOperationCommandMap = {
  'Part::Cut': ShapeOperationCommandIDs.cutWithParams,
  'Part::Extrusion': ShapeOperationCommandIDs.extrusionWithParams,
  'Part::Fillet': ShapeOperationCommandIDs.filletWithParams,
  'Part::Chamfer': ShapeOperationCommandIDs.chamferWithParams,
  'Part::MultiFuse': ShapeOperationCommandIDs.unionWithParams,
  'Part::MultiCommon': ShapeOperationCommandIDs.intersectionWithParams
};
