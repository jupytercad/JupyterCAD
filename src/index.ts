import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';

import fcplugin from './fcplugin/plugins';
import jcadPlugin from './jcadplugin/plugins';
import { JupyterCadModel } from './model';
import { ControlPanelModel } from './panelview/model';
import { PanelWidget } from './panelview/widget';
import { IJupyterCadDocTracker, IJupyterCadTracker } from './token';
import { jcLightIcon } from './tools';
import { JupyterCadWidget } from './widget';

const NAME_SPACE = 'jupytercad';

const plugin: JupyterFrontEndPlugin<IJupyterCadTracker> = {
  id: 'jupytercad:plugin',
  autoStart: true,
  provides: IJupyterCadDocTracker,
  activate: (app: JupyterFrontEnd): IJupyterCadTracker => {
    const tracker = new WidgetTracker<JupyterCadWidget>({
      namespace: NAME_SPACE
    });
    JupyterCadModel.worker = new Worker(
      new URL('./worker', (import.meta as any).url)
    );

    console.log('JupyterLab extension jupytercad is activated!');
    return tracker;
  }
};

const controlPanel: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:controlpanel',
  autoStart: true,
  requires: [ILayoutRestorer, IJupyterCadDocTracker],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    tracker: IJupyterCadTracker
  ) => {
    const controlModel = new ControlPanelModel({ tracker });
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

export default [plugin, controlPanel, fcplugin, jcadPlugin];
