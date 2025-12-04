import {
  IDict,
  IJCadFormSchemaRegistry,
  IJCadObject,
  IJCadWorkerRegistry,
  IJupyterCadModel,
  IJupyterCadTracker,
  JCadWorkerSupportedFormat,
  Parts
} from '@jupytercad/schema';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { showErrorMessage, WidgetTracker } from '@jupyterlab/apputils';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { PathExt } from '@jupyterlab/coreutils';
import { ITranslator } from '@jupyterlab/translation';
import { filterIcon, redoIcon, undoIcon } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { JSONObject } from '@lumino/coreutils';
import { Menu } from '@lumino/widgets';
import { v4 as uuid } from 'uuid';

import { DEFAULT_MESH_COLOR } from '../3dview/helpers';
import { FormDialog } from '../formdialog';
import keybindings from '../keybindings.json';
import { SketcherDialog } from '../sketcher/sketcherdialog';
import {
  axesIcon,
  boxIcon,
  chamferIcon,
  clippingIcon,
  rulerIcon,
  coneIcon,
  cutIcon,
  cylinderIcon,
  explodedViewIcon,
  extrusionIcon,
  filletIcon,
  intersectionIcon,
  pencilSolidIcon,
  requestAPI,
  sphereIcon,
  torusIcon,
  transformIcon,
  unionIcon,
  videoSolidIcon,
  wireframeIcon
} from '../tools';
import { ExplodedView, JupyterCadTracker } from '../types';
import { JupyterCadDocumentWidget, JupyterCadWidget } from '../widget';
import {
  addDocumentActionCommands,
  addShapeCreationCommands,
  addShapeOperationCommands,
  DocumentActionCommandIDs,
  ShapeCreationCommandMap,
  ShapeOperationCommandMap
} from './operationcommands';
import {
  getSelectedEdges,
  getSelectedMeshName,
  getSelectedObject,
  newName,
  PARTS
} from './tools';

const OPERATORS = {
  cut: {
    title: 'Cut parameters',
    shape: 'Part::Cut',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected?.value || {};
      const sel0 = getSelectedMeshName(selected, 0);
      const sel1 = getSelectedMeshName(selected, 1);
      const baseName = sel0 || objects[0].name || '';
      const baseModel = model.sharedModel.getObjectByName(baseName);
      return {
        Name: newName('Cut', model),
        Base: baseName,
        Tool: sel1 || objects[1].name || '',
        Refine: false,
        Color: baseModel?.parameters?.Color || DEFAULT_MESH_COLOR,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  extrusion: {
    title: 'Extrusion parameters',
    shape: 'Part::Extrusion',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected?.value || {};
      const sel0 = getSelectedMeshName(selected, 0);
      const baseName = sel0 || objects[0].name || '';
      const baseModel = model.sharedModel.getObjectByName(baseName);
      return {
        Name: newName('Extrusion', model),
        Base: baseName,
        Dir: [0, 0, 1],
        LengthFwd: 10,
        LengthRev: 0,
        Solid: false,
        Color: baseModel?.parameters?.Color || DEFAULT_MESH_COLOR,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  union: {
    title: 'Fuse parameters',
    shape: 'Part::MultiFuse',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected?.value || {};

      const selectedShapes = Object.keys(selected).map(key => key);

      // Fallback to at least two objects if selection is empty
      const baseShapes =
        selectedShapes.length > 0
          ? selectedShapes
          : [objects[0].name || '', objects[1].name || ''];

      const baseModel = model.sharedModel.getObjectByName(baseShapes[0]);
      return {
        Name: newName('Union', model),
        Shapes: baseShapes,
        Refine: false,
        Color: baseModel?.parameters?.Color || DEFAULT_MESH_COLOR,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  intersection: {
    title: 'Intersection parameters',
    shape: 'Part::MultiCommon',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selected = model.localState?.selected?.value || {};
      const sel0 = getSelectedMeshName(selected, 0);
      const sel1 = getSelectedMeshName(selected, 1);
      const baseName = sel0 || objects[0].name || '';
      const baseModel = model.sharedModel.getObjectByName(baseName);
      return {
        Name: newName('Intersection', model),
        Shapes: [baseName, sel1 || objects[1].name || ''],
        Refine: false,
        Color: baseModel?.parameters?.Color || DEFAULT_MESH_COLOR,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  chamfer: {
    title: 'Chamfer parameters',
    shape: 'Part::Chamfer',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const selectedEdges = getSelectedEdges(model.localState?.selected?.value);
      const baseName = selectedEdges?.shape || objects[0].name || '';
      const baseModel = model.sharedModel.getObjectByName(baseName);
      return {
        Name: newName('Chamfer', model),
        Base: baseName,
        Edge: selectedEdges?.edgeIndices || [],
        Dist: 0.2,
        Color: baseModel?.parameters?.Color || DEFAULT_MESH_COLOR,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  },
  fillet: {
    title: 'Fillet parameters',
    shape: 'Part::Fillet',
    default: (model: IJupyterCadModel) => {
      const objects = model.getAllObject();
      const sel = getSelectedEdges(model.localState?.selected?.value);
      const baseName = sel?.shape || objects[0].name || '';
      const baseModel = model.sharedModel.getObjectByName(baseName);
      return {
        Name: newName('Fillet', model),
        Base: baseName,
        Edge: sel?.edgeIndices || [],
        Radius: 0.2,
        Color: baseModel?.parameters?.Color || DEFAULT_MESH_COLOR,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      };
    }
  }
};

const EXPORT_FORM = {
  title: 'Export to .jcad',
  schema: {
    type: 'object',
    required: ['Name'],
    additionalProperties: false,
    properties: {
      Name: {
        title: 'File name',
        description: 'The exported file name',
        type: 'string'
      }
    }
  },
  default: (model: IJupyterCadModel) => {
    return {
      Name: PathExt.basename(model.filePath).replace(
        PathExt.extname(model.filePath),
        '.jcad'
      )
    };
  },
  syncData: (model: IJupyterCadModel) => {
    return (props: IDict) => {
      const endpoint = model.sharedModel?.toJcadEndpoint;
      if (!endpoint) {
        showErrorMessage('Error', 'Missing endpoint.');
        return;
      }
      const { Name } = props;
      requestAPI<{ done: boolean }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ path: model.filePath, newName: Name })
      });
    };
  }
};

function loadKeybindings(commands: CommandRegistry, keybindings: any[]) {
  keybindings.forEach(binding => {
    commands.addKeyBinding({
      command: binding.command,
      keys: binding.keys,
      selector: binding.selector
    });
  });
}

function getSelectedObjectId(widget: JupyterCadWidget): string {
  const selected = widget.model.sharedModel.awareness.getLocalState()?.selected;

  if (selected && selected?.value) {
    const selectedKey = Object.keys(selected?.value)[0];
    const selectedItem = selected?.value[selectedKey];
    if (selectedItem.type === 'edge' && selectedItem.parent) {
      return selectedItem.parent;
    }
    return selectedKey;
  }
  return '';
}

/**
 * Add the FreeCAD commands to the application's command registry.
 */
export function addCommands(
  app: JupyterFrontEnd,
  tracker: WidgetTracker<JupyterCadWidget>,
  translator: ITranslator,
  formSchemaRegistry: IJCadFormSchemaRegistry,
  workerRegistry: IJCadWorkerRegistry,
  completionProviderManager: ICompletionProviderManager | undefined
): void {
  workerRegistry.getWorker;
  const trans = translator.load('jupyterlab');
  const { commands } = app;
  Private.updateFormSchema(formSchemaRegistry);

  addShapeCreationCommands({ tracker, commands, trans });
  addShapeOperationCommands({ tracker, commands, trans });
  addDocumentActionCommands({ tracker, commands, trans });
  commands.addCommand(CommandIDs.toggleConsole, {
    label: trans.__('Toggle console'),
    isVisible: () => tracker.currentWidget instanceof JupyterCadDocumentWidget,
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    isToggled: () => {
      return tracker.currentWidget?.content.consoleOpened === true;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      await Private.toggleConsole(tracker);
      commands.notifyCommandChanged(CommandIDs.toggleConsole);
    }
  });
  commands.addCommand(CommandIDs.executeConsole, {
    label: trans.__('Execute console'),
    isVisible: () => tracker.currentWidget instanceof JupyterCadDocumentWidget,
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => Private.executeConsole(tracker)
  });
  commands.addCommand(CommandIDs.removeConsole, {
    label: trans.__('Remove console'),
    isVisible: () => tracker.currentWidget instanceof JupyterCadDocumentWidget,
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => Private.removeConsole(tracker)
  });

  commands.addCommand(CommandIDs.invokeCompleter, {
    label: trans.__('Display the completion helper.'),
    isVisible: () => tracker.currentWidget instanceof JupyterCadDocumentWidget,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => {
      const currentWidget = tracker.currentWidget;
      if (!currentWidget || !completionProviderManager) {
        return;
      }
      const id = currentWidget.content.consolePanel?.id;
      if (id) {
        return completionProviderManager.invoke(id);
      }
    }
  });

  commands.addCommand(CommandIDs.selectCompleter, {
    label: trans.__('Select the completion suggestion.'),
    isVisible: () => tracker.currentWidget instanceof JupyterCadDocumentWidget,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => {
      const currentWidget = tracker.currentWidget;
      if (!currentWidget || !completionProviderManager) {
        return;
      }
      const id = currentWidget.content.consolePanel?.id;
      if (id) {
        return completionProviderManager.select(id);
      }
    }
  });
  commands.addCommand(CommandIDs.redo, {
    label: trans.__('Redo'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: args => {
      const current = tracker.currentWidget;

      if (current) {
        return current.model.sharedModel.redo();
      }
    },
    icon: redoIcon
  });

  commands.addCommand(CommandIDs.undo, {
    label: trans.__('Undo'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: args => {
      const current = tracker.currentWidget;

      if (current) {
        return current.model.sharedModel.undo();
      }
    },
    icon: undoIcon
  });
  commands.addCommand(CommandIDs.newSketch, {
    label: trans.__('New Sketch'),
    icon: pencilSolidIcon,
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async args => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const props = {
        sharedModel: current.model.sharedModel,
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

  commands.addCommand(CommandIDs.removeObject, {
    label: trans.__('Remove Object'),
    isEnabled: () => {
      const current = tracker.currentWidget;
      return current ? current.model.sharedModel.editable : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return;
      }

      const objectId = getSelectedObjectId(current);
      if (!objectId) {
        console.warn('No object is selected.');
        return;
      }
      commands.execute(DocumentActionCommandIDs.removeObjectWithParams, {
        filePath: current.model.filePath,
        objectId
      });
    }
  });

  commands.addCommand(CommandIDs.newBox, {
    label: trans.__('New Box'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: boxIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.createPart('box', tracker, commands)
  });

  commands.addCommand(CommandIDs.newCylinder, {
    label: trans.__('New Cylinder'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: cylinderIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.createPart('cylinder', tracker, commands)
  });

  commands.addCommand(CommandIDs.newSphere, {
    label: trans.__('New Sphere'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: sphereIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.createPart('sphere', tracker, commands)
  });

  commands.addCommand(CommandIDs.newCone, {
    label: trans.__('New Cone'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: coneIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.createPart('cone', tracker, commands)
  });

  commands.addCommand(CommandIDs.newTorus, {
    label: trans.__('New Torus'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: torusIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.createPart('torus', tracker, commands)
  });

  commands.addCommand(CommandIDs.extrusion, {
    label: trans.__('Extrusion'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: extrusionIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.launchOperatorDialog('extrusion', tracker, commands)
  });

  commands.addCommand(CommandIDs.cut, {
    label: trans.__('Cut'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: cutIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.launchOperatorDialog('cut', tracker, commands)
  });

  commands.addCommand(CommandIDs.union, {
    label: trans.__('Union'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: unionIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.launchOperatorDialog('union', tracker, commands)
  });

  commands.addCommand(CommandIDs.intersection, {
    label: trans.__('Intersection'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: intersectionIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.launchOperatorDialog('intersection', tracker, commands)
  });

  commands.addCommand(CommandIDs.wireframe, {
    label: trans.__('Toggle Wireframe'),
    isEnabled: () => {
      return tracker.currentWidget !== null;
    },
    isToggled: () => {
      const current = tracker.currentWidget?.content;
      return current?.wireframe || false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget?.content;

      if (!current) {
        return;
      }
      current.wireframe = !current.wireframe;
      commands.notifyCommandChanged(CommandIDs.wireframe);
    },
    icon: wireframeIcon
  });

  tracker.currentChanged.connect(() => {
    commands.notifyCommandChanged(CommandIDs.wireframe);
  });

  commands.addCommand(CommandIDs.transform, {
    label: trans.__('Toggle Transform Controls'),
    isEnabled: () => {
      const current = tracker.currentWidget;
      if (!current || !current.model.sharedModel.editable) {
        return false;
      }

      const viewModel = current.content.currentViewModel;
      if (!viewModel) {
        return false;
      }

      const viewSettings = viewModel.viewSettings as JSONObject;
      return viewSettings.explodedView
        ? !(viewSettings.explodedView as ExplodedView).enabled
        : true;
    },
    isToggled: () => {
      const current = tracker.currentWidget?.content;
      return current?.transform || false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget?.content;

      if (!current) {
        return;
      }

      current.transform = !current.transform;
      commands.notifyCommandChanged(CommandIDs.transform);
    },
    icon: transformIcon
  });

  tracker.currentChanged.connect(() => {
    commands.notifyCommandChanged(CommandIDs.transform);
  });

  commands.addCommand(CommandIDs.chamfer, {
    label: trans.__('Make chamfer'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: chamferIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.launchOperatorDialog('chamfer', tracker, commands)
  });

  commands.addCommand(CommandIDs.fillet, {
    label: trans.__('Make fillet'),
    isEnabled: () => {
      return tracker.currentWidget
        ? tracker.currentWidget.model.sharedModel.editable
        : false;
    },
    icon: filletIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.launchOperatorDialog('fillet', tracker, commands)
  });

  commands.addCommand(CommandIDs.updateAxes, {
    label: trans.__('Axes Helper'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: axesIcon,
    isToggled: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return false;
      }
      return current.model.jcadSettings.showAxesHelper;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget;
      if (!current) {
        return;
      }

      try {
        const settings = await current.model.getSettings();

        if (settings?.composite) {
          const currentValue = settings.composite.showAxesHelper ?? false;
          await settings.set('showAxesHelper', !currentValue);
        } else {
          const currentValue = current.model.jcadSettings.showAxesHelper;
          current.model.jcadSettings.showAxesHelper = !currentValue;
        }

        current.model.emitSettingChanged('showAxesHelper');
        commands.notifyCommandChanged(CommandIDs.updateAxes);
      } catch (err) {
        console.error('Failed to toggle Axes Helper:', err);
      }
    }
  });

  commands.addCommand(CommandIDs.updateExplodedView, {
    label: trans.__('Exploded View'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: explodedViewIcon,
    isToggled: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return false;
      }

      const viewModel = current.content.currentViewModel;
      if (!viewModel) {
        return false;
      }

      const viewSettings = viewModel.viewSettings as JSONObject;
      return viewSettings?.explodedView
        ? (viewSettings.explodedView as ExplodedView).enabled
        : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }
      const panel = current.content;

      if (panel.explodedView.enabled) {
        panel.explodedView = { ...panel.explodedView, enabled: false };
      } else {
        panel.explodedView = { ...panel.explodedView, enabled: true };
      }
      commands.notifyCommandChanged(CommandIDs.updateExplodedView);

      // Notify change so that toggle button for transform disables if needed
      commands.notifyCommandChanged(CommandIDs.transform);
    }
  });

  commands.addCommand(CommandIDs.updateCameraSettings, {
    label: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return trans.__('Switch Camera Projection');
      }
      const currentType = current.model.jcadSettings.cameraType;
      return currentType === 'Perspective'
        ? trans.__('Switch to orthographic projection')
        : trans.__('Switch to perspective projection');
    },
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: videoSolidIcon,
    isToggled: () => {
      const current = tracker.currentWidget;
      return current?.model.jcadSettings.cameraType === 'Orthographic';
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget;
      if (!current) {
        return;
      }

      try {
        const settings = await current.model.getSettings();

        if (settings?.composite) {
          // If settings exist, toggle there
          const currentType = settings.composite.cameraType;
          const newType =
            currentType === 'Perspective' ? 'Orthographic' : 'Perspective';
          await settings.set('cameraType', newType);
        } else {
          // Fallback: directly toggle model's own jcadSettings
          const currentType = current.model.jcadSettings.cameraType;
          current.model.jcadSettings.cameraType =
            currentType === 'Perspective' ? 'Orthographic' : 'Perspective';
          current.model.emitSettingChanged('cameraType');
        }

        commands.notifyCommandChanged(CommandIDs.updateCameraSettings);
      } catch (err) {
        console.error('Failed to toggle camera projection:', err);
      }
    }
  });

  commands.addCommand(CommandIDs.updateClipView, {
    label: trans.__('Clipping'),
    isEnabled: () => {
      return Boolean(tracker.currentWidget);
    },
    isToggled: () => {
      const current = tracker.currentWidget?.content;
      return current?.clipView?.enabled || false;
    },
    icon: clippingIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const panel = current.content;
      panel.clipView = panel.clipView || {
        enabled: false,
        showClipPlane: true
      };

      panel.clipView.enabled = !panel.clipView.enabled;

      const { enabled, showClipPlane } = panel.clipView;
      panel.clipView = { enabled: enabled, showClipPlane: showClipPlane };
      commands.notifyCommandChanged(CommandIDs.updateClipView);
    }
  });

  commands.addCommand(CommandIDs.toggleMeasurement, {
    label: trans.__('Toggle Measurement'),
    isEnabled: () => {
      return tracker.currentWidget !== null;
    },
    isToggled: () => {
      const current = tracker.currentWidget?.content;
      return current?.measurement ?? false;
    },
    icon: rulerIcon,
    execute: async () => {
      const current = tracker.currentWidget?.content;
      if (!current) {
        return;
      }
      current.measurement = !current.measurement;
      commands.notifyCommandChanged(CommandIDs.toggleMeasurement);
    }
  });

  tracker.currentChanged.connect(() => {
    commands.notifyCommandChanged(CommandIDs.updateClipView);
  });

  commands.addCommand(CommandIDs.splitScreen, {
    label: trans.__('Split screen'),
    isEnabled: () => Boolean(tracker.currentWidget),
    icon: filterIcon,
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }
      if (current.content.splitScreen) {
        current.content.splitScreen = {
          enabled: !current.content.splitScreen.enabled
        };
      }
    }
  });

  commands.addCommand(CommandIDs.exportJcad, {
    label: trans.__('Export to .jcad'),
    isEnabled: () => {
      return Boolean(tracker.currentWidget?.model?.sharedModel?.toJcadEndpoint);
    },
    iconClass: 'fa fa-file-export',
    describedBy: { args: { type: 'object', properties: {} } },
    execute: async () => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }

      const dialog = new FormDialog({
        model: current.model,
        title: EXPORT_FORM.title,
        schema: EXPORT_FORM.schema,
        sourceData: EXPORT_FORM.default(tracker.currentWidget?.model),
        syncData: EXPORT_FORM.syncData(tracker.currentWidget?.model),
        cancelButton: true
      });
      await dialog.launch();
    }
  });
  commands.addCommand(CommandIDs.copyObject, {
    label: trans.__('Copy Object'),
    isEnabled: () => {
      const current = tracker.currentWidget;
      return current ? current.model.sharedModel.editable : false;
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return;
      }

      const objectId = getSelectedObjectId(current);
      const sharedModel = current.model.sharedModel;
      const objectData = sharedModel.getObjectByName(objectId);

      if (!objectData) {
        console.warn('Could not retrieve object data.');
        return;
      }

      current.model.setCopiedObject(objectData);
    }
  });
  commands.addCommand(CommandIDs.pasteObject, {
    label: trans.__('Paste Object'),
    isEnabled: () => {
      const current = tracker.currentWidget;
      const clipboard = current?.model.getCopiedObject();
      const editable = current?.model.sharedModel.editable;
      return !!(current && clipboard && editable);
    },
    describedBy: { args: { type: 'object', properties: {} } },
    execute: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return;
      }

      const sharedModel = current.model.sharedModel;
      const copiedObject = current.model.getCopiedObject();
      if (!copiedObject) {
        console.error('No object in clipboard to paste.');
        return;
      }

      const clipboard = copiedObject;

      const originalName = clipboard.name || 'Unnamed Object';
      let newName = originalName;

      let counter = 1;
      while (sharedModel.objects.some(obj => obj.name === newName)) {
        newName = `${originalName} Copy${counter > 1 ? ` ${counter}` : ''}`;
        counter++;
      }
      const jcadModel = current.model;
      const newObject = { ...clipboard, name: newName, visible: true };
      sharedModel.addObject(newObject);
      jcadModel.syncSelected({ [newObject.name]: { type: 'shape' } }, uuid());
    }
  });

  commands.addCommand(CommandIDs.exportAsSTL, {
    label: trans.__('Export as STL'),
    isEnabled: () => Boolean(tracker.currentWidget),
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.executeExport(app, tracker, 'STL')
  });

  commands.addCommand(CommandIDs.exportAsBREP, {
    label: trans.__('Export as BREP'),
    isEnabled: () => Boolean(tracker.currentWidget),
    describedBy: { args: { type: 'object', properties: {} } },
    execute: Private.executeExport(app, tracker, 'BREP')
  });

  // Create the export submenu
  const exportMenu = new Menu({ commands: app.commands });
  exportMenu.title.label = 'Export as';
  exportMenu.addItem({ command: CommandIDs.exportAsSTL });
  exportMenu.addItem({ command: CommandIDs.exportAsBREP });

  app.contextMenu.addItem({
    type: 'submenu',
    submenu: exportMenu,
    selector: '.jpcad-object-tree-item',
    rank: 10
  });

  loadKeybindings(commands, keybindings);
}

/**
 * The command IDs used by the FreeCAD plugin.
 */
export namespace CommandIDs {
  export const redo = 'jupytercad:redo';
  export const undo = 'jupytercad:undo';

  export const newSketch = 'jupytercad:sketch';

  export const removeObject = 'jupytercad:removeObject';

  export const newBox = 'jupytercad:newBox';
  export const newCylinder = 'jupytercad:newCylinder';
  export const newSphere = 'jupytercad:newSphere';
  export const newCone = 'jupytercad:newCone';
  export const newTorus = 'jupytercad:newTorus';

  export const cut = 'jupytercad:cut';
  export const extrusion = 'jupytercad:extrusion';
  export const union = 'jupytercad:union';
  export const intersection = 'jupytercad:intersection';
  export const wireframe = 'jupytercad:wireframe';
  export const transform = 'jupytercad:transform';

  export const copyObject = 'jupytercad:copyObject';
  export const pasteObject = 'jupytercad:pasteObject';

  export const chamfer = 'jupytercad:chamfer';
  export const fillet = 'jupytercad:fillet';

  export const updateAxes = 'jupytercad:updateAxes';
  export const updateExplodedView = 'jupytercad:updateExplodedView';
  export const updateCameraSettings = 'jupytercad:updateCameraSettings';
  export const updateClipView = 'jupytercad:updateClipView';
  export const toggleMeasurement = 'jupytercad:toggleMeasurement';

  export const splitScreen = 'jupytercad:splitScreen';
  export const exportJcad = 'jupytercad:exportJcad';

  export const toggleConsole = 'jupytercad:toggleConsole';
  export const invokeCompleter = 'jupytercad:invokeConsoleCompleter';
  export const removeConsole = 'jupytercad:removeConsole';
  export const executeConsole = 'jupytercad:executeConsole';
  export const selectCompleter = 'jupytercad:selectConsoleCompleter';

  export const exportAsSTL = 'jupytercad:stl:export-as-stl';
  export const exportAsBREP = 'jupytercad:stl:export-as-brep';
}

namespace Private {
  export const FORM_SCHEMA = {};

  export function updateFormSchema(
    formSchemaRegistry: IJCadFormSchemaRegistry
  ) {
    if (Object.keys(FORM_SCHEMA).length > 0) {
      return;
    }
    const formSchema = formSchemaRegistry.getSchemas();
    formSchema.forEach((val, key) => {
      if (key === 'Placement of the box') {
        return;
      }
      const value = (FORM_SCHEMA[key] = JSON.parse(JSON.stringify(val)));
      value['required'] = ['Name', ...value['required']];
      value['properties'] = {
        Name: { type: 'string', description: 'The Name of the Object' },
        ...value['properties']
      };
    });
  }

  export function createPart(
    part: keyof typeof PARTS,
    tracker: WidgetTracker<JupyterCadWidget>,
    commands?: CommandRegistry
  ) {
    return async (args: any) => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }
      const value = PARTS[part];
      current.model.syncFormData(value);

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
        current.model.syncSelectedPropField({
          id: property,
          value,
          parentType
        });
      };

      const dialog = new FormDialog({
        model: current.model,
        title: value.title,
        sourceData: value.default(current.model),
        schema: FORM_SCHEMA[value.shape],
        syncData: async (props: IDict) => {
          const { Name, ...parameters } = props;
          const shapeName = value.shape as Parts;
          const commandId = ShapeCreationCommandMap[shapeName];
          if (commands && commandId) {
            return await commands.execute(commandId, {
              Name,
              filePath: current.model.filePath,
              parameters
            });
          }
        },
        cancelButton: () => {
          current.model.syncFormData(undefined);
        },
        syncSelectedPropField: syncSelectedField
      });
      await dialog.launch();
    };
  }

  export function launchOperatorDialog(
    operator: keyof typeof OPERATORS,
    tracker: WidgetTracker<JupyterCadWidget>,
    commands: CommandRegistry
  ) {
    return async (args: any) => {
      const current = tracker.currentWidget;

      if (!current) {
        return;
      }
      const op = OPERATORS[operator];

      // Fill form schema with available objects
      const form_schema = JSON.parse(JSON.stringify(FORM_SCHEMA[op.shape]));
      const allObjects = current.model.getAllObject().map(o => o.name);
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
      const operatorCommandId = ShapeOperationCommandMap[op.shape];
      if (!operatorCommandId) {
        return;
      }
      const syncData = async (props: IDict) => {
        const { Name, ...parameters } = props;
        await commands.execute(operatorCommandId, {
          Name,
          filePath: current.model.filePath,
          parameters
        });
      };
      const dialog = new FormDialog({
        model: current.model,
        title: op.title,
        sourceData: op.default(current.model),
        schema: form_schema,
        syncData,
        cancelButton: true
      });
      await dialog.launch();
    };
  }

  const exportOperator = {
    title: 'Export to STL/BREP',
    syncData: (model: IJupyterCadModel) => {
      return (props: IDict) => {
        const { Name, Type, LinearDeflection, AngularDeflection, ...rest } =
          props;
        const shapeFormat =
          Type === 'BREP'
            ? JCadWorkerSupportedFormat.BREP
            : JCadWorkerSupportedFormat.STL;

        // Choose workerId based on format
        const workerId =
          shapeFormat === JCadWorkerSupportedFormat.BREP
            ? 'jupytercad-brep:worker'
            : 'jupytercad-stl:worker';

        // Only include mesh parameters for STL
        const parameters =
          Type === 'STL'
            ? { ...rest, Type, LinearDeflection, AngularDeflection }
            : { ...rest, Type };

        const objectModel = {
          shape: 'Post::Export',
          parameters,
          visible: true,
          name: Name,
          shapeMetadata: { shapeFormat, workerId }
        };
        const sharedModel = model.sharedModel;
        if (sharedModel) {
          sharedModel.transact(() => {
            if (!sharedModel.objectExists(objectModel.name)) {
              sharedModel.addObject(objectModel as IJCadObject);
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
  };

  export function executeExport(
    app: JupyterFrontEnd,
    tracker: IJupyterCadTracker,
    exportType: 'STL' | 'BREP'
  ) {
    return async (args: any) => {
      const current = tracker.currentWidget;
      if (!current) {
        return;
      }
      const model = current.model;
      if (!model) {
        return;
      }

      const formSchema = {
        type: 'object',
        properties: {
          Object: {
            type: 'string',
            description: 'The object to export',
            enum: []
          },
          Type: {
            type: 'string',
            default: 'STL',
            enum: ['BREP', 'STL'],
            description: 'The filetype for export (Brep/Stl)'
          },
          LinearDeflection: {
            type: 'number',
            description: 'Linear deflection (smaller = more triangles)',
            minimum: 0.0001,
            maximum: 1.0,
            default: 0.1
          },
          AngularDeflection: {
            type: 'number',
            description: 'Angular deflection in radians',
            minimum: 0.01,
            maximum: 1.0,
            default: 0.5
          }
        },
        required: ['Object', 'Type'],
        additionalProperties: false
      };

      const formJsonSchema = JSON.parse(JSON.stringify(formSchema));
      const objects = model.getAllObject();
      const objectNames = objects.map(obj => obj.name);

      if (objectNames.length === 0) {
        showErrorMessage(
          'No Objects',
          'There are no objects in the document to export.'
        );
        return;
      }

      formJsonSchema['required'] = ['Name', ...formJsonSchema['required']];
      formJsonSchema['properties'] = {
        Name: { type: 'string', description: 'The Name of the Export Object' },
        ...formJsonSchema['properties']
      };
      formJsonSchema['properties']['Object']['enum'] = objectNames;

      // Remove Type field from form since user already chose it
      delete formJsonSchema['properties']['Type'];
      formJsonSchema['required'] = formJsonSchema['required'].filter(
        (field: string) => field !== 'Type'
      );

      // Hide mesh params for BREP
      if (exportType === 'BREP') {
        delete formJsonSchema['properties']['LinearDeflection'];
        delete formJsonSchema['properties']['AngularDeflection'];
      }

      const clickedObjectName = getSelectedObject(app, model, objectNames);

      const sourceData = {
        Name: clickedObjectName
          ? `${clickedObjectName}_${exportType}`
          : `${exportType}`,
        Object: clickedObjectName,
        Type: exportType,
        ...(exportType === 'STL'
          ? { LinearDeflection: 0.1, AngularDeflection: 0.5 }
          : {})
      };

      const dialog = new FormDialog({
        model: current.model,
        title: exportOperator.title,
        sourceData,
        schema: formJsonSchema,
        syncData: exportOperator.syncData(current.model),
        cancelButton: true
      });
      await dialog.launch();
    };
  }

  export function executeConsole(
    tracker: WidgetTracker<JupyterCadWidget>
  ): void {
    const current = tracker.currentWidget;

    if (!current || !(current instanceof JupyterCadDocumentWidget)) {
      return;
    }
    current.content.executeConsole();
  }

  export function removeConsole(
    tracker: WidgetTracker<JupyterCadWidget>
  ): void {
    const current = tracker.currentWidget;

    if (!current || !(current instanceof JupyterCadDocumentWidget)) {
      return;
    }
    current.content.removeConsole();
  }

  export async function toggleConsole(
    tracker: JupyterCadTracker
  ): Promise<void> {
    const current = tracker.currentWidget;

    if (!current || !(current instanceof JupyterCadDocumentWidget)) {
      return;
    }
    await current.content.toggleConsole(current.model.filePath);
  }
}
