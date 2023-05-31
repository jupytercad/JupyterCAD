import {
  ICollaborativeDrive,
  SharedDocumentFactory
} from '@jupyter/docprovider';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette,
  IThemeManager,
  showErrorMessage,
  WidgetTracker
} from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILauncher } from '@jupyterlab/launcher';
import { fileIcon } from '@jupyterlab/ui-components';

import { JupyterCadWidgetFactory } from '../factory';
import { JupyterCadDoc } from '../model';
import { IAnnotation, IJupyterCadDocTracker } from '../token';
import { requestAPI } from '../tools';
import { IAnnotationModel, IJupyterCadWidget } from '../types';
import { JupyterCadFCModelFactory } from './modelfactory';

const FACTORY = 'Jupytercad Freecad Factory';

// const PALETTE_CATEGORY = 'JupyterCAD';

namespace CommandIDs {
  export const createNew = 'jupytercad:create-new-FCStd-file';
}

const activate = async (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  themeManager: IThemeManager,
  annotationModel: IAnnotationModel,
  browserFactory: IFileBrowserFactory,
  drive: ICollaborativeDrive,
  launcher: ILauncher | null,
  palette: ICommandPalette | null
): Promise<void> => {
  const fcCheck = await requestAPI<{ installed: boolean }>(
    'cad/backend-check',
    {
      method: 'POST',
      body: JSON.stringify({
        backend: 'FreeCAD'
      })
    }
  );
  const { installed } = fcCheck;
  const backendCheck = () => {
    if (!installed) {
      showErrorMessage(
        'FreeCAD is not installed',
        'FreeCAD is required to open FCStd files'
      );
    }
    return installed;
  };
  const widgetFactory = new JupyterCadWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-fcmodel',
    fileTypes: ['FCStd'],
    defaultFor: ['FCStd'],
    tracker,
    commands: app.commands,
    backendCheck
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadFCModelFactory({ annotationModel });
  app.docRegistry.addModelFactory(modelFactory);
  // register the filetype
  app.docRegistry.addFileType({
    name: 'FCStd',
    displayName: 'FCStd',
    mimeTypes: ['application/octet-stream'],
    extensions: ['.FCStd', 'fcstd'],
    fileFormat: 'base64',
    contentType: 'FCStd'
  });

  const FCStdSharedModelFactory: SharedDocumentFactory = () => {
    return new JupyterCadDoc();
  };
  drive.sharedModelFactory.registerDocumentFactory(
    'FCStd',
    FCStdSharedModelFactory
  );

  widgetFactory.widgetCreated.connect((sender, widget) => {
    // Notify the instance tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    themeManager.themeChanged.connect((_, changes) =>
      widget.context.model.themeChanged.emit(changes)
    );

    tracker.add(widget);
    app.shell.activateById('jupytercad::leftControlPanel');
    app.shell.activateById('jupytercad::rightControlPanel');
  });

  app.commands.addCommand(CommandIDs.createNew, {
    label: args => (args['isPalette'] ? 'New FCStd Editor' : 'FCStd Editor'),
    caption: 'Create a new FCStd Editor',
    icon: args => (args['isPalette'] ? undefined : fileIcon),
    execute: async args => {
      // Get the directory in which the FCStd file must be created;
      // otherwise take the current filebrowser directory
      const cwd = (args['cwd'] ||
        browserFactory.tracker.currentWidget?.model.path) as string;

      // Create a new untitled Blockly file
      let model = await app.serviceManager.contents.newUntitled({
        path: cwd,
        type: 'file',
        ext: '.FCStd'
      });

      console.debug('Model:', model);
      model = await app.serviceManager.contents.save(model.path, {
        ...model,
        format: 'base64',
        size: undefined,
        content: btoa('')
      });

      // Open the newly created file with the 'Editor'
      return app.commands.execute('docmanager:open', {
        path: model.path,
        factory: FACTORY
      });
    }
  });

  // Add the command to the launcher
  if (launcher) {
    /* launcher.add({
      command: CommandIDs.createNew,
      category: 'Other',
      rank: 1
    }); */
  }

  // Add the command to the palette
  if (palette) {
    /* palette.addItem({
      command: CommandIDs.createNew,
      args: { isPalette: true },
      category: PALETTE_CATEGORY
    }); */
  }
};

const fcplugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:fcplugin',
  requires: [
    IJupyterCadDocTracker,
    IThemeManager,
    IAnnotation,
    IFileBrowserFactory,
    ICollaborativeDrive
  ],
  optional: [ILauncher, ICommandPalette],
  autoStart: true,
  activate
};

export default fcplugin;
