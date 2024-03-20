import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';
import { SuggestionModel } from './model';
import { Suggestion } from './view';

export class SuggestionPanel extends PanelWithToolbar {
  constructor(params: SuggestionPanel.IOptions) {
    super();
    this.title.label = 'Suggestions';
    const { model } = params;
    const body = ReactWidget.create(<Suggestion model={model} />);
    this.addWidget(body);
    this.addClass('jpcad-sidebar-propertiespanel');
  }
}

export namespace SuggestionPanel {
  /**
   * Instantiation options for `ObjectProperties`.
   */
  export interface IOptions extends Panel.IOptions {
    model: SuggestionModel;
  }
}
