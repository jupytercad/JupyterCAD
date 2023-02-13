import {
  IComm,
  IKernelConnection
} from '@jupyterlab/services/lib/kernel/kernel';
import { ICommOpenMsg } from '@jupyterlab/services/lib/kernel/messages';
import { IJupyterCadWidgetManager, IJupyterCadWidgetRegistry } from './token';

export class WidgetManagerRegister implements IJupyterCadWidgetRegistry {
  registerWidgetManager(kernelId: string, wm: IJupyterCadWidgetManager): void {
    this._registry.set(kernelId, wm);
  }
  removeWidgetManager(kernelId?: string | null): void {
    if (kernelId) {
      this._registry.delete(kernelId);
    }
  }
  getWidgetManager(kernelId: string): IJupyterCadWidgetManager | undefined {
    return this._registry.get(kernelId);
  }

  private _registry = new Map();
}

export class WidgetManager implements IJupyterCadWidgetManager {
  constructor(private kernel: IKernelConnection) {
    kernel.registerCommTarget(
      '@jupytercad:widget',
      (comm: IComm, msg: ICommOpenMsg) => {
        this._comms.set(comm.commId, comm);
      }
    );
  }

  getComm(id: string): IComm {
    return this._comms.get(id);
  }
  private _comms = new Map();
}
