import { IAnnotationModel, IJupyterCadWidget } from '../types';
import { IAnnotation, IJupyterCadDocTracker } from '../token';
import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { JupyterCadWidgetFactory } from '../factory';
import { JupyterCadJcadModelFactory } from './modelfactory';

const FACTORY = 'Jupytercad Jcad Factory';

const activate = (
  app: JupyterFrontEnd,
  tracker: WidgetTracker<IJupyterCadWidget>,
  themeManager: IThemeManager,
  annotationModel: IAnnotationModel
): void => {
  const widgetFactory = new JupyterCadWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-jcadmodel',
    fileTypes: ['jcad'],
    defaultFor: ['jcad'],
    tracker,
    commands: app.commands
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadJcadModelFactory({ annotationModel });
  app.docRegistry.addModelFactory(modelFactory);
  // register the filetype
  app.docRegistry.addFileType({
    name: 'jcad',
    displayName: 'JCAD',
    mimeTypes: ['text/json'],
    extensions: ['.jcad', '.JCAD'],
    fileFormat: 'text',
    contentType: 'jcad'
  });

  widgetFactory.widgetCreated.connect((sender, widget) => {
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

const jcadPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:jcadplugin',
  requires: [IJupyterCadDocTracker, IThemeManager, IAnnotation],
  autoStart: true,
  activate
};

export default jcadPlugin;
