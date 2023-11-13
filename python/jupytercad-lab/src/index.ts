import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the @jupytercad/jupytercad-lab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@jupytercad/jupytercad-lab:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('jupytercad:lab-plugin is activated!');
  }
};

export default plugin;
