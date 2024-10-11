import { IJupyterCadDoc, IJupyterCadModel } from '@jupytercad/schema';
import { ISignal } from '@lumino/signaling';

import { IJupyterCadTracker, IJupyterCadWidget } from '@jupytercad/schema';
import { IControlPanelModel } from '../types';
import { JupyterCadWidget } from '../widget';
import { MainViewModel } from '../3dview/mainviewmodel';

export class ControlPanelModel implements IControlPanelModel {
  constructor(options: ControlPanelModel.IOptions) {
    this._tracker = options.tracker;
    this._documentChanged = this._tracker.currentChanged;
  }

  get documentChanged(): ISignal<IJupyterCadTracker, IJupyterCadWidget | null> {
    return this._documentChanged;
  }

  get filePath(): string | undefined {
    return this._tracker.currentWidget?.context.localPath;
  }

  get jcadModel(): IJupyterCadModel | undefined {
    return this._tracker.currentWidget?.context.model;
  }

  get sharedModel(): IJupyterCadDoc | undefined {
    return this._tracker.currentWidget?.context.model.sharedModel;
  }

  get mainViewModel(): MainViewModel | undefined {
    return (this._tracker.currentWidget as JupyterCadWidget | null)?.content
      .currentViewModel;
  }

  disconnect(f: any): void {
    this._tracker.forEach(w => {
      w.context.model.sharedObjectsChanged.disconnect(f);
      w.context.model.sharedOptionsChanged.disconnect(f);
      w.context.model.sharedMetadataChanged.disconnect(f);
    });
    this._tracker.forEach(w => w.context.model.themeChanged.disconnect(f));
    this._tracker.forEach(w =>
      w.context.model.clientStateChanged.disconnect(f)
    );
  }

  private readonly _tracker: IJupyterCadTracker;
  private _documentChanged: ISignal<
    IJupyterCadTracker,
    IJupyterCadWidget | null
  >;
}

namespace ControlPanelModel {
  export interface IOptions {
    tracker: IJupyterCadTracker;
  }
}
