import { showErrorMessage } from '@jupyterlab/apputils';
import { Button } from '@jupyterlab/ui-components';
import * as React from 'react';

import { IDict } from '../types';
import { IJCadObject, Parts } from '../_interface/jcad';
import { FormDialog } from './formdialog';
import { ToolbarModel } from './model';

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
    },
    TORUS: {
      title: 'Torus parameters',
      shape: 'Part::Torus',
      schema: this.props.toolbarModel.formSchema['Part::Torus'],
      default: {
        Radius1: 10,
        Radius2: 2,
        Angle1: -180,
        Angle2: 180,
        Angle3: 360,
        Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
      }
    }
  };

  syncSelectedField = (
    id: string | null,
    value: any,
    parentType: 'panel' | 'dialog'
  ): void => {
    let property: string | null = null;
    if (id) {
      const prefix = id.split('_')[0];
      property = id.substring(prefix.length);
    }
    this.props.toolbarModel?.syncSelectedPropField(property, value, parentType);
  };
  render(): React.ReactNode {
    return (
      <div style={{ paddingLeft: '10px', display: 'flex' }}>
        {Object.entries(this._defaultData).map(([key, value]) => (
          <Button
            key={key}
            className={'jp-Button jp-mod-minimal jp-ToolbarButtonComponent'}
            style={{ color: 'var(--jp-ui-font-color1)' }}
            onClick={async () => {
              await this.props.toolbarModel.syncFormData(value);
              const dialog = new FormDialog({
                toolbarModel: this.props.toolbarModel,
                title: value.title,
                sourceData: value.default,
                schema: value.schema,
                syncData: (props: IDict) => {
                  const { Name, ...parameters } = props;
                  const objectModel: IJCadObject = {
                    shape: value.shape as Parts,
                    parameters,
                    visible: true,
                    name: Name
                  };
                  const model = this.props.toolbarModel.sharedModel;
                  if (model) {
                    if (!model.objectExists(objectModel.name)) {
                      model.addObject(objectModel);
                    } else {
                      showErrorMessage(
                        'The object already exists',
                        'There is an existing object with the same name.'
                      );
                    }
                  }
                },
                cancelButton: () => {
                  this.props.toolbarModel.syncFormData(undefined);
                },
                syncSelectedPropField: this.syncSelectedField
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
