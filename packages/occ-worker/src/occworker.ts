import {
  IJCadWorker,
  IMessageHandler,
  MainAction,
  WorkerAction
} from '@jupytercad/schema';
import { PromiseDelegate } from '@lumino/coreutils';
import { v4 as uuid } from 'uuid';

export class OccWorker implements IJCadWorker {
  constructor(options: OccWorker.IOptions) {
    this._nativeWorker = options.worker;
  }

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  register(options: {
    messageHandler: IMessageHandler;
    thisArg?: any;
  }): string {
    const { messageHandler, thisArg } = options;
    const id = uuid();
    const messageChannel = new MessageChannel();
    if (thisArg) {
      messageHandler.bind(thisArg);
    }
    messageChannel.port1.onmessage = this._handlerFactory(messageHandler);
    this._messageChannels.set(id, messageChannel);
    const initMessage = {
      id,
      action: WorkerAction.REGISTER,
      payload: { id }
    };
    this._nativeWorker.postMessage(initMessage, [messageChannel.port2]);

    return id;
  }

  unregister(id: string): void {
    this._messageChannels.delete(id);
  }

  postMessage(msg: { id: string; [key: string]: any }): void {
    this._nativeWorker.postMessage(msg);
  }

  private _handlerFactory(messageHandler: IMessageHandler) {
    return (msg: any) => {
      if (msg.data.action === MainAction.INITIALIZED) {
        this._ready.resolve();
      }
      messageHandler(msg.data);
    };
  }

  private _ready = new PromiseDelegate<void>();
  private _messageChannels = new Map<string, MessageChannel>();
  private _nativeWorker: Worker;
}

export namespace OccWorker {
  export interface IOptions {
    worker: Worker;
  }
}
