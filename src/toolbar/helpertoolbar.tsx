import { Button } from '@jupyterlab/ui-components';

import * as React from 'react';

import { AxeHelper, IDict } from '../types';
import { JupyterCadPanel } from '../widget';
import { FormDialog } from './formdialog';
import { ToolbarModel } from './model';

interface IProps {
  toolbarModel: ToolbarModel;
}

interface IState {
  Axe: IDict;
}

const FORM_SCHEMA = {
  type: 'object',
  required: ['Size', 'Visible'],
  additionalProperties: false,
  properties: {
    Size: {
      type: 'number',
      description: "Axe's size"
    },
    Visible: {
      type: 'boolean',
      description: 'Whether the axes are visible or not'
    }
  }
};

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
    const axe: AxeHelper = {
      size: 5,
      visible: false
    };
    this._panel.setView('axe', axe);

    return {
      Axe: {
        title: 'Axe Helper',
        shape: 'Axe::Helper',
        schema: FORM_SCHEMA,
        default: {
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
    const axe = this._panel.getView('axe') as AxeHelper | undefined;
    const { Axe } = this.state;
    Axe['default'] = {
      Size: axe?.size ?? 5,
      Visible: axe?.visible ?? true
    };

    this.setState({ Axe });
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
