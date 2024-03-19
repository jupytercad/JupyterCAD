import {
  IAnnotationModel,
  IJupyterCadTracker,
  JupyterCadDoc
} from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';

import { IControlPanelModel } from '../types';
import { ControlPanelHeader } from './header';
import { SuggestionPanel } from '../suggestion/suggestionpanel';
import { AnnotationsPanel } from '../annotation/annotationspanel';

export class RightPanelWidget extends SidePanel {
  constructor(options: RightPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this._model = options.model;

    const header = new ControlPanelHeader();
    this.header.addWidget(header);

    this._annotationModel = options.annotationModel;
    const annotations = new AnnotationsPanel({ model: this._annotationModel });
    this.addWidget(annotations);

    const suggestion = new SuggestionPanel({
      sharedModel: this._model.sharedModel
    });
    this.addWidget(suggestion);

    this._model.documentChanged.connect((_, changed) => {
      if (changed) {
        header.title.label = changed.context.localPath;
        this._annotationModel.context =
          options.tracker.currentWidget?.context || undefined;
      } else {
        header.title.label = '-';
        this._annotationModel.context = undefined;
      }
    });
  }

  dispose(): void {
    super.dispose();
  }
  private _model: IControlPanelModel;
  private _annotationModel: IAnnotationModel;
}

export namespace RightPanelWidget {
  export interface IOptions {
    model: IControlPanelModel;
    annotationModel: IAnnotationModel;
    tracker: IJupyterCadTracker;
  }
  export interface IProps {
    filePath?: string;
    sharedModel?: JupyterCadDoc;
  }
}
