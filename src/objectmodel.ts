import * as Y from 'yjs';

import { MapChange, YDocument } from '@jupyterlab/shared-models';
import { IJcadObject } from './types';

export type IJcadObjectDocChange = {
  contextChange?: MapChange;
  objectChange?: MapChange;
};
export class JcadObjectDoc extends YDocument<IJcadObjectDocChange> {
  constructor() {
    super();
    this._geometryObject = this.ydoc.getMap('geometryObject');
    this._geometryObject.observe(this._objectObserver);
  }

  get object(): Y.Map<any> {
    return this._geometryObject;
  }

  public setProperty(key: string, value: any): void {
    this._geometryObject.set(key, value);
  }

  public getProperty(key: string): any | undefined {
    return this._geometryObject.get(key);
  }

  public toJson(): IJcadObject {
    const values = {} as IJcadObject;
    for (const [key, value] of this._geometryObject.entries()) {
      values[key] = value;
    }
    return values;
  }

  dispose(): void {
    this._geometryObject.unobserve(this._objectObserver);
  }

  private _objectObserver = (event: Y.YMapEvent<any>): void => {
    const changes: IJcadObjectDocChange = { objectChange: event.keys };
    this._changed.emit(changes);
  };

  public static create(): JcadObjectDoc {
    return new JcadObjectDoc();
  }

  private _geometryObject: Y.Map<any>;
}
