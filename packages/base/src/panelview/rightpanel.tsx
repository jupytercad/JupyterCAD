import {
  IAnnotationModel,
  IJupyterCadTracker,
  JupyterCadDoc
} from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';

import { IControlPanelModel } from '../types';
import { Annotations } from './annotations';
import { ControlPanelHeader } from './header';
import { SuggestionPanel } from '../suggestion/suggestionpanel';
import { SuggestionModel } from '../suggestion/model';

export class RightPanelWidget extends SidePanel {
  constructor(options: RightPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this.addClass('data-jcad-keybinding');
    this.node.tabIndex = 0;
    this._model = options.model;
    this._annotationModel = options.annotationModel;

    const header = new ControlPanelHeader();
    this.header.addWidget(header);

    const annotations = new Annotations({ model: this._annotationModel });
    this.addWidget(annotations);

    const suggestionModel = new SuggestionModel({
      sharedModel: this._model?.sharedModel,
      title: '',
      tracker: options.tracker
    });
    const suggestion = new SuggestionPanel({ model: suggestionModel });
    this.addWidget(suggestion);

    options.tracker.currentChanged.connect((_, changed) => {
      if (changed) {
        header.title.label = changed.context.localPath;
        this._annotationModel.context =
          options.tracker.currentWidget?.context || undefined;
        suggestionModel.switchContext({
          title: changed.context.localPath,
          sharedModel: changed.context?.model?.sharedModel
        });
      } else {
        header.title.label = '-';
        suggestionModel.switchContext({
          title: '',
          sharedModel: undefined
        });
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
    tracker: IJupyterCadTracker;
    annotationModel: IAnnotationModel;
  }
  export interface IProps {
    filePath?: string;
    sharedModel?: JupyterCadDoc;
  }
}
