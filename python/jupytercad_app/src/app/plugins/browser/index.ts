import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { showErrorMessage } from '@jupyterlab/apputils';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { ITranslator } from '@jupyterlab/translation';
import { folderIcon, fileUploadIcon } from '@jupyterlab/ui-components';

const browserWidget: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab/filebrowser-extension:widget',
  description: 'Adds the file browser to the application shell.',
  requires: [IDefaultFileBrowser, ITranslator, ILabShell],

  autoStart: true,
  activate: (
    app: JupyterFrontEnd,
    browser: IDefaultFileBrowser,
    translator: ITranslator,
    labShell: ILabShell
  ): void => {
    const trans = translator.load('jupyterlab');
    browser.node.setAttribute('role', 'region');
    browser.node.setAttribute('aria-label', trans.__('File Browser Section'));
    browser.title.icon = folderIcon;
    browser.model.setFilter(e => {
      const name = e.name.toLowerCase();
      if (e.type === 'directory') {
        return {};
      }
      if (
        name.endsWith('fcstd') ||
        name.endsWith('jcad') ||
        name.endsWith('step')
      ) {
        return {};
      }
      return null;
    });
    browser.id = 'jcad-file-browser';
    labShell.add(browser, 'left', { rank: 100, type: 'File Browser' });
    labShell.activateById(browser.id);
    browser.model.fileChanged.connect(
      async () => await browser.model.refresh()
    );
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.FCStd,.fcstd,.jcad,.JCAD,.step,.STEP';
    input.onclick = () => void (input.value = '');
    input.onchange = () => {
      const files = input.files;
      if (files) {
        const pending = Array.from(files).map(file =>
          browser.model.upload(file)
        );
        void Promise.all(pending)
          .catch(error => {
            void showErrorMessage('Upload Error', error);
          })
          .then(async () => await browser.model.refresh());
      }
    };
    app.commands.addCommand('jupytercad:open-file', {
      label: 'Open File',
      caption: 'Open files from disk',
      icon: fileUploadIcon,
      execute: args => {
        input.click();
      }
    });
  }
};

export default browserWidget;
