import { FormDialog } from '@jupytercad/base';
import {
  IDict,
  //   IJCadObject,
  //   IJupyterCadModel,
  IJupyterCadTracker
} from '@jupytercad/schema';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { showErrorMessage } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';

export namespace CommandIDs {
  export const exportSTL = 'jupytercad:stl:export';
}

// The form schema is now defined directly here
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

      formJsonSchema.properties.Object.enum = objectNames;

      // Find the right-clicked object name from the DOM
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
        Object: selectedObjectName,
        LinearDeflection: 0.01,
        AngularDeflection: 0.05
      };

      const dialog = new FormDialog({
        model,
        title: 'Export to STL',
        sourceData,
        schema: formJsonSchema,
        syncData: (props: IDict) => {
          // TODO: This is where the new logic will go.
          // 1. Call viewModel.exportObject(props.Object, 'STL', { ...options })
          // 2. Receive STL content
          // 3. Trigger download
          console.log('Export properties:', props);
          alert('Exporting is not implemented yet!');
        },
        cancelButton: true
      });
      await dialog.launch();
    };
  }
}
