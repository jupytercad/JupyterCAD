import {
  IJupyterCadDoc,
  IJupyterCadDocChange,
  IJupyterCadTracker
} from '@jupytercad/schema';
import { ISignal, Signal } from '@lumino/signaling';

export class SuggestionModel {
  constructor(options: SuggestionModel.IOptions) {
    this.sharedModel = options.sharedModel;
    this._title = options.title;
    this._tracker = options.tracker;
    console.log(this._tracker);
  }

  get title(): string {
    return this._title ?? '';
  }

  set title(newTitle: string) {
    this._title = newTitle;
  }
  set sharedModel(newSharedModel: IJupyterCadDoc | undefined) {
    this._sharedModel?.changed.disconnect(this._onStateChanged, this);
    this._sharedModel = newSharedModel;
    this._sharedModel?.changed.connect(this._onStateChanged.bind(this), this);
  }
  get sharedModel(): IJupyterCadDoc | undefined {
    return this._sharedModel;
  }

  get allForks(): string[] {
    return this._allForks;
  }

  get forksUpdated(): ISignal<SuggestionModel, void> {
    return this._forksUpdated;
  }
  get forkSwitched(): ISignal<SuggestionModel, string> {
    return this._forkSwitched;
  }
  get contextChanged(): ISignal<SuggestionModel, void> {
    return this._contextChanged;
  }

  switchContext(context: {
    title: string;
    sharedModel: IJupyterCadDoc | undefined;
  }): void {
    this._title = context.title;
    this.sharedModel = context.sharedModel;
    this._contextChanged.emit();
  }

  async mergeFork(forkId: string): Promise<void> {
    /** */
  }
  async createFork(): Promise<string | undefined> {
    console.log('create new fork');
    const id = '';
    return id;
  }

  async backToRoot(): Promise<void> {
    /** */
  }

  async checkoutFork(forkId: string, split = false): Promise<void> {
    /** */
  }

  private _onStateChanged(
    sender: IJupyterCadDoc,
    changes: IJupyterCadDocChange
  ) {
    let forkUpdated = false;
    if (changes.stateChange) {
      const forkPrefix = 'fork_';
      changes.stateChange.forEach(value => {
        if (value.name === 'merge') {
          // TODO
        } else if (value.name.startsWith(forkPrefix)) {
          const forkId = value.name.slice(forkPrefix.length);
          if (value.newValue === 'new') {
            this._allForks.push(forkId);
            forkUpdated = true;
          } else if (value.newValue === undefined) {
            // TODO
          }
        }
      });
    }
    if (forkUpdated) {
      this._forksUpdated.emit();
    }
  }
  private _sharedModel: IJupyterCadDoc | undefined;
  private _allForks: string[] = [];
  private _forksUpdated: Signal<this, void> = new Signal(this);
  private _forkSwitched: Signal<this, string> = new Signal(this);
  private _contextChanged: Signal<this, void> = new Signal(this);
  private _title: string | undefined;
  private _tracker: IJupyterCadTracker;
}

namespace SuggestionModel {
  export interface IOptions {
    sharedModel: IJupyterCadDoc | undefined;
    title: string;
    tracker: IJupyterCadTracker;
  }
}
