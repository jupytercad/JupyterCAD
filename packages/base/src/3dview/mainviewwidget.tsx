import { ReactWidget } from '@jupyterlab/apputils';
import * as React from 'react';

import { MainView } from './mainview';
import { MainViewModel } from './mainviewmodel';
import { Message } from '@lumino/messaging';

export class JupyterCadMainViewPanel extends ReactWidget {
  /**
   * Construct a `JupyterCadPanel`.
   *
   * @param context - The documents context.
   */
  constructor(options: { mainViewModel: MainViewModel }) {
    super();
    this._mainViewModel = options.mainViewModel;
    this.addClass('jp-jupytercad-panel');
  }

  processMessage(msg: Message): void {
    super.processMessage(msg);

    switch (msg.type) {
      case 'resize':
      case 'after-show':
      case 'after-attach':
        this._mainViewModel.emitAfterShow();
        break;
    }
  }

  render(): JSX.Element {
    return <MainView viewModel={this._mainViewModel} />;
  }

  private _mainViewModel: MainViewModel;
}
