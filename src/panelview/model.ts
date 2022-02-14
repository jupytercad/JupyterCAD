import { ObservableMap, IObservableMap } from '@jupyterlab/observables';
import { ISignal, Signal } from '@lumino/signaling';
export interface IControlPanelState {
  activatedObject: string;
}

type IStateValue = string | number;
type ISateChangedSignal = ISignal<
  ObservableMap<IStateValue>,
  IObservableMap.IChangedArgs<IStateValue>
>;
export class ControlPanelModel {
  constructor() {
    const state = { activatedObject: '' };
    this._state = new ObservableMap({ values: state });
    this._stateChanged = this._state.changed;
  }
  get state(): ObservableMap<string | number> {
    return this._state;
  }
  get stateChanged(): ISateChangedSignal {
    return this._stateChanged;
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

  private readonly _stateChanged: ISateChangedSignal;
  private readonly _state: ObservableMap<IStateValue>;
}
