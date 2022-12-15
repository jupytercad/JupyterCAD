import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';
import { IMainMenu } from '@jupyterlab/mainmenu';

import { JupyterCadWidgetFactory } from '../factory';
import { IJupyterCadDocTracker } from './../token';
import { JupyterCadFCModelFactory } from './modelfactory';
import { IJupyterCadWidget } from '../types';

const FACTORY = 'Jupytercad Freecad Factory';

/**
 * The command IDs used by the FreeCAD plugin.
 */
namespace CommandIDs {
  export const redo = 'freecad:redo';
  export const undo = 'freecad:undo';
}

const activate = (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  themeManager: IThemeManager,
  mainMenu: IMainMenu,
  translator: ITranslator
): void => {
  // Creating the widget factory to register it so the document manager knows about
  // our new DocumentWidget
  const widgetFactory = new JupyterCadWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-fcmodel',
    fileTypes: ['FCStd'],
    defaultFor: ['FCStd'],
    tracker
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadFCModelFactory();
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

  /**
   * Whether there is an active notebook.
   */
  const isEnabled = (): boolean => {
    return (
      tracker.currentWidget !== null &&
      tracker.currentWidget === app.shell.currentWidget
    );
  };

  addCommands(app, tracker, translator, isEnabled);
  populateMenus(mainMenu, isEnabled);
};

const fcplugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:fcplugin',
  requires: [IJupyterCadDocTracker, IThemeManager, IMainMenu, ITranslator],
  autoStart: true,
  activate
};

export default fcplugin;

/**
 * Add the FreeCAD commands to the application's command registry.
 */
function addCommands(
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  translator: ITranslator,
  isEnabled: () => boolean
): void {
  const trans = translator.load('jupyterlab');
  const { commands } = app;

  commands.addCommand(CommandIDs.redo, {
    label: trans.__('Redo'),
    isEnabled: () => isEnabled() && tracker.currentWidget!.context.model.sharedModel.canRedo(),
    execute: args => {
      const current = tracker.currentWidget;

      if (current) {
        return current.context.model.sharedModel.redo();
      }
    }
  });

  commands.addCommand(CommandIDs.undo, {
    label: trans.__('Undo'),
    isEnabled: () => isEnabled() && tracker.currentWidget!.context.model.sharedModel.canUndo(),
    execute: args => {
      const current = tracker.currentWidget;

      if (current) {
        return current.context.model.sharedModel.undo();
      }
    }
  });
}

/**
 * Populates the application menus for the notebook.
 */
function populateMenus(
  mainMenu: IMainMenu,
  isEnabled: () => boolean
): void {
  // Add undo/redo hooks to the edit menu.
  mainMenu.editMenu.undoers.redo.add({
    id: CommandIDs.redo,
    isEnabled
  });
  mainMenu.editMenu.undoers.undo.add({
    id: CommandIDs.undo,
    isEnabled
  });
}