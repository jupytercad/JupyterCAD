import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import Tree, { Leaf } from '@naisutech/react-tree';

import { IControlPanelModel, IDict, IJupyterCadDocChange } from '../types';
import { IJCadModel } from '../_interface/jcad';

export class ObjectTree extends PanelWithToolbar {
  constructor(params: ObjectTree.IOptions) {
    super(params);
    this.title.label = 'Objects tree';
    const body = ReactWidget.create(
      <ObjectTreeReact cpModel={params.controlPanelModel} />
    );
    this.addWidget(body);
    this.addClass('jpcad-sidebar-treepanel');
  }
}

interface IStates {
  jcadOption?: IDict;
  filePath?: string;
  jcadObject?: IJCadModel;
}

interface IProps {
  // filePath?: string;
  // jcadModel?: JupyterCadModel;
  cpModel: IControlPanelModel;
}
class ObjectTreeReact extends React.Component<IProps, IStates> {
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
        this.props.cpModel.disconnect(this.sharedJcadModelChanged);
        changed.context.model.sharedModelChanged.connect(
          this.sharedJcadModelChanged
        );
        this.setState(old => ({
          ...old,
          filePath: changed.context.localPath,
          jcadObject: this.props.cpModel.jcadModel?.getAllObject()
        }));
      }
    });
  }

  sharedJcadModelChanged = (_, changed: IJupyterCadDocChange): void => {
    this.setState(old => ({
      ...old,
      jcadObject: this.props.cpModel.jcadModel?.getAllObject()
    }));
  };

  stateToTree = () => {
    if (this.state.jcadObject) {
      return this.state.jcadObject.map(obj => {
        console.log('obj', obj);
        const id = obj.id;
        const items: Leaf[] = [];
        if (obj.shape) {
          items.push({
            id: `${id}#shape#${obj.shape}`,
            label: 'Shape',
            parentId: id
          });
        }
        if (obj.operators) {
          items.push({
            id: `${id}#operator`,
            label: 'Operators',
            parentId: id
          });
        }
        return {
          id: id,
          label: `Object (#${id})`,
          parentId: null,
          items
        };
      });
    }
    // const nodes = (this.state.mainViewState?.objects ?? []).map(jcadObject => {

    // });

    return [];
  };

  render(): React.ReactNode {
    const data = this.stateToTree();

    return (
      <div className="jpcad-treeview-wrapper">
        <Tree
          nodes={data}
          theme="light"
          onSelect={id => {
            if (id && id.length > 0) {
              this.props.cpModel.set('activatedObject', id[0]);
            }
          }}
        />
      </div>
    );
  }
}
export namespace ObjectTree {
  /**
   * Instantiation options for `ObjectTree`.
   */
  export interface IOptions extends Panel.IOptions {
    id?: string;
    controlPanelModel: IControlPanelModel;
  }
}
