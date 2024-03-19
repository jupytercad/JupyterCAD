import { IJupyterCadDoc } from '@jupytercad/schema';
import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';

export class SuggestionPanel extends PanelWithToolbar {
  constructor(params: SuggestionPanel.IOptions) {
    super();
    this.title.label = 'Suggestions';
    const body = ReactWidget.create(
      <SuggestionPanel.SuggestionPanelReact sharedModel={params.sharedModel} />
    );
    this.addWidget(body);
    this.addClass('jpcad-sidebar-propertiespanel');
  }
}

export namespace SuggestionPanel {
  /**
   * Instantiation options for `ObjectProperties`.
   */
  export interface IOptions extends Panel.IOptions {
    sharedModel?: IJupyterCadDoc;
  }

  export function SuggestionPanelReact(props: {
    sharedModel?: IJupyterCadDoc;
  }): JSX.Element {
    const [currentForkId, setCurrentForkId] = React.useState('');

    const createBranch = React.useCallback(async () => {
      const sharedModel = props.sharedModel;
      console.log('imagher', sharedModel);
      if (sharedModel) {
        const forkId = await sharedModel.provider.fork();
        sharedModel.provider.connect(forkId);
        setCurrentForkId(forkId);
      }
    }, [props.sharedModel]);
    return (
      <div>
        <button
          onClick={createBranch}
          className="jp-Dialog-button jp-mod-accept jp-mod-styled"
        >
          {' '}
          Create branch
        </button>
        <p>{currentForkId}</p>
      </div>
    );
  }
}
