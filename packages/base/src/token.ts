import { IAnnotationModel } from '@jupytercad/schema';
import { IWidgetTracker } from '@jupyterlab/apputils';
import { Token } from '@lumino/coreutils';

import { IJupyterCadWidget } from './types';

export type IJupyterCadTracker = IWidgetTracker<IJupyterCadWidget>;

export const IJupyterCadDocTracker = new Token<IJupyterCadTracker>(
  'jupyterCadDocTracker'
);

export const IAnnotationToken = new Token<IAnnotationModel>(
  'jupytercadAnnotationModel'
);
