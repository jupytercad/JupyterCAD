import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

const launcherPlugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab/-custom-launcher-extension',
  description: 'Customize the default launcher.',
  requires: [ILabShell],
  autoStart: true,
  activate: (app: JupyterFrontEnd, labShell: ILabShell): void => {
    labShell.layoutModified.connect(() => {
      const els = document.getElementsByClassName('jp-Launcher-sectionTitle');
      const length = els.length;
      for (let idx = 0; idx < length; idx++) {
        const element = els.item(idx);
        if (element) {
          element.innerHTML = 'Create New Project';
        }
      }
    });
  }
};
export default launcherPlugin;
