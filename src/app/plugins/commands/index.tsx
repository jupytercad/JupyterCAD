import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { showDialog, Dialog } from '@jupyterlab/apputils';

import { jupyterIcon } from '@jupyterlab/ui-components';

// import { FileBrowser, FilterFileBrowserModel } from '@jupyterlab/filebrowser';

// import { DocumentRegistry } from '@jupyterlab/docregistry';

// import { DocumentManager } from '@jupyterlab/docmanager';

import * as React from 'react';

import { CommandIDs } from './ids';

/**
 * The commands plugin.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:commands',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    const { commands } = app;

    // const docRegistry = new DocumentRegistry();
    // const docManager = new DocumentManager({
    //   registry: docRegistry,
    //   manager,
    //   opener
    // });
    // const fbModel = new FilterFileBrowserModel({
    //   manager: docManager
    // });

    commands.addCommand(CommandIDs.newFile, {
      label: 'New',
      caption: 'Create a New Empty CAD File',
      execute: () => {
        console.log('Create NEW');
      }
    });

    commands.addCommand(CommandIDs.loadFile, {
      label: 'Load',
      caption: 'Load a CAD File',
      execute: () => {
        console.log('Load');
      }
    });

    commands.addCommand(CommandIDs.about, {
      label: `About ${app.name}`,
      execute: () => {
        const title = (
          <span className="about-header">
            <jupyterIcon.react margin="7px 9.5px" height="auto" width="58px" />
            <div className="about-header-info">About JupyterCAD</div>
          </span>
        );

        const repoUrl = 'https://github.com/QuantStack/jupytercad';
        const externalLinks = (
          <span>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="jp-Button-flat about-externalLinks"
            >
              Jupyter CAD
            </a>
          </span>
        );
        const body = <div className="about-body">{externalLinks}</div>;

        return showDialog({
          title,
          body,
          buttons: [
            Dialog.createButton({
              label: 'Dismiss',
              className: 'about-button jp-mod-reject jp-mod-styled'
            })
          ]
        });
      }
    });
  }
};

export default plugin;
