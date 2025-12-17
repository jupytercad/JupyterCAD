import { ICollaborativeContentProvider } from '@jupyter/collaborative-drive';
import { logoIcon, CommandIDs as BaseCommandIDs } from '@jupytercad/base';
import {
  SCHEMA_VERSION,
  IAnnotationModel,
  IAnnotationToken,
  IJCadExternalCommandRegistry,
  IJCadExternalCommandRegistryToken,
  IJCadWorkerRegistry,
  IJCadWorkerRegistryToken,
  IJupyterCadDocTracker,
  IJupyterCadWidget,
  JupyterCadDoc
} from '@jupytercad/schema';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette,
  IThemeManager,
  WidgetTracker
} from '@jupyterlab/apputils';
import { SharedDocumentFactory } from '@jupyterlab/services';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { ConsolePanel, IConsoleTracker } from '@jupyterlab/console';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILauncher } from '@jupyterlab/launcher';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { JupyterCadDocumentWidgetFactory } from '../factory';
import { JupyterCadJcadModelFactory } from './modelfactory';
import { MimeDocumentFactory } from '@jupyterlab/docregistry';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const FACTORY = 'JupyterCAD';
const CONTENT_TYPE = 'jcad';
const PALETTE_CATEGORY = 'JupyterCAD';
const SETTINGS_ID = '@jupytercad/jupytercad-core:jupytercad-settings';

namespace CommandIDs {
  export const createNew = 'jupytercad:create-new-jcad-file';
}

const activate = async (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  themeManager: IThemeManager,
  annotationModel: IAnnotationModel,
  browserFactory: IFileBrowserFactory,
  workerRegistry: IJCadWorkerRegistry,
  externalCommandRegistry: IJCadExternalCommandRegistry,
  contentFactory: ConsolePanel.IContentFactory,
  editorServices: IEditorServices,
  rendermime: IRenderMimeRegistry,
  consoleTracker: IConsoleTracker,
  launcher: ILauncher | null,
  palette: ICommandPalette | null,
  collaborativeContentProvider: ICollaborativeContentProvider | null,
  settingRegistry?: ISettingRegistry
): Promise<void> => {
  let settings: ISettingRegistry.ISettings | null = null;

  if (settingRegistry) {
    try {
      settings = await settingRegistry.load(SETTINGS_ID);
      console.log(`Loaded settings for ${SETTINGS_ID}`, settings);
    } catch (error) {
      console.warn(`Failed to load settings for ${SETTINGS_ID}`, error);
    }
  } else {
    console.warn('No settingRegistry available; using default settings.');
  }

  const widgetFactory = new JupyterCadDocumentWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-jcadmodel',
    fileTypes: [CONTENT_TYPE],
    defaultFor: [CONTENT_TYPE],
    tracker,
    commands: app.commands,
    workerRegistry,
    externalCommandRegistry,
    manager: app.serviceManager,
    contentFactory,
    rendermime,
    mimeTypeService: editorServices.mimeTypeService,
    consoleTracker
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  const factory = new MimeDocumentFactory({
    dataType: 'json',
    rendermime,
    modelName: 'jupytercad-jcadmodel',
    name: 'JSON Editor',
    primaryFileType: app.docRegistry.getFileType('json'),
    fileTypes: [CONTENT_TYPE]
  });
  app.docRegistry.addWidgetFactory(factory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadJcadModelFactory({
    annotationModel,
    settingRegistry
  });
  app.docRegistry.addModelFactory(modelFactory);
  // register the filetype
  app.docRegistry.addFileType({
    name: CONTENT_TYPE,
    displayName: 'JCAD',
    mimeTypes: ['text/json'],
    extensions: ['.jcad', '.JCAD'],
    fileFormat: 'text',
    contentType: CONTENT_TYPE,
    icon: logoIcon
  });

  const jcadSharedModelFactory: SharedDocumentFactory = () => {
    return new JupyterCadDoc();
  };
  if (collaborativeContentProvider) {
    collaborativeContentProvider.sharedModelFactory.registerDocumentFactory(
      CONTENT_TYPE,
      jcadSharedModelFactory
    );
  }

  widgetFactory.widgetCreated.connect((sender, widget) => {
    widget.title.icon = logoIcon;
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    themeManager.themeChanged.connect((_, changes) =>
      widget.model.themeChanged.emit(changes)
    );
    tracker.add(widget);
    app.shell.activateById('jupytercad::leftControlPanel');
  });

  app.commands.addCommand(CommandIDs.createNew, {
    label: args => (args['label'] as string) ?? 'CAD file',
    caption: 'Create a new JCAD Editor',
    icon: logoIcon,
    describedBy: {
      args: {
        type: 'object',
        properties: {
          label: {
            type: 'string',
            description: 'The label for the file creation command'
          },
          cwd: {
            type: 'string',
            description:
              'The current working directory where the file should be created'
          }
        }
      }
    },
    execute: async args => {
      // Get the directory in which the JCAD file must be created;
      // otherwise take the current filebrowser directory
      const cwd = (args['cwd'] ||
        browserFactory.tracker.currentWidget?.model.path) as string;

      // Create a new untitled Blockly file
      let model = await app.serviceManager.contents.newUntitled({
        path: cwd,
        type: 'file',
        ext: '.jcad'
      });

      model = await app.serviceManager.contents.save(model.path, {
        ...model,
        format: 'text',
        size: undefined,
        content: `{\n\t"schemaVersion": "${SCHEMA_VERSION}",\n\t"objects": [],\n\t"options": {},\n\t"metadata": {},\n\t"outputs": {}}`
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
    launcher.add({
      command: CommandIDs.createNew,
      category: 'Other',
      rank: 1
    });
  }

  // Add the command to the palette
  if (palette) {
    palette.addItem({
      command: CommandIDs.createNew,
      category: PALETTE_CATEGORY
    });

    for (const command in BaseCommandIDs) {
      palette.addItem({
        command: BaseCommandIDs[command],
        category: PALETTE_CATEGORY
      });
    }
  }

  // Inject “New JupyterCAD file” into the File Browser context menu
  app.contextMenu.addItem({
    command: CommandIDs.createNew,
    selector: '.jp-DirListing',
    rank: 55,
    args: { label: 'New JupyterCAD file' }
  });
};

const jcadPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:jcadplugin',
  requires: [
    IJupyterCadDocTracker,
    IThemeManager,
    IAnnotationToken,
    IFileBrowserFactory,
    IJCadWorkerRegistryToken,
    IJCadExternalCommandRegistryToken,
    ConsolePanel.IContentFactory,
    IEditorServices,
    IRenderMimeRegistry,
    IConsoleTracker
  ],
  optional: [
    ILauncher,
    ICommandPalette,
    ICollaborativeContentProvider,
    ISettingRegistry
  ],
  autoStart: true,
  activate
};

export default jcadPlugin;
