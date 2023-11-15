import { IJCadWorker } from '@jupytercad/schema';
import { PromiseDelegate } from '@lumino/coreutils';
import { v4 as uuid } from 'uuid';

import { MainAction, WorkerAction } from './types';

export const OCC_WORKER_ID = 'jupytercadOccWorker';

export class OccWorker implements IJCadWorker {
  constructor(options: OccWorker.IOptions) {
    this._nativeWorker = options.worker;
  }

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  initialize(): string {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = this._processMessage.bind(this);
    const id = uuid();
    const initMessage = {
      action: WorkerAction.REGISTER,
      payload: { id }
    };
    this._nativeWorker.postMessage(initMessage, [messageChannel.port2]);
    return id;
  }

  registerHandler(
    messageHandler: ((msg: any) => void) | ((msg: any) => Promise<void>),
    thisArg?: any
  ): void {
    if (!this._handlerSet.has(messageHandler)) {
      if (thisArg) {
        messageHandler.bind(thisArg);
      }
      this._handlerSet.add(messageHandler);
    }
  }

  postMessage(msg: { id: string; [key: string]: any }): void {
    this._nativeWorker.postMessage(msg);
  }

  private _processMessage(msg: any): void {
    if (msg.action === MainAction.INITIALIZED) {
      this._ready.resolve();
    } else {
      this._handlerSet.forEach(cb => cb(msg));
    }
  }

  private _ready = new PromiseDelegate<void>();
  private _handlerSet = new Set<CallableFunction>();
  private _nativeWorker: Worker; 
}

export namespace OccWorker {
  export interface IOptions {
    worker: Worker;
  }
}
