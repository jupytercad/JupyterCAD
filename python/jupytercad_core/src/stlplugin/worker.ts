import {
  IJCadObject,
  IJCadWorker,
  IJupyterCadTracker,
  IWorkerMessageBase,
  JCadWorkerSupportedFormat,
  WorkerAction
} from '@jupytercad/schema';
import { PromiseDelegate } from '@lumino/coreutils';
import { v4 as uuid } from 'uuid';

export class STLWorker implements IJCadWorker {
  constructor(options: STLWorker.IOptions) {
    this._tracker = options.tracker;
  }

  shapeFormat = JCadWorkerSupportedFormat.STL;

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  register(options: {
    messageHandler: ((msg: any) => void) | ((msg: any) => Promise<void>);
    thisArg?: any;
  }): string {
    const id = uuid();
    // No-op
    return id;
  }

  unregister(id: string): void {
    // No-op
  }

  postMessage(msg: IWorkerMessageBase): void {
    if (msg.action !== WorkerAction.POSTPROCESS) {
      return;
    }

    if (msg.payload && Object.keys(msg.payload).length > 0) {
      const jCadObject = msg.payload['jcObject'] as IJCadObject;
      const stlContent = msg.payload['postShape'];
      if (stlContent && typeof stlContent === 'string') {
        this._downloadSTL(jCadObject.name, stlContent);
      } else {
        console.error('No STL content received for object:', jCadObject.name);
      }
    }
  }

  private _downloadSTL(objectName: string, stlContent: string): void {
    const blob = new Blob([stlContent], {
      type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const originalObjectName = objectName.replace(/_STL_Export$/, '');
    link.download = `${originalObjectName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')}.stl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this._cleanupExportObject(objectName);
  }

  private _cleanupExportObject(exportObjectName: string): void {
    const currentWidget = this._tracker.currentWidget;
    if (!currentWidget) {
      return;
    }

    const model = currentWidget.model;
    const sharedModel = model.sharedModel;

    if (sharedModel && sharedModel.objectExists(exportObjectName)) {
      sharedModel.transact(() => {
        sharedModel.removeObjectByName(exportObjectName);
      });
    }
  }

  private _ready = new PromiseDelegate<void>();
  private _tracker: IJupyterCadTracker;
}

export namespace STLWorker {
  export interface IOptions {
    tracker: IJupyterCadTracker;
  }
}
