import { Dialog, ReactWidget, showDialog } from '@jupyterlab/apputils';
import {
  PanelWithToolbar,
  ToolbarButton,
  addIcon,
  homeIcon
} from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';
import { SuggestionModel } from './model';
import { Suggestion } from './view';
import { NewForkDialog } from './newForkDialog';

export class SuggestionPanel extends PanelWithToolbar {
  constructor(params: SuggestionPanel.IOptions) {
    super();
    this.title.label = 'Suggestions';
    const { model } = params;
    this._model = model;
    const body = ReactWidget.create(<Suggestion model={model} />);
    this.addWidget(body);
    this.addClass('jpcad-sidebar-propertiespanel');
    this.toolbar.addItem(
      'backToRoot',
      new ToolbarButton({
        icon: homeIcon,
        onClick: async () => {
          await this._model.backToRoot(true);
        },
        tooltip: 'Return to root document'
      })
    );
    this.toolbar.addItem(
      'newFork',
      new ToolbarButton({
        icon: addIcon,
        onClick: this.createFork.bind(this),
        tooltip: 'Create new fork'
      })
    );
  }

  async createFork() {
    const state: { forkLabel?: string } = { forkLabel: 'New suggestion' };
    const setForkLabel = value => (state.forkLabel = value);
    const body = ReactWidget.create(
      <NewForkDialog setForkLabel={setForkLabel} />
    );
    const res = await showDialog({
      title: 'Create new suggestion',
      body,
      buttons: [Dialog.cancelButton(), Dialog.okButton()],
      hasClose: true
    });
    if (res.button.accept) {
      const label = state.forkLabel === '' ? undefined : state.forkLabel;
      await this._model.createFork(label);
    }
  }
  private _model: SuggestionModel;
}

export namespace SuggestionPanel {
  /**
   * Instantiation options for `ObjectProperties`.
   */
  export interface IOptions extends Panel.IOptions {
    model: SuggestionModel;
  }
}
