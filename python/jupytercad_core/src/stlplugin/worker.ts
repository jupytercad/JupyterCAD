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

export class ExportWorker implements IJCadWorker {
  constructor(options: ExportWorker.IOptions) {
    this._tracker = options.tracker;
    this.shapeFormat = options.shapeFormat;
  }

  shapeFormat: JCadWorkerSupportedFormat;

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
      const content = msg.payload['postShape'];
      const format = jCadObject?.shapeMetadata?.shapeFormat || this.shapeFormat;

      if (
        format === JCadWorkerSupportedFormat.STL &&
        typeof content === 'string'
      ) {
        this._downloadFile(jCadObject.name, content, 'stl');
      } else if (
        format === JCadWorkerSupportedFormat.BREP &&
        typeof content === 'string'
      ) {
        this._downloadFile(jCadObject.name, content, 'brep');
      } else {
        console.error('No valid content received for object:', jCadObject.name);
      }
    }
  }

  private _downloadFile(
    objectName: string,
    content: string,
    ext: string
  ): void {
    const blob = new Blob([content], {
      type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const originalObjectName = objectName.replace(/_(STL|BREP)_Export$/, '');
    link.download = `${originalObjectName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')}.${ext}`;
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

export namespace ExportWorker {
  export interface IOptions {
    tracker: IJupyterCadTracker;
    shapeFormat: JCadWorkerSupportedFormat;
  }
}
