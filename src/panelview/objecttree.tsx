import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import Tree from '@naisutech/react-tree';

import { JupyterCadDoc } from '../model';
import { IJupyterCadTracker } from '../token';
import { IControlViewSharedState, IMainViewSharedState } from '../types';
import { ControlPanelModel } from './model';

export class ObjectTree extends PanelWithToolbar {
  constructor(params: ObjectTree.IOptions) {
    super(params);
    this.title.label = 'Objects tree';
    this._body = new ObjectTreeWidget(params);
    this.addWidget(this._body);
    this.addClass('jpcad-sidebar-treepanel');
  }

  private _body: ObjectTreeWidget;
}

class ObjectTreeWidget extends ReactWidget {
  constructor(private params: ObjectTree.IOptions) {
    super();
    const tracker = params.tracker;
    this._filePath = tracker.currentWidget?.context.localPath;
    this._sharedModel = tracker.currentWidget?.context.model.sharedModel;
    tracker.currentChanged.connect((_, changed) => {
      if (changed) {
        this._filePath = changed.context.localPath;
        this._sharedModel = changed.context.model.sharedModel;
      } else {
        this._filePath = undefined;
        this._sharedModel = undefined;
      }
      this.update();
    });
  }

  render(): JSX.Element {
    return (
      <ObjectTreeReact
        filePath={this._filePath}
        sharedModel={this._sharedModel}
        controlPanelModel={this.params.controlPanelModel}
      />
    );
  }

  private _filePath: string | undefined;
  private _sharedModel: JupyterCadDoc | undefined;
}

interface IStates {
  controlViewState?: IControlViewSharedState;
  mainViewState?: IMainViewSharedState;
}

interface IProps {
  filePath?: string;
  sharedModel?: JupyterCadDoc;
  controlPanelModel: ControlPanelModel;
}
class ObjectTreeReact extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.onSharedModelPropChange(this.props.sharedModel);
  }

  componentDidUpdate(oldProps, oldState): void {
    if (oldProps.sharedModel === this.props.sharedModel) {
      return;
    }
    if (oldProps.sharedModel) {
      oldProps.sharedModel.changed.disconnect(this.sharedMainViewModelChanged);
    }
    this.onSharedModelPropChange(this.props.sharedModel);
  }

  onSharedModelPropChange(sharedModel?: JupyterCadDoc): void {
    if (sharedModel) {
      sharedModel.mainViewStateChanged.connect(this.sharedMainViewModelChanged);
      this.setState(
        old => {
          return {
            ...old,
            mainViewState: sharedModel.getMainViewState(),
            controlViewState: sharedModel.getControlViewState()
          };
        },
        () => console.log('new state', this.state)
      );
    }
  }

  sharedMainViewModelChanged = (_, changed: IMainViewSharedState): void => {
    this.setState(
      old => {
        const newState = {
          ...old,
          mainViewState: { ...old.mainViewState, ...changed }
        };
        return newState;
      },
      () => console.log('new state', this.state)
    );
  };

  stateToTree = () => {
    const nodes = (this.state.mainViewState?.objects ?? []).map(jcadObject => {
      return {
        id: jcadObject.id,
        label: `Object (#${jcadObject.id})`,
        parentId: null,
        items: [
          {
            id: `${jcadObject.id}#parameters`,
            label: 'Shape',
            parentId: jcadObject.id
          },
          {
            id: `${jcadObject.id}#operator`,
            label: 'Operators',
            parentId: jcadObject.id
          }
        ]
      };
    });

    return nodes;
  };

  render(): React.ReactNode {
    const data = this.stateToTree();
    return (
      <div className="jpcad-treeview-wrapper">
        <Tree
          nodes={data}
          theme="light"
          onSelect={id => {
            if (id && id.length > 0) {
              this.props.controlPanelModel.set('activatedObject', id[0]);
            }
          }}
        />
      </div>
    );
  }
}
export namespace ObjectTree {
  /**
   * Instantiation options for `ObjectTree`.
   */
  export interface IOptions extends Panel.IOptions {
    id?: string;
    tracker: IJupyterCadTracker;
    controlPanelModel: ControlPanelModel;
  }
}
