import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';

import { JupyterCadWidgetFactory } from '../factory';
import { IJupyterCadDocTracker } from './../token';
import { JupyterCadFCModelFactory } from './modelfactory';
import { IJupyterCadWidget } from '../types';

const FACTORY = 'Jupytercad Freecad Factory';

const activate = (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  themeManager: IThemeManager
): void => {
  // Creating the widget factory to register it so the document manager knows about
  // our new DocumentWidget
  const widgetFactory = new JupyterCadWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-fcmodel',
    fileTypes: ['FCStd'],
    defaultFor: ['FCStd'],
    tracker,
    commands: app.commands
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
};

const fcplugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:fcplugin',
  requires: [IJupyterCadDocTracker, IThemeManager],
  autoStart: true,
  activate
};

export default fcplugin;
