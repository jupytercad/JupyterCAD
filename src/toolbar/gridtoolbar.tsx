import { Button } from '@jupyterlab/ui-components';

import * as React from 'react';

import { AxeHelper, GridHelper, IDict, IJupyterCadModel } from '../types';
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
  private _model: IJupyterCadModel;

  constructor(props: IProps) {
    super(props);
    this._model = this.props.toolbarModel.jcadModel!;
		this.state = this._createSchema();
  }

  componentDidMount(): void {
    this._model.viewChanged.connect(this._updateSchema, this);
  }

  componentWillUnmount(): void {
    this._model.viewChanged.disconnect(this._updateSchema, this);
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
		this._model.setView('grid', grid);
		this._model.setView('axe', axe);
		
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
					this._model.setView('grid', grid);
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
					this._model.setView('axe', axe);
				}
			}
    };
  }

  private _updateSchema(): void {
    const grid = this._model.getView('grid') as GridHelper | undefined;
		const axe = this._model.getView('axe') as AxeHelper | undefined;
    
		const { Grid, Axe } = this.state;
		Grid["default"] = {
			Name: 'Grid Helper',
			Size: grid?.size ?? 40,
			Divisions: grid?.divisions ?? 40,
			Visible: grid?.visible ?? true
		};

		Axe["default"] = {
			Name: 'Axe Helper',
			Size: axe?.size ?? 5,
			Visible: axe?.visible ?? true
		};

		this.setState({ Grid, Axe });
  }

  render(): React.ReactNode {
    return (
      <div style={{ paddingLeft: '10px', display: 'flex' }}>
				{ Object.entries(this.state).map(([key, value]) => {
					return <Button
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
				})}
      </div>
    );
  }
}
