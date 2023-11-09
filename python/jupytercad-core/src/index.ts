import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the jupytercad-core extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad-core:plugin',
  description: 'JupyterCad core extension',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupytercad-core is activated!');

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupytercad_core server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
