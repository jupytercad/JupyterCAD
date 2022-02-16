import { ISignal, Signal } from '@lumino/signaling';
import * as Y from 'yjs';

import {
  IJcadObject,
  IJcadObjectDoc,
  IJcadObjectDocChange,
  ValueOf
} from './types';

export class JcadObjectDoc extends Y.Map<any> implements IJcadObjectDoc {
  constructor(entries?: Iterable<readonly [string, any]> | undefined) {
    super(entries);
    this.observe(this._objectObserver);
    this._changed = new Signal<IJcadObjectDoc, IJcadObjectDocChange>(this);
  }

  public getObject(): IJcadObject {
    const values = {} as IJcadObject;
    for (const [key, value] of this.entries()) {
      if (key !== 'id') {
        values[key] = value;
      }
    }

    return values;
  }

  public getProperty(key: keyof IJcadObject): ValueOf<IJcadObject> | undefined {
    return this.get(key);
  }

  public setProperty(
    key: keyof IJcadObject,
    value: ValueOf<IJcadObject>
  ): void {
    this.set(key, value);
  }

  get changed(): ISignal<IJcadObjectDoc, IJcadObjectDocChange> {
    return this._changed;
  }

  dispose(): void {
    this.unobserve(this._objectObserver);
  }

  private _objectObserver = (event: Y.YMapEvent<any>): void => {
    const changes: IJcadObjectDocChange = { objectChange: event.keys };
    this._changed.emit(changes);
  };

  private _changed: Signal<IJcadObjectDoc, IJcadObjectDocChange>;
}
