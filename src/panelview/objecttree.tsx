import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';

export class ObjectTree extends PanelWithToolbar {
  constructor(params: ObjectTree.IOptions) {
    super(params);
    this.title.label = 'Objects tree';
    const body = new ReactObjectTree();
    this.addWidget(body);
    this.addClass('jpcad-sidebar-treepanel');
  }
}

export class ReactObjectTree extends ReactWidget {
  constructor() {
    super();
  }

  render(): JSX.Element {
    return (
      <div style={{ overflow: 'auto', height: '100%' }}>Hello ObjectTree </div>
    );
  }
}

export namespace ObjectTree {
  /**
   * Instantiation options for `ObjectTree`.
   */
  export interface IOptions extends Panel.IOptions {
    id?: string;
  }
}
