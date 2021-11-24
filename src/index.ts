import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { WidgetTracker, IWidgetTracker } from '@jupyterlab/apputils';
import { Token } from '@lumino/coreutils';
import { JupyterCadWidgetFactory, JupyterCadModelFactory } from './factory';
import { JupyterCadWidget } from './widget';

const FACTORY = 'Jupytercad Factory';

export const IExampleDocTracker = new Token<IWidgetTracker<JupyterCadWidget>>(
  'exampleDocTracker'
);

const activate = (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
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
    fileTypes: ['stp'],
    defaultFor: ['stp']
  });

  // Add the widget to the tracker when it's created
  widgetFactory.widgetCreated.connect((sender, widget) => {
    // Notify the instance tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    tracker.add(widget);
  });
  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new JupyterCadModelFactory();
  app.docRegistry.addModelFactory(modelFactory);

  // register the filetype
  app.docRegistry.addFileType({
    name: 'stp',
    displayName: 'STEP',
    mimeTypes: ['text'],
    extensions: ['.stp'],
    fileFormat: 'text',
    contentType: 'file'
  });
  console.log('upyterLab extension jupytercad is activated!');
};

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:plugin',
  autoStart: true,
  requires: [ILayoutRestorer],
  activate
};

export default plugin;
