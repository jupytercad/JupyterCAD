import * as React from 'react';
import { ToolbarModel } from './model';
import { Button } from '@jupyterlab/ui-components';
import { IDict } from '../types';
import formSchema from '../_interface/forms.json';
import { IBox } from '../_interface/box';
import { ICylinder } from '../_interface/cylinder';
import { FormDialog } from './formdialog';
import * as Y from 'yjs';
interface IProps {
  toolbarModel: ToolbarModel;
}

interface IState {
  id: string;
}
export class PartToolbarReact extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { id: '' };
    this.prepareSchema();
  }
  private _formSchema = JSON.parse(JSON.stringify(formSchema));
  private _defaultData: Map<keyof typeof formSchema, IBox | ICylinder> =
    new Map([
      [
        'Part::Box',
        {
          Length: 1,
          Width: 1,
          Height: 1,
          Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
        }
      ]
    ]);
  prepareSchema(): void {
    Object.keys(this._formSchema).forEach(key => {
      if (key === 'Placement of the box') {
        return;
      }
      const value = this._formSchema[key];
      value['required'] = ['Name', ...value['required']];
      value['properties'] = {
        Name: { type: 'string', description: 'The name of object' },
        ...value['properties']
      };
    });
  }
  render(): React.ReactNode {
    return (
      <div style={{ paddingLeft: '10px' }}>
        <Button
          className={'jp-ToolbarButtonComponent'}
          onClick={async () => {
            const dialog = new FormDialog({
              title: 'Box paramenters',
              sourceData: this._defaultData.get('Part::Box')!,
              schema: this._formSchema['Part::Box'],
              syncData: (props: IDict) => {
                const { Name, ...parameters } = props;
                const objectModel = {
                  shape: 'Part::Box',
                  parameters,
                  visible: true,
                  id: 6789,
                  name: Name
                };
                const model = this.props.toolbarModel.sharedModel;
                if (model) {
                  const object = new Y.Map<any>(Object.entries(objectModel));
                  model.addObject(object);
                }
              },
              cancelButton: true
            });
            await dialog.launch();
          }}
        >
          BOX
        </Button>
      </div>
    );
  }
}
