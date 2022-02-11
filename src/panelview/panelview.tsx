import * as React from 'react';

import { SidePanel } from '@jupyterlab/ui-components';
import { MessageLoop } from '@lumino/messaging';
import { Panel, Widget } from '@lumino/widgets';
import { ObjectTree } from './objecttree';
import { ObjectProperties } from './objectproperties';
import { JupyterCadDoc } from '../model';
import {
  IControlViewSharedState,
  IMainViewSharedState,
  ValueOf
} from '../types';
import { debounce } from '../tools';

interface IProps {
  filePath?: string;
  sharedModel?: JupyterCadDoc;
}

interface IStates {
  mainViewState: IMainViewSharedState;
  controlViewState: IControlViewSharedState;
}

export class SidePanelWidget extends SidePanel {
  constructor(children: Widget[]) {
    super();
    this.addClass('jpcad-sidepanel-widget');
    children.forEach(child => {
      console.log('adding', child);

      this.addWidget(child);
    });
  }
}

export default class PanelView extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.updateSharedState = debounce(
      (
        key: keyof IMainViewSharedState,
        value: ValueOf<IMainViewSharedState>
      ) => {
        if (this.props.sharedModel) {
          this.props.sharedModel.setMainViewState(key, value);
        }
      },
      100
    ) as any;
    this.state = {
      mainViewState: {},
      controlViewState: { key: '' }
    };
    this.onSharedModelPropChange(this.props.sharedModel);
  }

  componentWillUnmount(): void {
    if (this.props.sharedModel) {
      this.props.sharedModel.mainViewStateChanged.disconnect(
        this.sharedMainViewModelChanged
      );
    }
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
    }
  }

  sharedMainViewModelChanged = (_, changed: IMainViewSharedState): void => {
    this.setState(old => {
      const newState = {
        ...old,
        mainViewState: { ...old.mainViewState, ...changed }
      };
      return newState;
    });
  };

  updateLocalAndSharedState = (
    key: keyof IMainViewSharedState,
    value: ValueOf<IMainViewSharedState>
  ): void => {
    this.setState(old => ({
      ...old,
      controlViewState: {
        ...old.controlViewState,
        [key]: value
      },
      mainViewState: {
        ...old.mainViewState,
        [key]: value
      }
    }));
    this.updateSharedState(key, value);
  };

  onSliderChange = (key: 'x' | 'y' | 'z', value: string) => {
    const objects = [
      ...this.props.sharedModel!.getMainViewStateByKey('objects')
    ];
    objects[0]['parameters'][key] = Number(value);
    this.updateLocalAndSharedState('objects', objects);
  };

  render(): JSX.Element {
    return (
      <div className="jpcad-control-panel">
        <div className="jpcad-control-panel-title">
          <h2>{this.props.filePath}</h2>
        </div>
        <div style={{ height: 'calc(100% - 25px)' }} ref={this._divRef} />
        {/* <div>
          <div>
            <label htmlFor="">X</label>
            <input
              type="range"
              min={0}
              max={10}
              value={
                this.state.mainViewState.objects
                  ? this.state.mainViewState.objects[0].parameters['x']
                  : 0
              }
              onChange={e => this.onSliderChange('x', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="">Y</label>
            <input
              type="range"
              min={0}
              max={10}
              value={
                this.state.mainViewState.objects
                  ? this.state.mainViewState.objects[0].parameters['y']
                  : 0
              }
              onChange={e => this.onSliderChange('y', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="">Z</label>
            <input
              type="range"
              min={0}
              max={10}
              value={
                this.state.mainViewState.objects
                  ? this.state.mainViewState.objects[0].parameters['z']
                  : 0
              }
              onChange={e => this.onSliderChange('z', e.target.value)}
            />
          </div>
        </div> */}
      </div>
    );
  }

  private _divRef = React.createRef<HTMLDivElement>();
  updateSharedState: (
    key: keyof IMainViewSharedState,
    value: ValueOf<IMainViewSharedState>
  ) => void;
}
