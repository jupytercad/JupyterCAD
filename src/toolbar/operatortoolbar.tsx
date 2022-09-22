import * as React from 'react';
import { ToolbarModel } from './model';
import { Button } from '@jupyterlab/ui-components';
import { IDict } from '../types';
import { FormDialog } from './formdialog';
import * as Y from 'yjs';
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
          const objectModel = {
            shape: 'Part::Cut',
            parameters,
            visible: true,
            name: Name
          };
          const model = this.props.toolbarModel.sharedModel;
          if (model) {
            const object = new Y.Map<any>(Object.entries(objectModel));
            model.addObject(object);
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
            className={'jp-ToolbarButtonComponent'}
            style={{ color: 'var(--jp-ui-font-color1)' }}
            onClick={async () => {
              const dialog = new FormDialog({
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
