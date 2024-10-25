import {
  IJCadFormSchemaRegistry,
  IJupyterCadClientState,
  IJupyterCadModel,
  IJupyterCadTracker,
  ISelection,
  JupyterCadDoc
} from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';

import { IControlPanelModel } from '../types';
import { ControlPanelHeader } from './header';
import { ObjectProperties } from './objectproperties';

export class RightPanelWidget extends SidePanel {
  constructor(options: RightPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this.addClass('data-jcad-keybinding');
    this.node.tabIndex = 0;
    this._model = options.model;
    const header = new ControlPanelHeader();
    this.header.addWidget(header);
    const properties = new ObjectProperties({
      controlPanelModel: this._model,
      formSchemaRegistry: options.formSchemaRegistry,
      tracker: options.tracker
    });

    const updateTitle = (
      sender: IJupyterCadModel,
      clients: Map<number, IJupyterCadClientState>
    ) => {
      const localState = sender.localState;

      if (!localState) {
        return;
      }

      let selection: {[key: string]: ISelection } = {};
      if (localState.remoteUser) {
        // We are in following mode.
        // Sync selections from a remote user
        const remoteState = clients.get(localState.remoteUser);

        if (remoteState?.selected?.value) {
          selection = remoteState?.selected?.value;
        }
      } else if (localState.selected?.value) {
        selection = localState.selected.value;
      }

      const selectionNames = Object.keys(selection);
      if (selectionNames.length === 1) {
        const selected = selectionNames[0];
        if (selected.startsWith('edge-') && selection[selected].parent) {
          header.title.label = selection[selected].parent
        } else {
          header.title.label = selected;
        }
      } else {
        header.title.label = 'No selection';
      }
    }

    let currentModel: IJupyterCadModel | undefined = undefined;
    this.addWidget(properties);
    this._model.documentChanged.connect((_, changed) => {
      if (changed) {
        if (currentModel) {
          currentModel.clientStateChanged.disconnect(updateTitle);
        }

        if (changed.context.model.sharedModel.editable) {
          currentModel = changed.context.model;
          currentModel.clientStateChanged.connect(updateTitle);

          properties.show();
        } else {
          header.title.label = `${changed.context.localPath} - Read Only`;
          properties.hide();
        }
      } else {
        header.title.label = '-';
      }
    });
  }

  dispose(): void {
    super.dispose();
  }
  private _model: IControlPanelModel;
}

export namespace RightPanelWidget {
  export interface IOptions {
    model: IControlPanelModel;
    tracker: IJupyterCadTracker;
    formSchemaRegistry: IJCadFormSchemaRegistry;
  }
  export interface IProps {
    filePath?: string;
    sharedModel?: JupyterCadDoc;
  }
}
