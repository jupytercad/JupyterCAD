import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';

import { JupyterCadModelFactory, JupyterCadWidgetFactory } from './factory';
import { ControlPanelModel } from './panelview/model';
import { PanelWidget } from './panelview/widget';
import { IJupyterCadDocTracker, IJupyterCadTracker } from './token';
import { jcLightIcon } from './tools';
import { JupyterCadWidget } from './widget';

const FACTORY = 'Jupytercad Factory';
const NAME_SPACE = 'jupytercad';

const activate = (
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer,
  themeManager: IThemeManager
): IJupyterCadTracker => {
  const tracker = new WidgetTracker<JupyterCadWidget>({
    namespace: NAME_SPACE
  });

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
  return tracker;
};

const plugin: JupyterFrontEndPlugin<IJupyterCadTracker> = {
  id: 'jupytercad:plugin',
  autoStart: true,
  requires: [ILayoutRestorer, IThemeManager],
  provides: IJupyterCadDocTracker,
  activate
};

const controlPanel: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:controlpanel',
  autoStart: true,
  requires: [ILayoutRestorer, ILabShell, IJupyterCadDocTracker],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    shell: ILabShell,
    tracker: IJupyterCadTracker
  ) => {
    const controlModel = new ControlPanelModel({ tracker });
    tracker.currentChanged;
    const controlPanel = new PanelWidget({ model: controlModel });
    controlPanel.id = 'jupytercad::controlPanel';
    controlPanel.title.caption = 'JupyterCad Control Panel';
    controlPanel.title.icon = jcLightIcon;
    if (restorer) {
      restorer.add(controlPanel, NAME_SPACE);
    }
    app.shell.add(controlPanel, 'left', { rank: 2000 });
  }
};

export default [plugin, controlPanel];
