import { IWidgetTracker } from '@jupyterlab/apputils';
import { IJupyterCadWidget } from './types';
import { Token } from '@lumino/coreutils';

export type IJupyterCadTracker = IWidgetTracker<IJupyterCadWidget>;

export const IJupyterCadDocTracker = new Token<IJupyterCadTracker>(
  'jupyterCadDocTracker'
);
