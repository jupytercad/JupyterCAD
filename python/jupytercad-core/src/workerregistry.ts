import { IJCadWorker, IJCadWorkerRegistry } from '@jupytercad/schema';

export class JupyterCadWorkerRegistry implements IJCadWorkerRegistry {
  constructor() {
    this._registry = new Map<string, IJCadWorker>();
  }
  registerWorker(workerId: string, worker: IJCadWorker): void {
    if (!this._registry.has(workerId)) {
      this._registry.set(workerId, worker);
    } else {
      console.error('Worker is already registered!');
    }
  }

  unregisterWorker(workerId: string): void {
    if (!this._registry.has(workerId)) {
      this._registry.delete(workerId);
    }
  }

  getWorker(workerId: string): IJCadWorker | undefined {
    return this._registry.get(workerId);
  }

  getAllWorkers(): IJCadWorker[] {
    return [...this._registry.values()];
  }

  private _registry: Map<string, IJCadWorker>;
}
