import {
  SCHEMA_VERSION,
  IJCadObject,
  IJcadObjectDocChange,
  IJupyterCadDoc,
  JupyterCadDoc
} from '@jupytercad/schema';
import { JSONExt, JSONObject } from '@lumino/coreutils';
import { IPostResult } from '@jupytercad/schema';
import { ISignal, Signal } from '@lumino/signaling';
import * as Y from 'yjs';

export class JupyterCadStepDoc extends JupyterCadDoc {
  constructor() {
    super();

    this._source = this.ydoc.getText('source');

    this._source.observeDeep(this._sourceObserver);
  }

  set source(value: string) {
    this._source.insert(0, value);
  }

  get version(): string {
    return SCHEMA_VERSION;
  }

  get objectsChanged(): ISignal<IJupyterCadDoc, IJcadObjectDocChange> {
    return this._objectChanged;
  }

  get objects(): Array<IJCadObject> {
    const source = this._source.toJSON();

    if (!source) {
      return [];
    }

    return [
      {
        name: 'Step File', // TODO get file name?
        visible: true,
        shape: 'Part::Any',
        parameters: {
          Content: this._source.toJSON(),
          Type: 'STEP',
          Color: '#808080',
          Placement: {
            Angle: 0.0,
            Axis: [0.0, 0.0, 1.0],
            Position: [0.0, 0.0, 0.0]
          }
        }
      }
    ];
  }

  setSource(source: JSONObject | string): void {
    if (!source) {
      return;
    }
    let value: JSONObject;

    if (typeof source === 'string') {
      value = JSON.parse(source);
    } else {
      value = source;
    }

    this.transact(() => {
      const objects = (value['objects'] ?? []) as any[];
      objects.forEach(obj => {
        this._objects.push([new Y.Map(Object.entries(obj))]);
      });

      const options = value['options'] ?? {};
      Object.entries(options).forEach(([key, val]) =>
        this._options.set(key, val)
      );

      const metadata = value['metadata'] ?? {};
      Object.entries(metadata).forEach(([key, val]) =>
        this._metadata.set(key, val as string)
      );

      const outputs = value['outputs'] ?? {};
      Object.entries(outputs).forEach(([key, val]) =>
        this._outputs.set(key, val as IPostResult)
      );
    });
  }

  static create(): JupyterCadStepDoc {
    return new JupyterCadStepDoc();
  }

  editable = false;
  toJcadEndpoint = 'jupytercad/export';

  private _sourceObserver = (events: Y.YEvent<any>[]): void => {
    const changes: Array<{
      name: string;
      key: keyof IJCadObject;
      newValue: IJCadObject;
    }> = [];
    events.forEach(event => {
      event.keys.forEach((change, key) => {
        changes.push({
          name: 'Step File',
          key: key as any,
          newValue: JSONExt.deepCopy(event.target.toJSON())
        });
      });
    });
    this._objectChanged.emit({ objectChange: changes });
    this._changed.emit({ objectChange: changes });
  };

  private _source: Y.Text;
  private _objectChanged = new Signal<IJupyterCadDoc, IJcadObjectDocChange>(
    this
  );
}
