import * as Y from 'yjs';

import { MapChange, YDocument } from '@jupyterlab/shared-models';
import { IJcadObject, ValueOf } from './types';
import { ISignal, Signal } from '@lumino/signaling';
export type IJcadObjectDocChange = {
  contextChange?: MapChange;
  objectChange?: MapChange;
};
export class JcadObjectDoc extends Y.Map<any> {
  constructor(entries?: Iterable<readonly [string, any]> | undefined) {
    super(entries);
    this.observe(this._objectObserver);
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

  get changed(): ISignal<this, IJcadObjectDocChange> {
    return this._changed;
  }

  dispose(): void {
    this.unobserve(this._objectObserver);
  }

  private _objectObserver = (event: Y.YMapEvent<any>): void => {
    const changes: IJcadObjectDocChange = { objectChange: event.keys };
    this._changed.emit(changes);
  };

  public static create(): JcadObjectDoc {
    return new JcadObjectDoc();
  }
  private _changed: Signal<this, IJcadObjectDocChange>;
}
