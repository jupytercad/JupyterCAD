import {
  ICollaborativeDrive,
  SharedDocumentFactory
} from '@jupyter/collaborative-drive';
import {
  IJCadWorkerRegistry,
  IJCadWorkerRegistryToken,
  IJupyterCadDocTracker,
  // IJupyterCadTracker,
  IJupyterCadWidget,
  IJCadExternalCommandRegistry,
  IJCadExternalCommandRegistryToken
} from '@jupytercad/schema';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { JupyterCadStlModelFactory } from './modelfactory';
import { JupyterCadDocumentWidgetFactory } from '../factory';
import { JupyterCadStlDoc } from './model';
import { stlIcon } from '@jupytercad/base';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { addCommands, CommandIDs } from './commands';
import { STLWorker } from './worker';

const FACTORY = 'JupyterCAD STL Viewer';
const SETTINGS_ID = '@jupytercad/jupytercad-core:jupytercad-settings';

const activate = async (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>, // CORRECT: Using the concrete class
  themeManager: IThemeManager,
  workerRegistry: IJCadWorkerRegistry,
  externalCommandRegistry: IJCadExternalCommandRegistry,
  drive: ICollaborativeDrive | null,
  settingRegistry?: ISettingRegistry,
  translator?: ITranslator
): Promise<void> => {
  let settings: ISettingRegistry.ISettings | null = null;
  translator = translator ?? nullTranslator;

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

  const WORKER_ID = 'jupytercad-stl:worker';
  const worker = new STLWorker({ tracker });
  workerRegistry.registerWorker(WORKER_ID, worker);

  addCommands(app, tracker, translator);

  const widgetFactory = new JupyterCadDocumentWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-stlmodel',
    fileTypes: ['stl'],
    defaultFor: ['stl'],
    tracker,
    commands: app.commands,
    workerRegistry,
    externalCommandRegistry
  });

  app.docRegistry.addWidgetFactory(widgetFactory);

  const modelFactory = new JupyterCadStlModelFactory(
    settingRegistry ? { settingRegistry } : {}
  );
  app.docRegistry.addModelFactory(modelFactory);

  app.docRegistry.addFileType({
    name: 'stl',
    displayName: 'STL',
    mimeTypes: ['text/plain'],
    extensions: ['.stl', '.STL'],
    fileFormat: 'text',
    contentType: 'stl',
    icon: stlIcon
  });

  const stlSharedModelFactory: SharedDocumentFactory = () => {
    return new JupyterCadStlDoc();
  };
  if (drive) {
    drive.sharedModelFactory.registerDocumentFactory(
      'stl',
      stlSharedModelFactory
    );
  }

  widgetFactory.widgetCreated.connect((sender, widget) => {
    widget.title.icon = stlIcon;
    widget.context.pathChanged.connect(() => {
      tracker.save(widget); // This works because the type is WidgetTracker
    });
    themeManager.themeChanged.connect((_, changes) =>
      widget.model.themeChanged.emit(changes)
    );
    tracker.add(widget); // This also works
    app.shell.activateById('jupytercad::leftControlPanel');
    app.shell.activateById('jupytercad::rightControlPanel');
  });

  // Add the command to the context menu for the object tree
  app.contextMenu.addItem({
    command: CommandIDs.exportSTL,
    selector: '.jpcad-object-tree-item',
    rank: 10
  });
};

const stlPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:stlplugin',
  requires: [
    IJupyterCadDocTracker,
    IThemeManager,
    IJCadWorkerRegistryToken,
    IJCadExternalCommandRegistryToken
  ],
  optional: [ICollaborativeDrive, ISettingRegistry, ITranslator],
  autoStart: true,
  activate
};

export default stlPlugin;
