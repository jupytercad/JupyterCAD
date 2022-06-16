import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';
import { itemFromId } from '../tools';

import { IControlPanelModel, IDict, IJupyterCadDocChange } from '../types';
import { IJCadModel } from '../_interface/jcad';
import { ObjectPropertiesForm } from './formbuilder';
import formSchema from '../_interface/forms.json';
export class ObjectProperties extends PanelWithToolbar {
  constructor(params: ObjectProperties.IOptions) {
    super(params);
    this.title.label = 'Objects Properties';
    const body = ReactWidget.create(
      <ObjectPropertiesReact cpModel={params.controlPanelModel} />
    );
    this.addWidget(body);
    this.addClass('jpcad-sidebar-propertiespanel');
  }
}

interface IStates {
  jcadOption?: IDict;
  filePath?: string;
  jcadObject?: IJCadModel;
  selectedObjectData?: IDict;
  selectedObject?: string;
  schema?: IDict;
}

interface IProps {
  cpModel: IControlPanelModel;
}

class ObjectPropertiesReact extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      filePath: this.props.cpModel.filePath,
      jcadObject: this.props.cpModel.jcadModel?.getAllObject()
    };
    this.props.cpModel.jcadModel?.sharedModelChanged.connect(
      this.sharedJcadModelChanged
    );
    this.props.cpModel.documentChanged.connect((_, changed) => {
      if (changed) {
        changed.context.model.sharedModelChanged.connect(
          this.sharedJcadModelChanged
        );
        this.setState(old => ({
          ...old,
          filePath: changed.context.localPath,
          jcadObject: this.props.cpModel.jcadModel?.getAllObject()
        }));
      } else {
        this.setState({
          jcadOption: undefined,
          filePath: undefined,
          jcadObject: undefined,
          selectedObjectData: undefined,
          selectedObject: undefined,
          schema: undefined
        });
      }
    });
    this.props.cpModel.stateChanged.connect((changed, value) => {
      const selected = value.newValue as string;
      if (selected && selected.includes('#')) {
        const id = selected.split('#')[0];
        const objectData = this.state.jcadObject;
        if (objectData) {
          let schema;
          const selectedObj = itemFromId(id, objectData);
          if (!selectedObj) {
            return;
          }

          if (selectedObj.shape) {
            schema = formSchema[selectedObj.shape];
          }
          const selectedObjectData = selectedObj['parameters'];
          this.setState(old => ({
            ...old,
            selectedObjectData,
            selectedObject: id,
            schema
          }));
        }
      }
    });
  }

  sharedJcadModelChanged = (_, changed: IJupyterCadDocChange): void => {
    this.setState(old => {
      if (old.selectedObject) {
        const jcadObject = this.props.cpModel.jcadModel?.getAllObject();
        if (jcadObject) {
          const selectedObj = itemFromId(old.selectedObject, jcadObject);
          if (!selectedObj) {
            return old;
          }
          const selectedObjectData = selectedObj['parameters'];
          return {
            ...old,
            jcadObject: jcadObject,
            selectedObjectData
          };
        } else {
          return old;
        }
      } else {
        return {
          ...old,
          jcadObject: this.props.cpModel.jcadModel?.getAllObject()
        };
      }
    });
  };

  syncObjectProperties(
    objectId: string | undefined,
    properties: { [key: string]: any }
  ) {
    if (!this.state.jcadObject || !objectId) {
      return;
    }

    const currentYMap =
      this.props.cpModel.jcadModel?.sharedModel.getObjectById(objectId);
    if (currentYMap) {
      const newParams = {
        ...(currentYMap.get('parameters') as IDict),
        ...properties
      };
      currentYMap?.set('parameters', newParams);
    }
  }

  render(): React.ReactNode {
    return (
      <div>
        <ObjectPropertiesForm
          schema={this.state.schema}
          sourceData={this.state.selectedObjectData}
          syncData={(properties: { [key: string]: any }) => {
            this.syncObjectProperties(this.state.selectedObject, properties);
          }}
        />
      </div>
    );
  }
}

export namespace ObjectProperties {
  /**
   * Instantiation options for `ObjectProperties`.
   */
  export interface IOptions extends Panel.IOptions {
    id?: string;
    controlPanelModel: IControlPanelModel;
  }
}
