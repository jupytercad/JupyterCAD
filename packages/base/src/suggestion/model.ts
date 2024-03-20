import { IJupyterCadDoc, IJupyterCadDocChange } from '@jupytercad/schema';
import { ISignal, Signal } from '@lumino/signaling';

export class SuggestionModel {
  constructor(options: SuggestionModel.IOptions) {
    this.sharedModel = options.sharedModel;
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

  async createFork(): Promise<string | undefined> {
    const sharedModel = this.sharedModel;
    console.log('sssss', sharedModel);
    if (sharedModel) {
      const forkId = await sharedModel.provider.fork();
      console.log('CCCCCCCCCC', forkId);
      sharedModel.provider.connect(forkId);
      return forkId;
    }
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
}

namespace SuggestionModel {
  export interface IOptions {
    sharedModel: IJupyterCadDoc | undefined;
  }
}
