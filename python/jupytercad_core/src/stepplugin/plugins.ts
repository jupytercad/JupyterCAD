import { ICollaborativeContentProvider } from '@jupyter/collaborative-drive';
import {
  IJCadWorkerRegistry,
  IJCadWorkerRegistryToken,
  IJupyterCadDocTracker,
  IJupyterCadWidget,
  IJCadExternalCommandRegistry,
  IJCadExternalCommandRegistryToken
} from '@jupytercad/schema';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { SharedDocumentFactory } from '@jupyterlab/services';
import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { JupyterCadStepModelFactory } from './modelfactory';
import { JupyterCadDocumentWidgetFactory } from '../factory';
import { JupyterCadStepDoc } from './model';
import { stpIcon } from '@jupytercad/base';

const FACTORY = 'JupyterCAD STEP Viewer';
const SETTINGS_ID = '@jupytercad/jupytercad-core:jupytercad-settings';

const activate = async (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  themeManager: IThemeManager,
  workerRegistry: IJCadWorkerRegistry,
  externalCommandRegistry: IJCadExternalCommandRegistry,
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
    modelName: 'jupytercad-stepmodel',
    fileTypes: ['step'],
    defaultFor: ['step'],
    tracker,
    commands: app.commands,
    workerRegistry,
    externalCommandRegistry
  });
  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadStepModelFactory({ settingRegistry });
  app.docRegistry.addModelFactory(modelFactory);
  // register the filetype
  app.docRegistry.addFileType({
    name: 'step',
    displayName: 'STEP',
    mimeTypes: ['text/plain'],
    extensions: ['.step', '.STEP'],
    fileFormat: 'text',
    contentType: 'step',
    icon: stpIcon
  });

  const stepSharedModelFactory: SharedDocumentFactory = () => {
    return new JupyterCadStepDoc();
  };
  if (collaborativeContentProvider) {
    collaborativeContentProvider.sharedModelFactory.registerDocumentFactory(
      'step',
      stepSharedModelFactory
    );
  }

  widgetFactory.widgetCreated.connect((sender, widget) => {
    widget.title.icon = stpIcon;
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    themeManager.themeChanged.connect((_, changes) =>
      widget.model.themeChanged.emit(changes)
    );
    tracker.add(widget);
    app.shell.activateById('jupytercad::leftControlPanel');
    app.shell.activateById('jupytercad::rightControlPanel');
  });
};

const stepPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:stepplugin',
  requires: [
    IJupyterCadDocTracker,
    IThemeManager,
    IJCadWorkerRegistryToken,
    IJCadExternalCommandRegistryToken
  ],
  optional: [ICollaborativeContentProvider, ISettingRegistry],
  autoStart: true,
  activate
};

export default stepPlugin;
