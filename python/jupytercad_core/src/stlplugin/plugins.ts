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
import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { SharedDocumentFactory } from '@jupyterlab/services';

import { JupyterCadStlModelFactory } from './modelfactory';
import { JupyterCadDocumentWidgetFactory } from '../factory';
import { JupyterCadStlDoc } from './model';
import { stlIcon } from '@jupytercad/base';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ExportWorker } from './worker';
import { JCadWorkerSupportedFormat } from '@jupytercad/schema';

const FACTORY = 'JupyterCAD STL Viewer';
const SETTINGS_ID = '@jupytercad/jupytercad-core:jupytercad-settings';

const activate = async (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  themeManager: IThemeManager,
  workerRegistry: IJCadWorkerRegistry,
  externalCommandRegistry: IJCadExternalCommandRegistry,
  collaborativeContentProvider: ICollaborativeContentProvider | null,
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

  const stlWorker = new ExportWorker({
    tracker,
    shapeFormat: JCadWorkerSupportedFormat.STL
  });
  workerRegistry.registerWorker('jupytercad-stl:worker', stlWorker);

  const brepWorker = new ExportWorker({
    tracker,
    shapeFormat: JCadWorkerSupportedFormat.BREP
  });
  workerRegistry.registerWorker('jupytercad-brep:worker', brepWorker);

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
  if (collaborativeContentProvider) {
    collaborativeContentProvider.sharedModelFactory.registerDocumentFactory(
      'stl',
      stlSharedModelFactory
    );
  }

  widgetFactory.widgetCreated.connect((sender, widget) => {
    widget.title.icon = stlIcon;
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

const stlPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:stlplugin',
  requires: [
    IJupyterCadDocTracker,
    IThemeManager,
    IJCadWorkerRegistryToken,
    IJCadExternalCommandRegistryToken
  ],
  optional: [ICollaborativeContentProvider, ISettingRegistry, ITranslator],
  autoStart: true,
  activate
};

export default stlPlugin;
