import { IComm } from '@jupyterlab/services/lib/kernel/kernel';
import { Token } from '@lumino/coreutils';

export interface IJupyterCadWidgetManager {
  getComm(id: string): IComm;
}

export interface IJupyterCadWidgetRegistry {
  registerWidgetManager(kernelId: string, wm: IJupyterCadWidgetManager): void;
  getWidgetManager(kernelId?: string): IJupyterCadWidgetManager | undefined;
}

export const IJupyterCadWidgetRegistry = new Token<IJupyterCadWidgetRegistry>(
  'jupyterCadWidgetManagerRegistry'
);
