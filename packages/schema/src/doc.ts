import { MapChange, YDocument } from '@jupyter/ydoc';
import { JSONExt, JSONObject, JSONValue } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import * as Y from 'yjs';

import { IJCadObject, IJCadOptions } from './_interface/jcad';
import {
  IDict,
  IJcadObjectDocChange,
  IJupyterCadDoc,
  IJupyterCadDocChange,
  IPostResult
} from './interfaces';

export class JupyterCadDoc
  extends YDocument<IJupyterCadDocChange>
  implements IJupyterCadDoc
{
  constructor() {
    super();

    this._options = this.ydoc.getMap<Y.Map<any>>('options');
    this._objects = this.ydoc.getArray<Y.Map<any>>('objects');
    this._metadata = this.ydoc.getMap<string>('metadata');
    this._outputs = this.ydoc.getMap<IPostResult>('outputs');
    this.undoManager.addToScope(this._objects);

    this._objects.observeDeep(this._objectsObserver);
    this._metadata.observe(this._metaObserver);
    this._options.observe(this._optionsObserver);
  }

  dispose(): void {
    super.dispose();
  }

  get version(): string {
    return '0.1.0';
  }

  get objects(): Array<IJCadObject> {
    const objs = this._objects.map(
      obj => JSONExt.deepCopy(obj.toJSON()) as IJCadObject
    );
    return objs;
  }

  get options(): JSONObject {
    return JSONExt.deepCopy(this._options.toJSON());
  }

  get metadata(): JSONObject {
    return JSONExt.deepCopy(this._metadata.toJSON());
  }

  get outputs(): JSONObject {
    return JSONExt.deepCopy(this._outputs.toJSON());
  }

  get objectsChanged(): ISignal<IJupyterCadDoc, IJcadObjectDocChange> {
    return this._objectsChanged;
  }

  get optionsChanged(): ISignal<IJupyterCadDoc, MapChange> {
    return this._optionsChanged;
  }

  getSource(): JSONValue | string {
    const objects = this._objects.toJSON();
    const options = this._options.toJSON();
    const metadata = this._metadata.toJSON();
    const outputs = this._outputs.toJSON();

    return { objects, options, metadata, outputs };
  }

  setSource(value: JSONValue): void {
    if (!value) {
      return;
    }
    this.transact(() => {
      const objects = value['objects'] ?? [];
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

  get metadataChanged(): ISignal<IJupyterCadDoc, MapChange> {
    return this._metadataChanged;
  }

  objectExists(name: string): boolean {
    return Boolean(this._getObjectAsYMapByName(name));
  }

  getObjectByName(name: string): IJCadObject | undefined {
    const obj = this._getObjectAsYMapByName(name);
    if (obj) {
      return JSONExt.deepCopy(obj.toJSON()) as IJCadObject;
    }
    return undefined;
  }

  getDependants(name: string): string[] {
    const dependants: string[] = [];
    const dependantMap = new Map<string, Set<string>>();

    for (const obj of this._objects) {
      const deps: string[] = obj.get('dependencies') || [];
      const objName = obj.get('name');
      deps.forEach(dep => {
        const currentSet = dependantMap.get(dep);
        if (currentSet) {
          currentSet.add(objName);
        } else {
          dependantMap.set(dep, new Set([objName]));
        }
      });
    }
    const selectedDeps = dependantMap.get(name);
    if (!selectedDeps) {
      return [];
    }
    while (selectedDeps.size) {
      const depsList = [...selectedDeps];
      depsList.forEach(it => {
        dependants.push(it);
        selectedDeps.delete(it);
        dependantMap.get(it)?.forEach(newIt => selectedDeps.add(newIt));
      });
    }

    return dependants;
  }

  removeObjects(names: string[]): void {
    this.transact(() => {
      for (const name of names) {
        this.removeObjectByName(name);
      }
    });
  }

  removeObjectByName(name: string): void {
    // Get object index
    let index = 0;
    for (const obj of this._objects) {
      if (obj.get('name') === name) {
        break;
      }
      index++;
    }

    if (this._objects.length > index) {
      this._objects.delete(index);
      this.removeOutput(name);
    }
  }

  addObject(value: IJCadObject): void {
    this.addObjects([value]);
  }

  addObjects(value: Array<IJCadObject>): void {
    this.transact(() => {
      value.map(obj => {
        if (!this.objectExists(obj.name)) {
          this._objects.push([new Y.Map(Object.entries(obj))]);
        } else {
          console.error('There is already an object with the name:', obj.name);
        }
      });
    });
  }

  updateObjectByName(
    name: string,
    payload: { data: { key: string; value: any }; meta?: IDict }
  ): void {
    const obj = this._getObjectAsYMapByName(name);
    if (!obj) {
      return;
    }
    const { key, value } = payload.data;

    this.transact(() => {
      // Special case for changing parameters, we may need to update dependencies
      if (key === 'parameters') {
        switch (obj.get('shape')) {
          case 'Part::Cut': {
            obj.set('dependencies', [value['Base'], value['Tool']]);
            break;
          }
          case 'Part::Extrusion':
          case 'Part::Fillet':
          case 'Part::Chamfer': {
            obj.set('dependencies', [value['Base']]);
            break;
          }
          case 'Part::MultiCommon':
          case 'Part::MultiFuse': {
            obj.set('dependencies', value['Shapes']);
            break;
          }
          default:
            break;
        }
      }

      obj.set(key, value);
      if (payload.meta) {
        obj.set('shapeMetadata', payload.meta);
      }
    });
  }

  getOption(key: keyof IJCadOptions): IDict | undefined {
    const content = this._options.get(key);
    if (!content) {
      return;
    }
    return JSONExt.deepCopy(content) as IDict;
  }

  setOption(key: keyof IJCadOptions, value: IDict): void {
    this.transact(() => void this._options.set(key, value));
  }

  setOptions(options: IJCadOptions): void {
    this.transact(() => {
      for (const [key, value] of Object.entries(options)) {
        this._options.set(key, value);
      }
    });
  }

  getMetadata(key: string): string | undefined {
    return this._metadata.get(key);
  }

  setMetadata(key: string, value: string): void {
    this.transact(() => void this._metadata.set(key, value));
  }

  removeMetadata(key: string): void {
    if (this._metadata.has(key)) {
      this._metadata.delete(key);
    }
  }

  getOutput(key: string): IPostResult | undefined {
    return this._outputs.get(key);
  }

  setOutput(key: string, value: IPostResult): void {
    this.transact(() => void this._outputs.set(key, value));
  }

  removeOutput(key: string): void {
    if (this._outputs.has(key)) {
      this._outputs.delete(key);
    }
  }

  setShapeMeta(name: string, meta?: IDict): void {
    const obj = this._getObjectAsYMapByName(name);
    if (meta && obj) {
      this.transact(() => void obj.set('shapeMetadata', meta));
    }
  }

  static create(): IJupyterCadDoc {
    return new JupyterCadDoc();
  }

  editable = true;

  private _getObjectAsYMapByName(name: string): Y.Map<any> | undefined {
    for (const obj of this._objects) {
      if (obj.get('name') === name) {
        return obj;
      }
    }
    return undefined;
  }

  private _objectsObserver = (events: Y.YEvent<any>[]): void => {
    const changes: Array<{
      name: string;
      key: keyof IJCadObject;
      newValue: IJCadObject;
    }> = [];
    let needEmit = false;
    events.forEach(event => {
      const name = event.target.get('name');

      if (name) {
        event.keys.forEach((change, key) => {
          if (!needEmit && key !== 'shapeMetadata') {
            needEmit = true;
          }
          changes.push({
            name,
            key: key as any,
            newValue: JSONExt.deepCopy(event.target.toJSON())
          });
        });
      }
    });
    needEmit = changes.length === 0 ? true : needEmit;
    if (needEmit) {
      this._objectsChanged.emit({ objectChange: changes });
    }
    this._changed.emit({ objectChange: changes });
  };

  private _metaObserver = (event: Y.YMapEvent<string>): void => {
    this._metadataChanged.emit(event.keys);
  };

  private _optionsObserver = (event: Y.YMapEvent<Y.Map<string>>): void => {
    this._optionsChanged.emit(event.keys);
  };

  private _objects: Y.Array<Y.Map<any>>;
  private _options: Y.Map<any>;
  private _metadata: Y.Map<string>;
  private _outputs: Y.Map<IPostResult>;
  private _metadataChanged = new Signal<IJupyterCadDoc, MapChange>(this);
  private _optionsChanged = new Signal<IJupyterCadDoc, MapChange>(this);
  private _objectsChanged = new Signal<IJupyterCadDoc, IJcadObjectDocChange>(
    this
  );
}
