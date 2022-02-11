import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';

export class ObjectProperties extends PanelWithToolbar {
  constructor(params: ObjectProperties.IOptions) {
    super(params);
    this.title.label = 'Objects Properties';
    const body = new ReactObjectProperties();
    this.addWidget(body);
    this.addClass('jpcad-sidebar-propertiespanel');
  }
}

export class ReactObjectProperties extends ReactWidget {
  constructor() {
    super();
  }

  render(): JSX.Element {
    return (
      <div style={{ overflow: 'auto', height: '100%' }}>
        Hello ObjectProperties
      </div>
    );
  }
}

export namespace ObjectProperties {
  /**
   * Instantiation options for `ObjectProperties`.
   */
  export interface IOptions extends Panel.IOptions {
    id?: string;
  }
}
