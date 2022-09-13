import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import { IJupyterCadDocTracker } from '../token';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { JupyterCadWidgetFactory } from '../factory';
import { JupyterCadJcadModelFactory } from './modelfactory';

const FACTORY = 'Jupytercad Jcad Factory';

const activate = (
  app: JupyterFrontEnd,
  tracker: WidgetTracker,
  themeManager: IThemeManager
): void => {
  const widgetFactory = new JupyterCadWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-jcadmodel',
    fileTypes: ['jcad'],
    defaultFor: ['jcad']
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadJcadModelFactory();
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
  });
};

const jcadPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:jcadplugin',
  requires: [IJupyterCadDocTracker, IThemeManager],
  autoStart: true,
  activate
};

export default jcadPlugin;
