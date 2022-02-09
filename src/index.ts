import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import {
  WidgetTracker,
  IWidgetTracker,
  IThemeManager
} from '@jupyterlab/apputils';

import { Token } from '@lumino/coreutils';
import { JupyterCadWidgetFactory, JupyterCadModelFactory } from './factory';
import { JupyterCadWidget } from './widget';

const FACTORY = 'Jupytercad Factory';

export const IJupyterCadDocTracker = new Token<
  IWidgetTracker<JupyterCadWidget>
>('jupyterCadDocTracker');

const activate = (
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer,
  themeManager: IThemeManager
): void => {
  const namespace = 'jupytercad';
  const tracker = new WidgetTracker<JupyterCadWidget>({ namespace });

  if (restorer) {
    restorer.restore(tracker, {
      command: 'docmanager:open',
      args: widget => ({ path: widget.context.path, factory: FACTORY }),
      name: widget => widget.context.path
    });
  }

  // Creating the widget factory to register it so the document manager knows about
  // our new DocumentWidget
  const widgetFactory = new JupyterCadWidgetFactory({
    name: FACTORY,
    modelName: 'jupytercad-model',
    fileTypes: ['jcad'],
    defaultFor: ['jcad']
  });

  // Add the widget to the tracker when it's created
  widgetFactory.widgetCreated.connect((sender, widget) => {
    // Notify the instance tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    themeManager.themeChanged.connect((_, changes) =>
      widget.context.model.themeChanged.emit(changes)
    );

    tracker.add(widget);
  });
  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadModelFactory();
  app.docRegistry.addModelFactory(modelFactory);
  // register the filetype
  app.docRegistry.addFileType({
    name: 'jcad',
    displayName: 'JCAD',
    mimeTypes: ['text/json'],
    extensions: ['.jcad', '.JCAD'],
    fileFormat: 'text',
    contentType: 'file'
  });
  console.log('JupyterLab extension jupytercad is activated!');
};

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:plugin',
  autoStart: true,
  requires: [ILayoutRestorer, IThemeManager],
  activate
};

export default plugin;
