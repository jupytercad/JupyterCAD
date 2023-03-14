import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IJupyterCadModel } from '../types';

export interface IJupyterCadWidgetModelRegistry {
  getModel(id: string): IJupyterCadModel | undefined;
}

export interface IJupyterCadWidgetManager {
  registerKernel(kernel: Kernel.IKernelConnection): void;
  getWidgetModel(
    kernelId: string,
    commId: string
  ): IJupyterCadModel | undefined;
}

export const IJupyterCadWidgetManager = new Token<IJupyterCadWidgetManager>(
  'jupyterCadWidgetManager'
);
