import { Button } from '@jupyterlab/ui-components';

import * as React from 'react';

import { GridHelper, IDict, IJupyterCadModel } from '../types';
import { FormDialog } from './formdialog';
import { ToolbarModel } from './model';

interface IProps {
  toolbarModel: ToolbarModel;
}

export class HelpersToolbarReact extends React.Component<IProps> {
  private _schema: IDict;
  private _model: IJupyterCadModel;

  constructor(props: IProps) {
    super(props);
    this._model = this.props.toolbarModel.jcadModel!;
  }

  async componentDidMount(): Promise<void> {
    this._updateGrid();
    this._model.viewChanged.connect(this._updateGrid, this);
  }

  async componentWillUnmount(): Promise<void> {
    this._model.viewChanged.disconnect(this._updateGrid, this);
  }

  private _updateGrid(): void {
    const grid = this._model.getView('grid') as GridHelper | undefined;
    this._schema = {
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
        this._model.setView('grid', grid);
      }
    };
  }

  render(): React.ReactNode {
    return (
      <div style={{ paddingLeft: '10px', display: 'flex' }}>
        <Button
          className={'jp-ToolbarButtonComponent'}
          style={{ color: 'var(--jp-ui-font-color1)' }}
          onClick={async () => {
            const dialog = new FormDialog({
              toolbarModel: this.props.toolbarModel,
              title: this._schema.title,
              sourceData: this._schema.default,
              schema: this._schema.schema,
              syncData: this._schema.syncData,
              cancelButton: true
            });
            await dialog.launch();
          }}
        >
          Grid
        </Button>
      </div>
    );
  }
}
