import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';

import {
  IControlPanelModel,
  IDict,
  IJcadModel,
  IJcadObject,
  IJupyterCadDocChange
} from '../types';
import { ObjectPropertiesForm } from './formbuilder';

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
  jcadObject?: IJcadModel;
  selectedObjectData?: IDict;
  selectedObject?: string;
}

interface IProps {
  cpModel: IControlPanelModel;
}

class ObjectPropertiesReact extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.props.cpModel.jcadModel?.sharedModelChanged.connect(
      this.sharedJcadModelChanged
    );
    this.props.cpModel.documentChanged.connect((_, changed) => {
      if (changed) {
        // this.props.cpModel.disconnect(this.sharedJcadModelChanged);
        // changed.context.model.sharedModelChanged.connect(
        //   this.sharedJcadModelChanged
        // );
        // this.setState(old => ({
        //   ...old,
        //   filePath: changed.context.localPath,
        //   jcadObject: this.props.cpModel.jcadModel?.getAllObject()
        // }));
      }
    });
    this.props.cpModel.stateChanged.connect((changed, value) => {
      const selected = value.newValue as string;
      if (selected && selected.includes('#')) {
        const [id, type] = selected.split('#');
        const objectData = this.state.jcadObject;
        if (objectData) {
          const selectedObjectData = objectData[id][type];
          this.setState(old => ({
            ...old,
            selectedObjectData,
            selectedObject: id
          }));
        }
      }
    });
  }

  sharedJcadModelChanged = (_, changed: IJupyterCadDocChange): void => {
    this.setState(old => ({
      ...old,
      jcadObject: this.props.cpModel.jcadModel?.getAllObject()
    }));
  };

  syncObjectProperties(
    objectId: string | undefined,
    properties: { [key: string]: any }
  ) {
    if (!this.state.jcadObject || !objectId) {
      return;
    }

    const currentYMap =
      this.props.cpModel.jcadModel?.sharedModel.getObject(objectId);
    if (currentYMap) {
      const newParams = {
        ...(currentYMap.getProperty('parameters') as IDict),
        ...properties
      };
      currentYMap?.setProperty('parameters', newParams);
    }
  }

  render(): React.ReactNode {
    return (
      <div>
        <ObjectPropertiesForm
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
