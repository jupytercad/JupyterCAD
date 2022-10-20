import { SidePanel } from '@jupyterlab/ui-components';

import { JupyterCadDoc } from '../model';
import { IControlPanelModel } from '../types';
import { ControlPanelHeader } from './header';
import { ObjectProperties } from './objectproperties';

export class RightPanelWidget extends SidePanel {
  constructor(options: RightPanelWidget.IOptions) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    this._model = options.model;
    const header = new ControlPanelHeader();
    this.header.addWidget(header);
    const properties = new ObjectProperties({
      controlPanelModel: this._model
    });

    this.addWidget(properties);
    this._model.documentChanged.connect((_, changed) => {
      if (changed) {
        header.title.label = changed.context.localPath;
      } else {
        header.title.label = '-';
      }
    });
  }

  dispose(): void {
    super.dispose();
  }
  private _model: IControlPanelModel;
}

export namespace RightPanelWidget {
  export interface IOptions {
    model: IControlPanelModel;
  }
  export interface IProps {
    filePath?: string;
    sharedModel?: JupyterCadDoc;
  }
}
