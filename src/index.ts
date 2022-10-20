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
import { LeftPanelWidget } from './panelview/leftpanel';
import { RightPanelWidget } from './panelview/rightpanel';
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

    const leftControlPanel = new LeftPanelWidget({ model: controlModel });
    leftControlPanel.id = 'jupytercad::leftControlPanel';
    leftControlPanel.title.caption = 'JupyterCad Control Panel';
    leftControlPanel.title.icon = jcLightIcon;

    const rightControlPanel = new RightPanelWidget({ model: controlModel });
    rightControlPanel.id = 'jupytercad::rightControlPanel';
    rightControlPanel.title.caption = 'JupyterCad Control Panel';
    rightControlPanel.title.icon = jcLightIcon;

    if (restorer) {
      restorer.add(leftControlPanel, NAME_SPACE);
      restorer.add(rightControlPanel, NAME_SPACE);
    }
    app.shell.add(leftControlPanel, 'left', { rank: 2000 });
    app.shell.add(rightControlPanel, 'right', { rank: 2000 });
  }
};

export default [plugin, controlPanel, fcplugin, jcadPlugin];
