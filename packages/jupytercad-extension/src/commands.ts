import { JupyterFrontEnd } from '@jupyterlab/application';
import { showErrorMessage, WidgetTracker } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';
import { SketcherDialog } from './sketcher/sketcherdialog';
import { FormDialog } from './formdialog';
import {
  axesIcon,
  boxIcon,
  coneIcon,
  cutIcon,
  cylinderIcon,
  explodedViewIcon,
  extrusionIcon,
  intersectionIcon,
  sphereIcon,
  torusIcon,
  unionIcon
} from './tools';

import { IDict, IJupyterCadDoc, IJupyterCadModel } from './types';
import { JupyterCadPanel, JupyterCadWidget } from './widget';
import formSchema from './_interface/forms.json';
import { IJCadObject, Parts } from './_interface/jcad';
import { redoIcon, undoIcon } from '@jupyterlab/ui-components';

const FORM_SCHEMA = {};
// Injecting "name" in the schema, as it's not part of the official schema but
// we still want to configure it in the dialog
Object.keys(formSchema).forEach(key => {
  if (key === 'Placement of the box') {
    return;
  }
  const value = (FORM_SCHEMA[key] = JSON.parse(
    JSON.stringify(formSchema[key])
  ));
  value['required'] = ['Name', ...value['required']];
  value['properties'] = {
    Name: { type: 'string', description: 'The Name of the Object' },
    ...value['properties']
  };
});

function newName(type: string, model: IJupyterCadModel): string {
  const sharedModel = model.sharedModel;

  let n = 1;
  let name = `${type} 1`;
  while (sharedModel.objectExists(name)) {
    name = `${type} ${++n}`;
  }

  return name;
}

const PARTS = {
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
        Radius: 5,
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
        Radius1: 10,
        Radius2: 2,
        Angle1: -180,
        Angle2: 180,
        Angle3: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  }
};

function setVisible(sharedModel: IJupyterCadDoc, name: string, value: boolean) {
  const guidata = sharedModel.getOption('guidata') || {};

  if (guidata && guidata[name]) {
    guidata[name]['visibility'] = false;
  } else {
    guidata[name] = { visibility: false };
  }

  sharedModel.setOption('guidata', guidata);
}

const OPERATORS = {
  cut: {
    title: 'Cut parameters',
    shape: 'Part::Cut',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected.value || [];
      return {
        Name: newName('Cut', model),
        Base: selected.length > 0 ? selected[0] : objects[0].name ?? '',
        Tool: selected.length > 1 ? selected[1] : objects[1].name ?? '',
        Refine: false,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    },
    syncData: (model: IJupyterCadModel) => {
      return (props: IDict) => {
        const { Name, ...parameters } = props;
        const objectModel: IJCadObject = {
          shape: 'Part::Cut',
          parameters,
          visible: true,
          name: Name
        };
        const sharedModel = model.sharedModel;
        if (sharedModel) {
          sharedModel.transact(() => {
            setVisible(sharedModel, parameters['Base'], false);
            setVisible(sharedModel, parameters['Tool'], false);

            if (!sharedModel.objectExists(objectModel.name)) {
              sharedModel.addObject(objectModel);
            } else {
              showErrorMessage(
                'The object already exists',
                'There is an existing object with the same name.'
              );
            }
          });
        }
      };
    }
  },
  extrusion: {
    title: 'Extrusion parameters',
    shape: 'Part::Extrusion',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected.value || [];
      return {
        Name: newName('Extrusion', model),
        Base: [selected.length > 0 ? selected[0] : objects[0].name ?? ''],
        Dir: [0, 0, 1],
        LengthFwd: 10,
        LengthRev: 0,
        Solid: false,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    },
    syncData: (model: IJupyterCadModel) => {
      return (props: IDict) => {
        const { Name, ...parameters } = props;
        const objectModel: IJCadObject = {
          shape: 'Part::Extrusion',
          parameters,
          visible: true,
          name: Name
        };
        const sharedModel = model.sharedModel;
        if (sharedModel) {
          setVisible(sharedModel, parameters['Base'], false);

          sharedModel.transact(() => {
            if (!sharedModel.objectExists(objectModel.name)) {
              sharedModel.addObject(objectModel);
            } else {
              showErrorMessage(
                'The object already exists',
                'There is an existing object with the same name.'
              );
            }
          });
        }
      };
    }
  },
  union: {
    title: 'Fuse parameters',
    shape: 'Part::MultiFuse',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected.value || [];
      return {
        Name: newName('Union', model),
        Shapes: [
          selected.length > 0 ? selected[0] : objects[0].name ?? '',
          selected.length > 1 ? selected[1] : objects[1].name ?? ''
        ],
        Refine: false,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    },
    syncData: (model: IJupyterCadModel) => {
      return (props: IDict) => {
        const { Name, ...parameters } = props;
        const objectModel: IJCadObject = {
          shape: 'Part::MultiFuse',
          parameters,
          visible: true,
          name: Name
        };
        const sharedModel = model.sharedModel;
        if (sharedModel) {
          sharedModel.transact(() => {
            parameters['Shapes'].map((shape: string) => {
              setVisible(sharedModel, shape, false);
            });

            if (!sharedModel.objectExists(objectModel.name)) {
              sharedModel.addObject(objectModel);
            } else {
              showErrorMessage(
                'The object already exists',
                'There is an existing object with the same name.'
              );
            }
          });
        }
      };
    }
  },
  intersection: {
    title: 'Intersection parameters',
    shape: 'Part::MultiCommon',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected.value || [];
      return {
        Name: newName('Intersection', model),
        Shapes: [
          selected.length > 0 ? selected[0] : objects[0].name ?? '',
          selected.length > 1 ? selected[1] : objects[1].name ?? ''
        ],
        Refine: false,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    },
    syncData: (model: IJupyterCadModel) => {
      return (props: IDict) => {
        const { Name, ...parameters } = props;
        const objectModel: IJCadObject = {
          shape: 'Part::MultiCommon',
          parameters,
          visible: true,
          name: Name
        };
        const sharedModel = model.sharedModel;
        if (sharedModel) {
          sharedModel.transact(() => {
            parameters['Shapes'].map((shape: string) => {
              setVisible(sharedModel, shape, false);
            });

            if (!sharedModel.objectExists(objectModel.name)) {
              sharedModel.addObject(objectModel);
            } else {
              showErrorMessage(
                'The object already exists',
                'There is an existing object with the same name.'
              );
            }
          });
        }
      };
    }
  }
};

const AXES_FORM = {
  title: 'Axes Helper',
  schema: {
    type: 'object',
    required: ['Size', 'Visible'],
    additionalProperties: false,
    properties: {
      Size: {
        type: 'number',
        description: 'Size of the axes'
      },
      Visible: {
        type: 'boolean',
        description: 'Whether the axes are visible or not'
      }
    }
  },
  default: (panel: JupyterCadPanel) => {
    return {
      Size: panel.axes?.size ?? 5,
      Visible: panel.axes?.visible ?? true
    };
  },
  syncData: (panel: JupyterCadPanel) => {
    return (props: IDict) => {
      const { Size, Visible } = props;
      panel.axes = {
        size: Size,
        visible: Visible
      };
    };
  }
};

const EXPLODED_VIEW_FORM = {
  title: 'Exploded View Settings',
  schema: {
    type: 'object',
    required: ['Enabled', 'Factor'],
    additionalProperties: false,
    properties: {
      Enabled: {
        type: 'boolean',
        description: 'Whether the exploded view is enabled or not'
      },
      Factor: {
        type: 'number',
        description: 'The exploded view factor'
      }
    }
  },
  default: (panel: JupyterCadPanel) => {
    return {
      Enabled: panel.explodedView?.enabled ?? false,
      Factor: panel.explodedView?.factor ?? 0.5
    };
  },
  syncData: (panel: JupyterCadPanel) => {
    return (props: IDict) => {
      const { Enabled, Factor } = props;
      panel.explodedView = {
        enabled: Enabled,
        factor: Factor
      };
    };
  }
};

/**
 * Add the FreeCAD commands to the application's command registry.
 */
export function addCommands(
  app: JupyterFrontEnd,
  tracker: WidgetTracker<JupyterCadWidget>,
  translator: ITranslator
): void {
  const trans = translator.load('jupyterlab');
  const { commands } = app;

  commands.addCommand(CommandIDs.redo, {
    label: trans.__('Redo'),
    isEnabled: () => Boolean(tracker.currentWidget),
    execute: args => {
      const current = tracker.currentWidget;

      if (current) {
        return current.context.model.sharedModel.redo();
      }
    },
    icon: redoIcon
  });

  commands.addCommand(CommandIDs.undo, {
    label: trans.__('Undo'),
    isEnabled: () => Boolean(tracker.currentWidget),
    execute: args => {
      const current = tracker.currentWidget;

      if (current) {
        return current.context.model.sharedModel.undo();
      }
    },
    icon: undoIcon
  });
  commands.addCommand(CommandIDs.newSketch, {
    label: trans.__('New Sketch'),
    iconClass: 'fa fa-pencil',
    isEnabled: () => Boolean(tracker.currentWidget),
    execute: async args => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const props = {
        sharedModel: current.context.model.sharedModel,
        closeCallback: {
          handler: () => {
            /* Awful hack to allow the body can close the dialog*/
          }
        }
      };
      const dialog = new SketcherDialog(props);
      props.closeCallback.handler = () => dialog.close();
      await dialog.launch();
    }
  });

  commands.addCommand(CommandIDs.newBox, {
    label: trans.__('New Box'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: boxIcon,
    execute: Private.createPart('box', tracker)
  });

  commands.addCommand(CommandIDs.newCylinder, {
    label: trans.__('New Cylinder'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: cylinderIcon,
    execute: Private.createPart('cylinder', tracker)
  });

  commands.addCommand(CommandIDs.newSphere, {
    label: trans.__('New Sphere'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: sphereIcon,
    execute: Private.createPart('sphere', tracker)
  });

  commands.addCommand(CommandIDs.newCone, {
    label: trans.__('New Cone'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: coneIcon,
    execute: Private.createPart('cone', tracker)
  });

  commands.addCommand(CommandIDs.newTorus, {
    label: trans.__('New Torus'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: torusIcon,
    execute: Private.createPart('torus', tracker)
  });

  commands.addCommand(CommandIDs.extrusion, {
    label: trans.__('Extrusion'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: extrusionIcon,
    execute: Private.executeOperator('extrusion', tracker)
  });

  commands.addCommand(CommandIDs.cut, {
    label: trans.__('Cut'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: cutIcon,
    execute: Private.executeOperator('cut', tracker)
  });

  commands.addCommand(CommandIDs.union, {
    label: trans.__('Union'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: unionIcon,
    execute: Private.executeOperator('union', tracker)
  });

  commands.addCommand(CommandIDs.intersection, {
    label: trans.__('Intersection'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: intersectionIcon,
    execute: Private.executeOperator('intersection', tracker)
  });

  commands.addCommand(CommandIDs.updateAxes, {
    label: trans.__('Axes Helper'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: axesIcon,
    execute: async () => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const dialog = new FormDialog({
        context: current.context,
        title: AXES_FORM.title,
        schema: AXES_FORM.schema,
        sourceData: AXES_FORM.default(current.content),
        syncData: AXES_FORM.syncData(current.content),
        cancelButton: true
      });
      await dialog.launch();
    }
  });

  commands.addCommand(CommandIDs.updateExplodedView, {
    label: trans.__('Exploded View'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: explodedViewIcon,
    execute: async () => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const dialog = new FormDialog({
        context: current.context,
        title: EXPLODED_VIEW_FORM.title,
        schema: EXPLODED_VIEW_FORM.schema,
        sourceData: EXPLODED_VIEW_FORM.default(current.content),
        syncData: EXPLODED_VIEW_FORM.syncData(current.content),
        cancelButton: true
      });
      await dialog.launch();
    }
  });
}

/**
 * The command IDs used by the FreeCAD plugin.
 */
export namespace CommandIDs {
  export const redo = 'jupytercad:redo';
  export const undo = 'jupytercad:undo';

  export const newSketch = 'jupytercad:sketch';

  export const newBox = 'jupytercad:newBox';
  export const newCylinder = 'jupytercad:newCylinder';
  export const newSphere = 'jupytercad:newSphere';
  export const newCone = 'jupytercad:newCone';
  export const newTorus = 'jupytercad:newTorus';

  export const cut = 'jupytercad:cut';
  export const extrusion = 'jupytercad:extrusion';
  export const union = 'jupytercad:union';
  export const intersection = 'jupytercad:intersection';

  export const updateAxes = 'jupytercad:updateAxes';
  export const updateExplodedView = 'jupytercad:updateExplodedView';
}

namespace Private {
  export function createPart(
    part: keyof typeof PARTS,
    tracker: WidgetTracker<JupyterCadWidget>
  ) {
    return async (args: any) => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const value = PARTS[part];

      current.context.model.syncFormData(value);

      const syncSelectedField = (
        id: string | null,
        value: any,
        parentType: 'panel' | 'dialog'
      ): void => {
        let property: string | null = null;
        if (id) {
          const prefix = id.split('_')[0];
          property = id.substring(prefix.length);
        }
        current.context.model.syncSelectedPropField({
          id: property,
          value,
          parentType
        });
      };

      const dialog = new FormDialog({
        context: current.context,
        title: value.title,
        sourceData: value.default(current.context.model),
        schema: FORM_SCHEMA[value.shape],
        syncData: (props: IDict) => {
          const { Name, ...parameters } = props;
          const objectModel: IJCadObject = {
            shape: value.shape as Parts,
            parameters,
            visible: true,
            name: Name
          };

          const sharedModel = current.context.model.sharedModel;
          if (sharedModel) {
            if (!sharedModel.objectExists(objectModel.name)) {
              sharedModel.addObject(objectModel);
            } else {
              showErrorMessage(
                'The object already exists',
                'There is an existing object with the same name.'
              );
            }
          }
        },
        cancelButton: () => {
          current.context.model.syncFormData(undefined);
        },
        syncSelectedPropField: syncSelectedField
      });
      await dialog.launch();
    };
  }

  export function executeOperator(
    operator: keyof typeof OPERATORS,
    tracker: WidgetTracker<JupyterCadWidget>
  ) {
    return async (args: any) => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const op = OPERATORS[operator];

      // Fill form schema with available objects
      const form_schema = JSON.parse(JSON.stringify(FORM_SCHEMA[op.shape]));
      const allObjects = current.context.model.getAllObject().map(o => o.name);
      for (const prop in form_schema['properties']) {
        const fcType = form_schema['properties'][prop]['fcType'];
        if (fcType) {
          const propDef = form_schema['properties'][prop];
          switch (fcType) {
            case 'App::PropertyLink':
              propDef['enum'] = allObjects;
              break;
            case 'App::PropertyLinkList':
              propDef['items']['enum'] = allObjects;
              break;
            default:
          }
        }
      }

      const dialog = new FormDialog({
        context: current.context,
        title: op.title,
        sourceData: op.default(current.context.model),
        schema: form_schema,
        syncData: op.syncData(current.context.model),
        cancelButton: true
      });
      await dialog.launch();
    };
  }
}
