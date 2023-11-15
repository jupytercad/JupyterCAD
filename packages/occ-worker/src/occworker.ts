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

  initChannel(): string {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = this._processMessage.bind(this);
    const id = uuid();
    this._messageChannels.set(id, messageChannel);
    const initMessage = {
      id,
      action: WorkerAction.REGISTER,
      payload: { id }
    };
    this._nativeWorker.postMessage(initMessage, [messageChannel.port2]);
    return id;
  }
  removeChannel(id: string): void {
    this._handlers.delete(id);
    this._messageChannels.delete(id);
  }

  registerHandler(
    id: string,
    messageHandler: ((msg: any) => void) | ((msg: any) => Promise<void>),
    thisArg?: any
  ): void {
    if (!this._handlers.has(id)) {
      if (thisArg) {
        messageHandler.bind(thisArg);
      }
      this._handlers.set(id, messageHandler);
    } else {
      console.error(
        `${id} is already registered, remove the handler first before re-registering `
      );
    }
  }

  postMessage(msg: { id: string; [key: string]: any }): void {
    this._nativeWorker.postMessage(msg);
  }

  private _processMessage(msg: any): void {
    if (msg.data.action === MainAction.INITIALIZED) {
      this._ready.resolve();
    }
    this._handlers.forEach(cb => cb(msg.data));
  }
  private _ready = new PromiseDelegate<void>();
  private _handlers = new Map<string, CallableFunction>();
  private _messageChannels = new Map<string, MessageChannel>();
  private _nativeWorker: Worker;
}

export namespace OccWorker {
  export interface IOptions {
    worker: Worker;
  }
}
