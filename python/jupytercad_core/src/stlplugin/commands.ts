import { FormDialog } from '@jupytercad/base';
import {
  IDict,
  IJCadObject,
  IJupyterCadModel,
  IJupyterCadTracker,
  JCadWorkerSupportedFormat
} from '@jupytercad/schema';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { showErrorMessage } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';

export namespace CommandIDs {
  export const exportSTL = 'jupytercad:stl:export';
}

const formSchema = {
  type: 'object',
  properties: {
    Object: {
      type: 'string',
      description: 'The object to export to STL',
      enum: []
    },
    LinearDeflection: {
      type: 'number',
      description: 'Linear deflection (smaller = more triangles)',
      minimum: 0.0001,
      maximum: 1.0,
      default: 0.01
    },
    AngularDeflection: {
      type: 'number',
      description: 'Angular deflection in radians',
      minimum: 0.01,
      maximum: 1.0,
      default: 0.05
    }
  },
  required: ['Object'],
  additionalProperties: false
};

export function addCommands(
  app: JupyterFrontEnd,
  tracker: IJupyterCadTracker,
  translator: ITranslator
) {
  const trans = translator.load('jupyterlab');
  const { commands } = app;
  commands.addCommand(CommandIDs.exportSTL, {
    label: trans.__('Export to STL...'),
    isEnabled: () => Boolean(tracker.currentWidget),
    execute: Private.executeExportSTL(app, tracker)
  });
}

namespace Private {
  const stlOperator = {
    title: 'Export to STL',
    syncData: (model: IJupyterCadModel) => {
      return (props: IDict) => {
        const { Name, ...parameters } = props;
        const objectModel = {
          shape: 'Post::ExportSTL',
          parameters,
          visible: true,
          name: Name,
          shapeMetadata: {
            shapeFormat: JCadWorkerSupportedFormat.STL,
            workerId: 'jupytercad-stl:worker'
          }
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

  export function executeExportSTL(
    app: JupyterFrontEnd,
    tracker: IJupyterCadTracker
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

      const node = app.contextMenuHitTest(node =>
        node.classList.contains('jpcad-object-tree-item')
      );
      const clickedObjectName = node?.dataset.objectName;

      const selected = model.localState?.selected?.value || {};
      const selectedObjectNames = Object.keys(selected);
      const selectedObjectName =
        clickedObjectName ||
        (selectedObjectNames.length > 0
          ? selectedObjectNames[0]
          : objectNames[0]);

      const sourceData = {
        Name: selectedObjectName
          ? `${selectedObjectName}_STL_Export`
          : 'STL_Export',
        Object: selectedObjectName,
        LinearDeflection: 0.1,
        AngularDeflection: 0.5
      };

      const dialog = new FormDialog({
        model: current.model,
        title: stlOperator.title,
        sourceData,
        schema: formJsonSchema,
        syncData: stlOperator.syncData(current.model),
        cancelButton: true
      });
      await dialog.launch();
    };
  }
}
