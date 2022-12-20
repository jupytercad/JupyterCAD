import { SidePanel } from '@jupyterlab/ui-components';

import { JupyterCadDoc } from '../model';
import { IControlPanelModel, IAnnotationModel } from '../types';
import { ControlPanelHeader } from './header';
import { ObjectTree } from './objecttree';
import { Annotations } from './annotations';
import { IJupyterCadTracker } from '../token';

export class LeftPanelWidget extends SidePanel {
  constructor(options: LeftPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this._model = options.model;
    this._annotationModel = options.annotationModel;
    const header = new ControlPanelHeader();
    this.header.addWidget(header);

    const tree = new ObjectTree({ controlPanelModel: this._model });
    this.addWidget(tree);

    const annotations = new Annotations({ model: this._annotationModel });
    this.addWidget(annotations);

    options.tracker.currentChanged.connect((_, changed) => {
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

export namespace LeftPanelWidget {
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
