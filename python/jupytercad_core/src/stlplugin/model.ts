import {
  IJCadObject,
  IJcadObjectDocChange,
  IJupyterCadDoc,
  JupyterCadDoc
} from '@jupytercad/schema';
import { JSONExt } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import * as Y from 'yjs';

export class JupyterCadStlDoc extends JupyterCadDoc {
  constructor() {
    super();

    this._source = this.ydoc.getText('source');

    this._source.observeDeep(this._sourceObserver);
  }

  get version(): string {
    return '0.1.0';
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
        name: 'Stl File', // TODO get file name?
        visible: true,
        shape: 'Part::Any',
        parameters: {
          Content: this._source.toJSON(),
          Type: 'STL'
        }
      }
    ];
  }

  static create(): JupyterCadStlDoc {
    return new JupyterCadStlDoc();
  }

  editable = false;

  private _sourceObserver = (events: Y.YEvent<any>[]): void => {
    const changes: Array<{
      name: string;
      key: keyof IJCadObject;
      newValue: IJCadObject;
    }> = [];
    events.forEach(event => {
      event.keys.forEach((change, key) => {
        changes.push({
          name: 'Stl File',
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
