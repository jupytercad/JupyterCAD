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
import { IForkManager } from '@jupyter/docprovider';
import { ICollaborativeDrive } from '@jupyter/collaborative-drive';
export class RightPanelWidget extends SidePanel {
  constructor(options: RightPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this.addClass('data-jcad-keybinding');
    this.node.tabIndex = 0;
    const { model, tracker, forkManager, collaborativeDrive, annotationModel } =
      options;
    this._model = model;
    this._annotationModel = annotationModel;

    const header = new ControlPanelHeader();
    this.header.addWidget(header);

    const annotations = new Annotations({ model: this._annotationModel });
    this.addWidget(annotations);
    let suggestionModel: SuggestionModel | undefined = undefined;
    if (forkManager) {
      suggestionModel = new SuggestionModel({
        jupytercadModel: this._model?.jcadModel,
        filePath: '',
        tracker: tracker,
        forkManager: forkManager,
        collaborativeDrive: collaborativeDrive
      });
      const suggestion = new SuggestionPanel({ model: suggestionModel });
      this.addWidget(suggestion);
    }

    options.tracker.currentChanged.connect(async (_, changed) => {
      if (changed) {
        header.title.label = changed.context.localPath;
        this._annotationModel.context =
          options.tracker.currentWidget?.context || undefined;
        await changed.context.ready;

        suggestionModel?.switchContext({
          filePath: changed.context.localPath,
          jupytercadModel: changed.context?.model
        });
      } else {
        header.title.label = '-';
        this._annotationModel.context = undefined;
        suggestionModel?.switchContext({
          filePath: '',
          jupytercadModel: undefined
        });
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
    forkManager?: IForkManager;
    collaborativeDrive?: ICollaborativeDrive;
  }
  export interface IProps {
    filePath?: string;
    sharedModel?: JupyterCadDoc;
  }
}
