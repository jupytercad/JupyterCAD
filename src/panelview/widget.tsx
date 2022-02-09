import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import PanelView from './panelview';

import { JupyterCadDoc } from '../model';
import { IJupyterCadTracker } from '../token';

export class PanelWidget extends ReactWidget {
  constructor(tracker: IJupyterCadTracker) {
    super();
    this._tracker = tracker;
    this._filePath = tracker.currentWidget?.context.localPath;
    this._sharedModel = tracker.currentWidget?.context.model.sharedModel;
    tracker.currentChanged.connect((_, changed) => {
      if (changed) {
        this._filePath = changed.context.localPath;
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

  render(): JSX.Element {
    return (
      <PanelView filePath={this._filePath} sharedModel={this._sharedModel} />
    );
  }
  private _tracker: IJupyterCadTracker;
  private _filePath: string | undefined;
  private _sharedModel: JupyterCadDoc | undefined;
}
