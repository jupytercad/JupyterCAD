import {
  JupyterCadDoc,
  IJupyterCadTracker,
  IJCadFormSchemaRegistry
  // IJupyterCadModel,
  // IJupyterCadClientState
} from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';

import { IControlPanelModel } from '../types';
import { ControlPanelHeader } from './header';
import { ObjectTree } from './objecttree';
import { ObjectProperties } from './objectproperties';
import { AccordionPanel } from '@lumino/widgets';

export class LeftPanelWidget extends SidePanel {
  constructor(options: LeftPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this.addClass('data-jcad-keybinding');
    this.node.tabIndex = 0;
    this._model = options.model;
    const header = new ControlPanelHeader();
    this.header.addWidget(header);

    const tree = new ObjectTree({ controlPanelModel: this._model });
    this.addWidget(tree);

    const properties = new ObjectProperties({
      controlPanelModel: this._model,
      formSchemaRegistry: options.formSchemaRegistry,
      tracker: options.tracker
    });
    this.addWidget(properties);

    // const updateTitle = (
    //   sender: IJupyterCadModel,
    //   clients: Map<number, IJupyterCadClientState>
    // ) => {
    //   /* */
    // };
    // let currentModel: IJupyterCadModel | undefined = undefined;
    // this._model.documentChanged.connect((_, changed) => {
    //   if (changed) {
    //     if (currentModel) {
    //       currentModel.clientStateChanged.disconnect(updateTitle);
    //     }

    //     if (changed.context.model.sharedModel.editable) {
    //       currentModel = changed.context.model;
    //       const clients = currentModel.sharedModel.awareness.getStates() as Map<
    //         number,
    //         IJupyterCadClientState
    //       >;
    //       updateTitle(currentModel, clients);
    //       currentModel.clientStateChanged.connect(updateTitle);

    //       properties.show();
    //     } else {
    //       // header.title.label = `${changed.context.localPath} - Read Only`;
    //       properties.hide();
    //     }
    //   } else {
    //     // header.title.label = '-';
    //   }
    // });

    options.tracker.currentChanged.connect((_, changed) => {
      if (changed) {
        header.title.label = changed.context.localPath;
      } else {
        header.title.label = '-';
      }
    });
    (this.content as AccordionPanel).setRelativeSizes([4, 6]);
  }

  dispose(): void {
    super.dispose();
  }

  private _model: IControlPanelModel;
}

export namespace LeftPanelWidget {
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
