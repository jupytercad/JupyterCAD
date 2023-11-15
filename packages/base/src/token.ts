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

export interface IJCadWorker {
  ready: Promise<void>;
  initialize(): string;
  registerHandler(
    messageHandler: ((msg: any) => void) | ((msg: any) => Promise<void>),
    thisArg?: any
  ): void;
  postMessage(msg: any): void;
}
export interface IJCadWorkerRegistry {
  /**
   *
   *
   * @param {string} workerId
   * @param {IJCadWorker} worker
   */
  registerWorker(workerId: string, worker: IJCadWorker): void;

  /**
   *
   *
   * @param {string} workerId
   */
  unregisterWorker(workerId: string): void;

  /**
   *
   *
   * @param {string} workerId
   * @return {*}  {(IJCadWorker | undefined)}
   */
  getWorker(workerId: string): IJCadWorker | undefined;

  /**
   *
   *
   * @return {*}  {IJCadWorker[]}
   */
  getAllWorkers(): IJCadWorker[];
}

export const IJCadWorkerRegistry = new Token<IJCadWorkerRegistry>(
  'jupytercadWorkerRegistry'
);
