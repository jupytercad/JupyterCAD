import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { SidePanel } from '@jupyterlab/ui-components';
import { Panel, Widget } from '@lumino/widgets';

import { JupyterCadDoc } from '../model';
import { IJupyterCadTracker } from '../token';
import { ControlPanelModel } from './model';
import { ObjectProperties } from './objectproperties';
import { ObjectTree } from './objecttree';

export class PanelWidget extends SidePanel {
  constructor(tracker: IJupyterCadTracker) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this._model = new ControlPanelModel();
    const header = new PanelWidget.Header();
    this.header.addWidget(header);
    const tree = new ObjectTree({ tracker, controlPanelModel: this._model });
    const properties = new ObjectProperties({
      tracker,
      controlPanelModel: this._model
    });
    this.addWidget(tree);
    this.addWidget(properties);
    tracker.currentChanged.connect((_, changed) => {
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
  private _model: ControlPanelModel;
}

export namespace PanelWidget {
  interface IProps {
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
      super({ node: Private.createHeader() });
      this.title.changed.connect(_ => {
        this.node.textContent = this.title.label;
      });
    }
  }
}

namespace Private {
  /**
   * Create a sidebar header node.
   */
  export function createHeader(): HTMLElement {
    const title = document.createElement('h2');
    title.textContent = '-';
    return title;
  }
}
