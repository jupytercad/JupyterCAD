import { ObservableMap } from '@jupyterlab/observables';
import { ISignal } from '@lumino/signaling';

import { IJupyterCadTracker } from '../token';
import {
  IControlPanelModel,
  IControlPanelState,
  IJupyterCadDoc,
  IJupyterCadModel,
  IJupyterCadWidget,
  ISateChangedSignal,
  IStateValue
} from '../types';

export class ControlPanelModel implements IControlPanelModel {
  constructor(options: ControlPanelModel.IOptions) {
    const state = { activatedObject: '', visibleObjects: [] };
    this._state = new ObservableMap({ values: state });
    this._stateChanged = this._state.changed;
    this._tracker = options.tracker;
    this._documentChanged = this._tracker.currentChanged;
  }

  get state(): ObservableMap<IStateValue> {
    return this._state;
  }

  get stateChanged(): ISateChangedSignal {
    return this._stateChanged;
  }

  get documentChanged(): ISignal<IJupyterCadTracker, IJupyterCadWidget | null> {
    return this._documentChanged;
  }

  get filePath(): string | undefined {
    return this._tracker.currentWidget?.context.localPath;
  }

  get jcadModel(): IJupyterCadModel | undefined {
    return this._tracker.currentWidget?.context.model;
  }

  get sharedModel(): IJupyterCadDoc | undefined {
    return this._tracker.currentWidget?.context.model.sharedModel;
  }

  set(key: keyof IControlPanelState, value: IStateValue): void {
    this._state.set(key, value);
  }

  get(key: keyof IControlPanelState): IStateValue | undefined {
    return this._state.get(key);
  }

  has(key: keyof IControlPanelState): boolean {
    return this._state.has(key);
  }

  disconnect(f: any): void {
    this._tracker.forEach(w =>
      w.context.model.sharedModelChanged.disconnect(f)
    );
  }

  private readonly _stateChanged: ISateChangedSignal;
  private readonly _state: ObservableMap<IStateValue>;
  private readonly _tracker: IJupyterCadTracker;
  private _documentChanged: ISignal<
    IJupyterCadTracker,
    IJupyterCadWidget | null
  >;
}

namespace ControlPanelModel {
  export interface IOptions {
    tracker: IJupyterCadTracker;
  }
}
