import { IWidgetTracker } from '@jupyterlab/apputils';
import { JupyterCadWidget } from './widget';
import { Token } from '@lumino/coreutils';

export type IJupyterCadTracker = IWidgetTracker<JupyterCadWidget>;

export const IJupyterCadDocTracker = new Token<IJupyterCadTracker>(
  'jupyterCadDocTracker'
);
