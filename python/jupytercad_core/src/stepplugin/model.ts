import {
  SCHEMA_VERSION,
  IJCadObject,
  IJcadObjectDocChange,
  IJupyterCadDoc,
  JupyterCadDoc
} from '@jupytercad/schema';
import { JSONExt } from '@lumino/coreutils';
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

  setSource(value: string): void {
    this._source.insert(0, value);
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
