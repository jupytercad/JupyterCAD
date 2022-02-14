import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';

import { JupyterCadDoc } from '../model';
import { IJupyterCadTracker } from '../token';
import {
  IControlViewSharedState,
  IJcadObject,
  IMainViewSharedState
} from '../types';
import { ControlPanelModel } from './model';
import { ObjectPropertiesForm } from './formbuilder';
export class ObjectProperties extends PanelWithToolbar {
  constructor(params: ObjectProperties.IOptions) {
    super(params);
    this.title.label = 'Objects Properties';
    const body = new ObjectPropertiesWidget(params);
    this.addWidget(body);
    this.addClass('jpcad-sidebar-propertiespanel');
  }
}

export class ObjectPropertiesWidget extends ReactWidget {
  constructor(private params: ObjectProperties.IOptions) {
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
      <ObjectPropertiesReact
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
  selectedObjectData?: { [key: string]: any };
  selectedObject?: string;
}

interface IProps {
  filePath?: string;
  sharedModel?: JupyterCadDoc;
  controlPanelModel: ControlPanelModel;
}

class ObjectPropertiesReact extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.onSharedModelPropChange(this.props.sharedModel);
    this.props.controlPanelModel.stateChanged.connect((changed, value) => {
      const selected = value.newValue as string;
      if (selected && selected.includes('#')) {
        const [id, type] = selected.split('#');
        const objectData = this.state.mainViewState?.objects?.filter(
          obj => obj.id === id
        );
        if (objectData) {
          const selectedObjectData = objectData[0][type];
          this.setState(old => ({
            ...old,
            selectedObjectData,
            selectedObject: id
          }));
        }
      }
    });
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
        const selectedObjectDataList = newState.mainViewState.objects?.filter(
          obj => obj.id === newState.selectedObject
        );
        if (selectedObjectDataList && selectedObjectDataList[0]) {
          newState.selectedObjectData = selectedObjectDataList[0].parameters;
        }
        return newState;
      },
      () => console.log('new state', this.state)
    );
  };

  syncObjectProperties(
    objectId: string | undefined,
    properties: { [key: string]: any }
  ) {
    if (!this.props.sharedModel || !objectId) {
      return;
    }
    const objects = [
      ...this.props.sharedModel.getMainViewStateByKey('objects')
    ] as IJcadObject[];
    console.log('objects', objects);

    const currentObj = objects.filter(obj => obj.id === objectId);
    if (currentObj.length > 0) {
      currentObj[0].parameters = { ...currentObj[0].parameters, ...properties };
    }
    console.log('new object', objects);

    this.props.sharedModel.setMainViewState('objects', objects);
  }

  render(): React.ReactNode {
    console.log(
      '{this.state.selectedObjectData}',
      this.state.selectedObjectData
    );

    return (
      <div>
        <ObjectPropertiesForm
          sourceData={this.state.selectedObjectData}
          syncData={(properties: { [key: string]: any }) => {
            this.syncObjectProperties(this.state.selectedObject, properties);
          }}
        />
      </div>
    );
  }
}

export namespace ObjectProperties {
  /**
   * Instantiation options for `ObjectProperties`.
   */
  export interface IOptions extends Panel.IOptions {
    id?: string;
    tracker: IJupyterCadTracker;
    controlPanelModel: ControlPanelModel;
  }
}
