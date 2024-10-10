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
      const launcherSection = document.getElementsByClassName(
        'jp-Launcher-section'
      );
      for (let index = 0; index < launcherSection.length; index++) {
        const element = launcherSection.item(index) as HTMLDivElement;
        const label = element
          ?.getElementsByClassName('jp-LauncherCard-label')
          ?.item(0);
        if (!label) {
          continue;
        }
        if (label.innerHTML.includes('CAD File')) {
          const els = element
            .getElementsByClassName('jp-Launcher-sectionTitle')
            ?.item(0);
          if (els) {
            els.innerHTML = 'Create New Project';
          }
        } else {
          element.style.display = 'none';
        }
      }
    });
  }
};
export default launcherPlugin;
