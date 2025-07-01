import { IWorkerMessage } from '@jupytercad/occ-worker';
import {
  IAnnotation,
  IDict,
  IJcadObjectDocChange,
  IJCadWorker,
  IJCadWorkerRegistry,
  IJupyterCadModel,
  IMainMessage,
  IPostOperatorInput,
  IPostResult,
  JCadWorkerSupportedFormat,
  IDryRunResponsePayload,
  MainAction,
  WorkerAction,
  IJCadContent
} from '@jupytercad/schema';
import { showErrorMessage } from '@jupyterlab/apputils';
import { ObservableMap } from '@jupyterlab/observables';
import {
  JSONObject,
  JSONValue,
  PromiseDelegate,
  UUID
} from '@lumino/coreutils';
import { IDisposable } from '@lumino/disposable';
import { ISignal, Signal } from '@lumino/signaling';
import { v4 as uuid } from 'uuid';

export class MainViewModel implements IDisposable {
  constructor(options: MainViewModel.IOptions) {
    this._jcadModel = options.jcadModel;
    this._viewSetting = options.viewSetting;
    this._workerRegistry = options.workerRegistry;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  get id(): string {
    return this._id;
  }
  get renderSignal(): ISignal<
    this,
    {
      shapes: any;
      postShapes?: IDict<IPostResult> | null;
      postResult?: IDict<IPostOperatorInput>;
    }
  > {
    return this._renderSignal;
  }

  get afterShowSignal(): ISignal<this, null> {
    return this._afterShowSignal;
  }

  emitAfterShow() {
    this._afterShowSignal.emit(null);
  }

  get workerBusy(): ISignal<this, boolean> {
    return this._workerBusy;
  }

  get jcadModel() {
    return this._jcadModel;
  }

  get viewSettingChanged() {
    return this._viewSetting.changed;
  }

  get viewSettings(): JSONObject {
    const settings: JSONObject = {};
    for (const key of this._viewSetting.keys()) {
      settings[key] = this._viewSetting.get(key) || null;
    }
    return settings;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._jcadModel.sharedObjectsChanged.disconnect(
      this._onSharedObjectsChanged,
      this
    );
    this._isDisposed = true;
  }

  initSignal(): void {
    this._jcadModel.sharedObjectsChanged.connect(
      this._onSharedObjectsChanged,
      this
    );
  }

  initWorker(): void {
    this._worker = this._workerRegistry.getDefaultWorker();
    this._id = this._worker.register({
      messageHandler: this.messageHandler.bind(this)
    });
    this._workerRegistry.getAllWorkers().forEach(wk => {
      const id = wk.register({
        messageHandler: this.postProcessWorkerHandler.bind(this)
      });
      this._postWorkerId.set(id, wk);
    });
  }

  messageHandler(msg: IMainMessage): void {
    switch (msg.action) {
      case MainAction.DISPLAY_SHAPE: {
        const { result, postResult } = msg.payload;
        const rawPostResult: IDict<IPostOperatorInput> = {};
        const threejsPostResult: IDict<IPostOperatorInput> = {};

        Object.entries(postResult).forEach(([key, val]) => {
          const format = val.jcObject?.shapeMetadata?.shapeFormat;
          if (format === JCadWorkerSupportedFormat.BREP) {
            rawPostResult[key] = val;
          } else if (format === JCadWorkerSupportedFormat.GLTF) {
            threejsPostResult[key] = val;
          } else if (format === JCadWorkerSupportedFormat.STL) {
            rawPostResult[key] = val;
          }
        });

        if (this._firstRender) {
          const postShapes = this._jcadModel.sharedModel
            .outputs as any as IDict<IPostResult>;
          this._renderSignal.emit({
            shapes: result,
            postShapes,
            postResult: threejsPostResult
          });
          this._firstRender = false;
        } else {
          this._renderSignal.emit({
            shapes: result,
            postShapes: null,
            postResult: threejsPostResult
          });
          this.sendRawGeometryToWorker(rawPostResult);
        }
        this._workerBusy.emit(false);

        break;
      }
      case MainAction.DRY_RUN_RESPONSE: {
        this._dryRunResponses[msg.payload.id].resolve(msg.payload);
        break;
      }
      case MainAction.INITIALIZED: {
        if (!this._jcadModel) {
          return;
        }
        const content = this._jcadModel.getContent();
        this._workerBusy.emit(true);
        this._postMessage({
          action: WorkerAction.LOAD_FILE,
          payload: {
            content
          }
        });
      }
    }
  }

  sendRawGeometryToWorker(postResult: IDict<IPostOperatorInput>): void {
    Object.values(postResult).forEach(res => {
      this._postWorkerId.forEach((wk, id) => {
        const shape = res.jcObject.shape;
        if (!shape) {
          return;
        }

        const { shapeFormat, workerId } = res.jcObject?.shapeMetadata ?? {};
        const worker = this._workerRegistry.getWorker(workerId ?? '');
        if (wk !== worker) {
          return;
        }

        if (wk.shapeFormat === shapeFormat) {
          wk.postMessage({
            id,
            action: WorkerAction.POSTPROCESS,
            payload: res
          });
        }
      });
    });
  }

  /**
   * Try to update an object, performing a dry run first to make sure it's feasible.
   */
  async maybeUpdateObjectParameters(
    name: string,
    properties: { [key: string]: any }
  ): Promise<boolean> {
    // getContent already returns a deep copy of the content, we can change it safely here
    const updatedContent = this.jcadModel.getContent();
    for (const object of updatedContent.objects) {
      if (object.name === name) {
        object.parameters = {
          ...object.parameters,
          ...properties
        };
      }
    }

    // Try a dry run
    const dryRunResult = await this.dryRun(updatedContent);
    if (dryRunResult.status === 'error') {
      showErrorMessage(
        'Failed to update the desired shape',
        'The tool was unable to update the desired shape due to invalid parameter values. The values you entered may not be compatible with the dimensions of your piece.'
      );
      return false;
    }

    // Dry run was successful, ready to apply the update now
    const meta: IDict = dryRunResult.shapeMetadata?.[name] ?? {};
    const obj = this.jcadModel.sharedModel.getObjectByName(name);
    if (obj) {
      this.jcadModel.sharedModel.updateObjectByName(name, {
        data: {
          key: 'parameters',
          value: {
            ...obj.parameters,
            ...properties
          }
        },
        meta
      });
    }

    return true;
  }

  /**
   * Send a payload to the worker to test its feasibility.
   *
   * Return true is the payload is valid, false otherwise.
   */
  async dryRun(content: IJCadContent): Promise<IDryRunResponsePayload> {
    await this._worker.ready;

    const id = UUID.uuid4();

    this._dryRunResponses[id] = new PromiseDelegate();

    this._workerBusy.emit(true);

    this._postMessage({
      action: WorkerAction.DRY_RUN,
      payload: {
        id,
        content
      }
    });

    const response = await this._dryRunResponses[id].promise;

    delete this._dryRunResponses[id];

    this._workerBusy.emit(false);

    return response;
  }

  postProcessWorkerHandler(msg: IMainMessage): void {
    switch (msg.action) {
      case MainAction.DISPLAY_POST: {
        const postShapes: IDict<IPostResult> = {};
        msg.payload.forEach(element => {
          const { jcObject, postResult } = element;
          this._jcadModel.sharedModel.setOutput(jcObject.name, postResult);
          postShapes[jcObject.name] = postResult;
        });
        this._renderSignal.emit({ shapes: null, postShapes });
        break;
      }
    }
  }

  addAnnotation(value: IAnnotation): void {
    this._jcadModel.annotationModel?.addAnnotation(uuid(), value);
  }

  private _postMessage(msg: Omit<IWorkerMessage, 'id'>) {
    if (this._worker) {
      const newMsg = { ...msg, id: this._id };
      this._worker.postMessage(newMsg);
    }
  }

  private async _onSharedObjectsChanged(
    _: IJupyterCadModel,
    change: IJcadObjectDocChange
  ): Promise<void> {
    if (change.objectChange) {
      await this._worker.ready;
      const content = this._jcadModel.getContent();
      this._workerBusy.emit(true);
      this._postMessage({
        action: WorkerAction.LOAD_FILE,
        payload: {
          content
        }
      });
    }
  }

  private _dryRunResponses: IDict<PromiseDelegate<IDryRunResponsePayload>> = {};
  private _jcadModel: IJupyterCadModel;
  private _viewSetting: ObservableMap<JSONValue>;
  private _workerRegistry: IJCadWorkerRegistry;
  private _worker: IJCadWorker;
  private _postWorkerId: Map<string, IJCadWorker> = new Map();
  private _firstRender = true;
  private _id: string;
  private _renderSignal = new Signal<
    this,
    {
      shapes: any;
      postShapes?: IDict<IPostResult> | null;
      postResult?: IDict<IPostOperatorInput>;
    }
  >(this);
  private _afterShowSignal = new Signal<this, null>(this);
  private _workerBusy = new Signal<this, boolean>(this);
  private _isDisposed = false;
}

export namespace MainViewModel {
  export interface IOptions {
    jcadModel: IJupyterCadModel;
    viewSetting: ObservableMap<JSONValue>;
    workerRegistry: IJCadWorkerRegistry;
  }
}
