import * as React from 'react';
import { IDict, IJupyterCadClientState, IJupyterCadModel } from '../types';
import { FormDialog } from './formdialog';
import { ToolbarModel } from './model';
import { OperatorToolbarReact } from './operatortoolbar';
import { PartToolbarReact } from './parttoolbar';
import { SketcherToolbarReact } from './sketchertoolbar';
import { UserToolbarReact } from './usertoolbar';
import { HelpersToolbarReact } from './helpertoolbar';

interface IProps {
  toolbarModel: ToolbarModel;
}

interface IState {
  selected: 'PART' | 'OPERATOR' | 'DISPLAY' | 'SKETCHER';
}
export class ToolbarReact extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { selected: 'PART' };
    this.props.toolbarModel.jcadModel?.clientStateChanged.connect(
      this._onClientSharedStateChanged
    );
  }
  async componentDidMount(): Promise<void> {
    await this.props.toolbarModel.ready();
  }

  private _onClientSharedStateChanged = async (
    sender: IJupyterCadModel,
    clients: Map<number, IJupyterCadClientState>
  ): Promise<void> => {
    const remoteUser =
      this.props.toolbarModel.jcadModel?.localState?.remoteUser;
    let newState: IJupyterCadClientState | undefined;
    if (remoteUser) {
      newState = clients.get(remoteUser);

      if (newState) {
        if (newState.toolbarForm) {
          if (newState.toolbarForm.title !== this._lastForm?.title) {
            const dialog = new FormDialog({
              toolbarModel: this.props.toolbarModel,
              title: newState.toolbarForm.title,
              sourceData: newState.toolbarForm.default,
              schema: newState.toolbarForm.schema,
              syncData: (props: IDict) => {
                /** no-op */
              },
              cancelButton: true
            });
            this._lastForm = { title: newState.toolbarForm.title, dialog };
            await dialog.launch();
          }
        } else {
          if (this._lastForm) {
            this._lastForm.dialog.close();
            this._lastForm = undefined;
          }
        }
      }
    }
  };

  render(): React.ReactNode {
    return (
      <div className="jpcad-toolbar-react-widget">
        <div className="jp-HTMLSelect jp-DefaultStyle jp-Notebook-toolbarCellTypeDropdown">
          <select
            onChange={e =>
              this.setState(old => ({
                ...old,
                selected: e.target.value as any
              }))
            }
          >
            {this._toolbarOption.map(value => (
              <option value={value}>{value}</option>
            ))}
          </select>
          <span>
            <svg
              style={{
                height: 'auto',
                position: 'absolute',
                left: '90px',
                top: '5px',
                width: '16px'
              }}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              viewBox="0 0 18 18"
              data-icon="ui-components:caret-down-empty"
            >
              <g
                xmlns="http://www.w3.org/2000/svg"
                className="jp-icon3"
                fill="#616161"
                shape-rendering="geometricPrecision"
              >
                <path d="M5.2,5.9L9,9.7l3.8-3.8l1.2,1.2l-4.9,5l-4.9-5L5.2,5.9z"></path>
              </g>
            </svg>
          </span>
        </div>
        {this.state.selected === 'PART' && (
          <PartToolbarReact toolbarModel={this.props.toolbarModel} />
        )}
        {this.state.selected === 'OPERATOR' && (
          <OperatorToolbarReact toolbarModel={this.props.toolbarModel} />
        )}
        {this.state.selected === 'DISPLAY' && (
          <HelpersToolbarReact toolbarModel={this.props.toolbarModel} />
        )}
        {this.state.selected === 'SKETCHER' && (
          <SketcherToolbarReact toolbarModel={this.props.toolbarModel} />
        )}
        <UserToolbarReact toolbarModel={this.props.toolbarModel} />
      </div>
    );
  }

  private _lastForm?: { dialog: FormDialog; title: string };
  private _toolbarOption = ['PART', 'OPERATOR', 'DISPLAY', 'SKETCHER'];
}
