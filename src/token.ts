import { IWidgetTracker } from '@jupyterlab/apputils';
import { Token } from '@lumino/coreutils';

import { IJupyterCadWidget, IAnnotationModel } from './types';

export type IJupyterCadTracker = IWidgetTracker<IJupyterCadWidget>;

export const IJupyterCadDocTracker = new Token<IJupyterCadTracker>(
  'jupyterCadDocTracker'
);

export const IAnnotation = new Token<IAnnotationModel>(
  'jupytercadAnnotationModel'
);
