import * as React from 'react';
import { SidePanel } from '@jupyterlab/ui-components';
import { ReactWidget } from '@jupyterlab/apputils';
import PanelView from './panelview';
import { Panel, Widget } from '@lumino/widgets';
import { JupyterCadDoc } from '../model';
import { IJupyterCadTracker } from '../token';
import { ObjectTree } from './objecttree';
import { ObjectProperties } from './objectproperties';

export class PanelWidget extends SidePanel {
  constructor(tracker: IJupyterCadTracker) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this._tracker = tracker;
    this._filePath = tracker.currentWidget?.context.localPath;
    this._sharedModel = tracker.currentWidget?.context.model.sharedModel;

    const header = new PanelWidget.Header();
    this.header.addWidget(header);
    const tree = new ObjectTree({});
    const properties = new ObjectProperties({});
    this.addWidget(tree);
    this.addWidget(properties);
    tracker.currentChanged.connect((_, changed) => {
      if (changed) {
        this._filePath = changed.context.localPath;
        header.title.label = this._filePath;
        this._sharedModel = changed.context.model.sharedModel;
      } else {
        this._filePath = undefined;
        this._sharedModel = undefined;
      }
      this.update();
    });
  }

  dispose(): void {
    super.dispose();
  }

  // render(): JSX.Element {
  //   return (
  //     <PanelView filePath={this._filePath} sharedModel={this._sharedModel} />
  //   );
  // }
  private _tracker: IJupyterCadTracker;
  private _filePath: string | undefined;
  private _sharedModel: JupyterCadDoc | undefined;
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
