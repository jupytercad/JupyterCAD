import { SidePanel } from '@jupyterlab/ui-components';
import { Widget } from '@lumino/widgets';

import { JupyterCadDoc } from '../model';
import { IControlPanelModel } from '../types';
import { ObjectProperties } from './objectproperties';
import { ObjectTree } from './objecttree';

export class PanelWidget extends SidePanel {
  constructor(options: PanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this._model = options.model;
    const header = new PanelWidget.Header();
    this.header.addWidget(header);
    const tree = new ObjectTree({ controlPanelModel: this._model });
    const properties = new ObjectProperties({
      controlPanelModel: this._model
    });
    this.addWidget(tree);
    this.addWidget(properties);
    this._model.documentChanged.connect((_, changed) => {
      if (changed) {
        header.title.label = changed.context.localPath;
      } else {
        header.title.label = '-';
      }
      // this.update();
    });
  }

  dispose(): void {
    super.dispose();
  }
  private _model: IControlPanelModel;
}

export namespace PanelWidget {
  export interface IOptions {
    model: IControlPanelModel;
  }
  export interface IProps {
    filePath?: string;
    sharedModel?: JupyterCadDoc;
  }

  /**
   * The header for a debugger sidebar.
   */
  export class Header extends Widget {
    /**
     * Instantiate a new sidebar header.
     */
    constructor() {
      super({ node: createHeader() });
      this.title.changed.connect(_ => {
        this.node.textContent = this.title.label;
      });
    }
  }

  /**
   * Create a sidebar header node.
   */
  export function createHeader(): HTMLElement {
    const title = document.createElement('h2');
    title.textContent = '-';
    return title;
  }
}
