import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupytercad extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupytercad is activated!');
  }
};

export default plugin;
