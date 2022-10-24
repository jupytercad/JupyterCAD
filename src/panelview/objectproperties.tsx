import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';
import { itemFromName } from '../tools';

import {
  IControlPanelModel,
  IDict,
  IJupyterCadDocChange,
  IJupyterCadModel
} from '../types';
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
  clientId: number | null;
}

interface IProps {
  cpModel: IControlPanelModel;
}

class ObjectPropertiesReact extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      filePath: this.props.cpModel.filePath,
      jcadObject: this.props.cpModel.jcadModel?.getAllObject(),
      clientId: null
    };
    this.props.cpModel.jcadModel?.sharedModelChanged.connect(
      this.sharedJcadModelChanged
    );
    this.props.cpModel.documentChanged.connect((_, changed) => {
      if (changed) {
        changed.context.model.sharedModelChanged.connect(
          this.sharedJcadModelChanged
        );
        changed.context.model.clientStateChanged.connect(
          this._onClientSharedStateChanged
        );
        this.setState(old => ({
          ...old,
          filePath: changed.context.localPath,
          jcadObject: this.props.cpModel.jcadModel?.getAllObject(),
          clientId: changed.context.model.getClientId()
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
  }

  sharedJcadModelChanged = (_, changed: IJupyterCadDocChange): void => {
    this.setState(old => {
      if (old.selectedObject) {
        const jcadObject = this.props.cpModel.jcadModel?.getAllObject();
        if (jcadObject) {
          const selectedObj = itemFromName(old.selectedObject, jcadObject);
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
    objectName: string | undefined,
    properties: { [key: string]: any }
  ) {
    if (!this.state.jcadObject || !objectName) {
      return;
    }

    const currentYMap =
      this.props.cpModel.jcadModel?.sharedModel.getObjectByName(objectName);
    if (currentYMap) {
      const newParams = {
        ...(currentYMap.get('parameters') as IDict),
        ...properties
      };
      currentYMap.set('parameters', newParams);
    }
  }

  private _onClientSharedStateChanged = (
    sender: IJupyterCadModel,
    clients: Map<number, any>
  ): void => {
    const targetId: number | null = null;
    const clientId = this.state.clientId;
    if (targetId) {
      //TODO Sync with remote user in the follow-mode
    } else {
      // Update from other components of current client
      const localState = clientId ? clients.get(clientId) : null;

      if (localState) {
        if (localState['selected']) {
          const selected = '' + localState['selected'].value;
          if (selected.length === 0) {
            this.setState(old => ({
              ...old,
              schema: undefined,
              selectedObjectData: undefined
            }));
            return;
          }

          const name = selected;
          const objectData = this.props.cpModel.jcadModel?.getAllObject();
          if (objectData) {
            let schema;
            const selectedObj = itemFromName(name, objectData);
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
              selectedObject: name,
              schema
            }));
          }
        }
      }
    }
  };

  render(): React.ReactNode {
    return this.state.schema && this.state.selectedObjectData ? (
      <ObjectPropertiesForm
        schema={this.state.schema}
        sourceData={this.state.selectedObjectData}
        syncData={(properties: { [key: string]: any }) => {
          this.syncObjectProperties(this.state.selectedObject, properties);
        }}
      />
    ) : (
      <div></div>
    );
  }
}

export namespace ObjectProperties {
  /**
   * Instantiation options for `ObjectProperties`.
   */
  export interface IOptions extends Panel.IOptions {
    controlPanelModel: IControlPanelModel;
  }
}
