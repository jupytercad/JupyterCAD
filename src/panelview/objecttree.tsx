import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar, Button } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import { ReactTree, TreeNodeList } from '@naisutech/react-tree';

import { IControlPanelModel, IDict, IJupyterCadDocChange } from '../types';
import { IJCadModel, IJCadObject } from '../_interface/jcad';

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
  lightTheme: boolean;
}

interface IProps {
  // filePath?: string;
  // jcadModel?: JupyterCadModel;
  cpModel: IControlPanelModel;
}

class ObjectTreeReact extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);

    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';

    this.state = {
      filePath: this.props.cpModel.filePath,
      jcadObject: this.props.cpModel.jcadModel?.getAllObject(),
      lightTheme
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
        changed.context.model.themeChanged.connect((_, arg) => {
          this.handleThemeChange();
        });
        this.setState(old => ({
          ...old,
          filePath: changed.context.localPath,
          jcadObject: this.props.cpModel.jcadModel?.getAllObject()
        }));
      } else {
        this.setState({
          filePath: undefined,
          jcadObject: undefined,
          jcadOption: undefined
        });
      }
    });
  }

  handleThemeChange = (): void => {
    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';
    this.setState(old => ({ ...old, lightTheme }));
  };

  sharedJcadModelChanged = (_, changed: IJupyterCadDocChange): void => {
    this.setState(old => ({
      ...old,
      jcadObject: this.props.cpModel.jcadModel?.getAllObject()
    }));
  };

  stateToTree = () => {
    if (this.state.jcadObject) {
      return this.state.jcadObject.map(obj => {
        const name = obj.name;
        const items: TreeNodeList = [];
        if (obj.shape) {
          items.push({
            id: `${name}#shape#${obj.shape}#${this.state.filePath}`,
            label: 'Shape',
            parentId: name
          });
        }
        if (obj.operators) {
          items.push({
            id: `${name}#operator#${this.state.filePath}`,
            label: 'Operators',
            parentId: name
          });
        }
        return {
          id: name,
          label: obj.name ?? `Object (#${name})`,
          parentId: null,
          items
        };
      });
    }
    // const nodes = (this.state.mainViewState?.objects ?? []).map(jcadObject => {

    // });

    return [];
  };

  getObjectFromName(name: string | null): IJCadObject | undefined {
    if (name && this.state.jcadObject) {
      const obj = this.state.jcadObject.filter(o => o.name === name);
      if (obj.length > 0) {
        return obj[0];
      }
    }
  }

  render(): React.ReactNode {
    const data = this.stateToTree();
    return (
      <div className="jpcad-treeview-wrapper">
        <ReactTree
          nodes={data}
          theme={this.state.lightTheme ? 'light' : 'dark'}
          onToggleSelectedNodes={id => {
            if (id && id.length > 0) {
              this.props.cpModel.set('activatedObject', id[0]);
            }
          }}
          RenderNode={(options) => {
            const jcadObj = this.getObjectFromName(
              options.node.parentId as string
            );
            let visible = false;
            if (jcadObj) {
              visible = jcadObj.visible;
            }
            return (
              <div
                className={`jpcad-control-panel-tree ${
                  options.selected ? 'selected' : ''
                }`}
              >
                <div
                  style={{
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minWidth: 0
                  }}
                >
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflowX: 'hidden'
                    }}
                  >
                    {options.node.label}
                  </span>
                  <div style={{ display: 'flex' }}>
                    <Button
                      className={'jp-ToolbarButtonComponent'}
                      onClick={() => {
                        const objectId = options.node.parentId as string;
                        const currentYMap =
                          this.props.cpModel.jcadModel?.sharedModel.getObjectByName(
                            objectId
                          );
                        if (currentYMap) {
                          currentYMap.set('visible', !visible);
                        }
                      }}
                      minimal
                    >
                      <span className="jp-ToolbarButtonComponent-label">
                        {visible ? 'Hide' : 'Show'}
                      </span>
                    </Button>
                    <Button
                      className={'jp-ToolbarButtonComponent'}
                      onClick={() => {
                        const objectId = options.node.parentId as string;
                        this.props.cpModel.jcadModel?.sharedModel.removeObjectByName(
                          objectId
                        );
                        this.props.cpModel.set('activatedObject', '');
                      }}
                      minimal
                    >
                      <span className="jp-ToolbarButtonComponent-label">
                        Delete
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            );
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
    controlPanelModel: IControlPanelModel;
  }
}
