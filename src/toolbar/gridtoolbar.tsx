import { Button } from '@jupyterlab/ui-components';

import * as React from 'react';

import { AxeHelper, GridHelper, IDict } from '../types';
import { JupyterCadPanel } from '../widget';
import { FormDialog } from './formdialog';
import { ToolbarModel } from './model';

interface IProps {
  toolbarModel: ToolbarModel;
}

interface IState {
  Grid: IDict;
  Axe: IDict;
}

export class HelpersToolbarReact extends React.Component<IProps, IState> {
  private _panel: JupyterCadPanel;

  constructor(props: IProps) {
    super(props);
    this._panel = this.props.toolbarModel.panel;
    this.state = this._createSchema();
  }

  componentDidMount(): void {
    this._panel.viewChanged.connect(this._updateSchema, this);
  }

  componentWillUnmount(): void {
    this._panel.viewChanged.disconnect(this._updateSchema, this);
  }

  private _createSchema(): IState {
    const grid: GridHelper = {
      size: 40,
      divisions: 40,
      visible: false
    };
    const axe: AxeHelper = {
      size: 5,
      visible: false
    };
    this._panel.setView('grid', grid);
    this._panel.setView('axe', axe);

    return {
      Grid: {
        title: 'Grid Helper',
        shape: 'Grid::Helper',
        schema: this.props.toolbarModel.formSchema['Grid::Helper'],
        default: {
          Name: 'Grid Helper',
          Size: grid?.size ?? 40,
          Divisions: grid?.divisions ?? 40,
          Visible: grid?.visible ?? true
        },
        syncData: (props: IDict) => {
          const { Size, Divisions, Visible } = props;
          const grid: GridHelper = {
            size: Size,
            divisions: Divisions,
            visible: Visible
          };
          this._panel.setView('grid', grid);
        }
      },
      Axe: {
        title: 'Axe Helper',
        shape: 'Axe::Helper',
        schema: this.props.toolbarModel.formSchema['Axe::Helper'],
        default: {
          Name: 'Axe Helper',
          Size: axe?.size ?? 5,
          Visible: axe?.visible ?? true
        },
        syncData: (props: IDict) => {
          const { Size, Visible } = props;
          const axe: AxeHelper = {
            size: Size,
            visible: Visible
          };
          this._panel.setView('axe', axe);
        }
      }
    };
  }

  private _updateSchema(): void {
    const grid = this._panel.getView('grid') as GridHelper | undefined;
    const axe = this._panel.getView('axe') as AxeHelper | undefined;

    const { Grid, Axe } = this.state;
    Grid['default'] = {
      Name: 'Grid Helper',
      Size: grid?.size ?? 40,
      Divisions: grid?.divisions ?? 40,
      Visible: grid?.visible ?? true
    };

    Axe['default'] = {
      Name: 'Axe Helper',
      Size: axe?.size ?? 5,
      Visible: axe?.visible ?? true
    };

    this.setState({ Grid, Axe });
  }

  render(): React.ReactNode {
    return (
      <div style={{ paddingLeft: '10px', display: 'flex' }}>
        {Object.entries(this.state).map(([key, value]) => {
          return (
            <Button
              className={'jp-ToolbarButtonComponent'}
              style={{ color: 'var(--jp-ui-font-color1)' }}
              onClick={async () => {
                const dialog = new FormDialog({
                  toolbarModel: this.props.toolbarModel,
                  title: value.title,
                  sourceData: value.default,
                  schema: value.schema,
                  syncData: value.syncData,
                  cancelButton: true
                });
                await dialog.launch();
              }}
            >
              {key}
            </Button>
          );
        })}
      </div>
    );
  }
}
