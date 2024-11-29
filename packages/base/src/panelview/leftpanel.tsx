import {
  JupyterCadDoc,
  IJupyterCadTracker,
  IJCadFormSchemaRegistry
} from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';

import { IControlPanelModel } from '../types';
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

    const tree = new ObjectTree({ controlPanelModel: this._model });
    this.addWidget(tree);

    const properties = new ObjectProperties({
      controlPanelModel: this._model,
      formSchemaRegistry: options.formSchemaRegistry,
      tracker: options.tracker
    });
    this.addWidget(properties);

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
