import { Token } from '@lumino/coreutils';

import {
  IJCadWorkerRegistry,
  IJupyterCadTracker,
  IAnnotationModel
} from './interfaces';

export const IJupyterCadDocTracker = new Token<IJupyterCadTracker>(
  'jupyterCadDocTracker'
);

export const IAnnotationToken = new Token<IAnnotationModel>(
  'jupytercadAnnotationModel'
);

export const IJCadWorkerRegistryToken = new Token<IJCadWorkerRegistry>(
  'jupytercadWorkerRegistry'
);
