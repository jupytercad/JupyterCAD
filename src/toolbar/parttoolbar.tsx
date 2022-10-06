import * as React from 'react';
import { ToolbarModel } from './model';
import { Button } from '@jupyterlab/ui-components';
import { IDict } from '../types';
import { FormDialog } from './formdialog';
import * as Y from 'yjs';
interface IProps {
  toolbarModel: ToolbarModel;
}

export class PartToolbarReact extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  private _defaultData = {
    BOX: {
      title: 'Box parameters',
      shape: 'Part::Box',
      schema: this.props.toolbarModel.formSchema['Part::Box'],
      default: {
        Length: 1,
        Width: 1,
        Height: 1,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      }
    },
    CYLINDER: {
      title: 'Cylinder parameters',
      shape: 'Part::Cylinder',
      schema: this.props.toolbarModel.formSchema['Part::Cylinder'],
      default: {
        Radius: 1,
        Height: 1,
        Angle: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      }
    },
    SPHERE: {
      title: 'Sphere parameters',
      shape: 'Part::Sphere',
      schema: this.props.toolbarModel.formSchema['Part::Sphere'],
      default: {
        Radius: 5,
        Angle1: -90,
        Angle2: 90,
        Angle3: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      }
    },
    CONE: {
      title: 'Cone parameters',
      shape: 'Part::Cone',
      schema: this.props.toolbarModel.formSchema['Part::Cone'],
      default: {
        Radius1: 5,
        Radius2: 4,
        Height: 10,
        Angle: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      }
    }
  };

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
                syncData: (props: IDict) => {
                  const { Name, ...parameters } = props;
                  const objectModel = {
                    shape: value.shape,
                    parameters,
                    visible: true,
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
            {key}
          </Button>
        ))}
      </div>
    );
  }
}
