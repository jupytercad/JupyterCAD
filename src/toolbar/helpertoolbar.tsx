import { Button } from '@jupyterlab/ui-components';

import * as React from 'react';

import { IDict } from '../types';
import { JupyterCadPanel } from '../widget';
import { FormDialog } from './formdialog';
import { ToolbarModel } from './model';

interface IProps {
  toolbarModel: ToolbarModel;
}

interface IState {
  Axes: IDict;
  ExplodedView: IDict;
}

const AXES_FORM_SCHEMA = {
  type: 'object',
  required: ['Size', 'Visible'],
  additionalProperties: false,
  properties: {
    Size: {
      type: 'number',
      description: 'Size of the axes'
    },
    Visible: {
      type: 'boolean',
      description: 'Whether the axes are visible or not'
    }
  }
};

const EXPLODED_VIEW_FORM_SCHEMA = {
  type: 'object',
  required: ['Enabled', 'Factor'],
  additionalProperties: false,
  properties: {
    Enabled: {
      type: 'boolean',
      description: 'Whether the exploded view is enabled or not'
    },
    Factor: {
      type: 'number',
      description: 'The exploded view factor'
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
    let axes = this._panel.axes;

    if (!axes) {
      axes = {
        size: 5,
        visible: false
      };
      this._panel.axes = axes;
    }

    let explodedView = this._panel.explodedView;
    if (!explodedView) {
      explodedView = {
        enabled: false,
        factor: 0.5
      };
      this._panel.explodedView = explodedView;
    }

    return {
      Axes: {
        title: 'Axes Helper',
        shape: 'Axe::Helper',
        schema: AXES_FORM_SCHEMA,
        default: {
          Size: axes?.size ?? 5,
          Visible: axes?.visible ?? true
        },
        syncData: (props: IDict) => {
          const { Size, Visible } = props;
          this._panel.axes = {
            size: Size,
            visible: Visible
          };
        }
      },
      ExplodedView: {
        title: 'Exploded View',
        shape: 'ExplodedView::Helper',
        schema: EXPLODED_VIEW_FORM_SCHEMA,
        default: {
          Enabled: explodedView?.enabled ?? false,
          Factor: explodedView?.factor ?? 0.5
        },
        syncData: (props: IDict) => {
          const { Enabled, Factor } = props;
          this._panel.explodedView = {
            enabled: Enabled,
            factor: Factor
          };
        }
      }
    };
  }

  private _updateSchema(): void {
    const axe = this._panel.axes;
    const explodedView = this._panel.explodedView;
    const { Axes, ExplodedView } = this.state;

    Axes['default'] = {
      Size: axe?.size ?? 5,
      Visible: axe?.visible ?? true
    };
    ExplodedView['default'] = {
      Enabled: explodedView?.enabled ?? false,
      Factor: explodedView?.factor ?? 0.5
    };

    this.setState({ Axes, ExplodedView });
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
              {key.toLocaleUpperCase()}
            </Button>
          );
        })}
      </div>
    );
  }
}
