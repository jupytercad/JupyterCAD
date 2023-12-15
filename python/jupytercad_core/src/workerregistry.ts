import { OccWorker } from '@jupytercad/occ-worker';
import { IJCadWorker, IJCadWorkerRegistry } from '@jupytercad/schema';

export class JupyterCadWorkerRegistry implements IJCadWorkerRegistry {
  constructor() {
    this._registry = new Map<string, IJCadWorker>();
    const worker = new Worker(
      new URL('@jupytercad/occ-worker/lib/worker', (import.meta as any).url)
    );
    this._defaultWorker = new OccWorker({ worker });
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

  getDefaultWorker(): IJCadWorker {
    return this._defaultWorker;
  }

  getWorker(workerId: string): IJCadWorker | undefined {
    return this._registry.get(workerId);
  }

  getAllWorkers(): IJCadWorker[] {
    return [...this._registry.values()];
  }

  private _registry: Map<string, IJCadWorker>;
  private _defaultWorker: IJCadWorker;
}
