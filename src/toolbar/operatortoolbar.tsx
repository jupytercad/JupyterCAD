import { Button } from '@jupyterlab/ui-components';

import * as React from 'react';

import { ToolbarModel } from './model';
import { IDict } from '../types';
import { FormDialog } from './formdialog';
import { IJCadObject } from '../_interface/jcad';
import { showErrorMessage } from '@jupyterlab/apputils';
interface IProps {
  toolbarModel: ToolbarModel;
}

export class OperatorToolbarReact extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this._updateSchema(props.toolbarModel.formSchema);
  }

  private _updateSchema(oldSchema: IDict): void {
    this._schema = JSON.parse(JSON.stringify(oldSchema));
    const allObjects = this.props.toolbarModel.allObject.map(o => o.name);
    Object.keys(this._schema).forEach(key => {
      const schema = this._schema[key];
      for (const prop in schema['properties']) {
        const fcType = schema['properties'][prop]['fcType'];
        if (fcType) {
          const propDef = schema['properties'][prop];
          switch (fcType) {
            case 'App::PropertyLink':
              propDef['enum'] = allObjects;
              break;
            case 'App::PropertyLinkList':
              propDef['items']['enum'] = allObjects;
              break;
            default:
          }
        }
      }
    });
    this._defaultData = {
      CUT: {
        title: 'Cut parameters',
        shape: 'Part::Cut',
        schema: this._schema['Part::Cut'],
        default: {
          Base: allObjects[0] ?? '',
          Tool: allObjects[0] ?? '',
          Refine: false,
          Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
        },
        syncData: (props: IDict) => {
          const { Name, ...parameters } = props;
          const objectModel: IJCadObject = {
            shape: 'Part::Cut',
            parameters,
            visible: true,
            name: Name
          };
          const model = this.props.toolbarModel.sharedModel;
          if (model) {
            model.transact(() => {
              model.updateObjectByName(parameters['Base'], 'visible', false);
              model.updateObjectByName(parameters['Tool'], 'visible', false);
              if (!model.objectExists(objectModel.name)) {
                model.addObject(objectModel);
              } else {
                showErrorMessage(
                  'The object already exists',
                  'There is an existing object with the same name.'
                );
              }
            });
          }
        }
      },
      FUSE: {
        title: 'Fuse parameters',
        shape: 'Part::MultiFuse',
        schema: this._schema['Part::MultiFuse'],
        default: {
          Shapes: ['', ''],
          Refine: false,
          Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
        },
        syncData: (props: IDict) => {
          const { Name, ...parameters } = props;
          const objectModel: IJCadObject = {
            shape: 'Part::MultiFuse',
            parameters,
            visible: true,
            name: Name
          };
          const model = this.props.toolbarModel.sharedModel;
          if (model) {
            model.transact(() => {
              if (!model.objectExists(objectModel.name)) {
                model.addObject(objectModel);
              } else {
                showErrorMessage(
                  'The object already exists',
                  'There is an existing object with the same name.'
                );
              }
            });
          }
        }
      },
      INTERSECTION: {
        title: 'Intersection parameters',
        shape: 'Part::MultiCommon',
        schema: this._schema['Part::MultiCommon'],
        default: {
          Shapes: ['', ''],
          Refine: false,
          Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
        },
        syncData: (props: IDict) => {
          const { Name, ...parameters } = props;
          const objectModel: IJCadObject = {
            shape: 'Part::MultiCommon',
            parameters,
            visible: true,
            name: Name
          };
          const model = this.props.toolbarModel.sharedModel;
          if (model) {
            model.transact(() => {
              if (!model.objectExists(objectModel.name)) {
                model.addObject(objectModel);
              } else {
                showErrorMessage(
                  'The object already exists',
                  'There is an existing object with the same name.'
                );
              }
            });
          }
        }
      }
    };
  }

  render(): React.ReactNode {
    return (
      <div style={{ paddingLeft: '10px', display: 'flex' }}>
        {Object.entries(this._defaultData).map(([key, value]) => (
          <Button
            key={key}
            className={'jp-Button jp-mod-minimal jp-ToolbarButtonComponent'}
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
        ))}
      </div>
    );
  }

  private _schema: IDict;
  private _defaultData: IDict;
}
