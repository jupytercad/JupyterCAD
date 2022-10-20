import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar, Button } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import { ReactTree, TreeNodeList, useReactTreeApi, ThemeSettings } from '@naisutech/react-tree';

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
  selectedNode: string | null;
}

interface IProps {
  // filePath?: string;
  // jcadModel?: JupyterCadModel;
  cpModel: IControlPanelModel;
}

class ObjectTreeReact extends React.Component<IProps, IStates> {
  ref: any;

  constructor(props: IProps) {
    super(props);

    console.log('useReactTreeApi');
    this.ref = useReactTreeApi();
    console.log('useReactTreeApi done');

    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';

    this.state = {
      filePath: this.props.cpModel.filePath,
      jcadObject: this.props.cpModel.jcadModel?.getAllObject(),
      lightTheme,
      selectedNode: null
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

  componentDidMount(): void {
    console.log(this.ref);
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

    const awareness = this.props.cpModel.jcadModel?.sharedModel.awareness;
    awareness?.on('change', () => {
      const localState = awareness.getLocalState();

      if (localState) {
        this.setState(old => ({
          ...old,
          selectedNode: localState['selected']
        }));
      }
    });
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

    const themes: ThemeSettings = {
      "labTheme": {
        "text": {
          // @ts-ignore this property does not know CSS variables
          "fontSize": "var(--jp-ui-font-size1)",
          "fontFamily": "var(--jp-ui-font-family)",
          "color": "var(--jp-ui-font-color1)",
          "selectedColor": "var(--jp-ui-inverse-font-color1)",
          "hoverColor": "var(--jp-ui-font-color2)"
        },
        "nodes": {
          // "height": "3.5rem",
          "folder": {
            "bgColor": "var(--jp-layout-color1)",
            "selectedBgColor": "var(--jp-layout-color2)",
            "hoverBgColor": "var(--jp-layout-color2)"
          },
          "leaf": {
            "bgColor": "var(--jp-layout-color1)",
            "selectedBgColor": "var(--jp-layout-color2)",
            "hoverBgColor": "var(--jp-layout-color2)"
          },
          "separator": {
            // "border": "3px solid",
            // "borderColor": "transparent"
          },
          "icons": {
            // @ts-ignore this property does not know CSS variables
            "size": "var(--jp-ui-font-size1)",
            "folderColor": "var(--jp-brand-color2)",
            "leafColor": "var(--jp-brand-color2)"
          }
        }
      }
    };

    return (
      <div className="jpcad-treeview-wrapper">
        <ReactTree
          ref={this.ref}
          selectedNodes={this.state.selectedNode === null ? [] : [this.state.selectedNode]}
          messages={{noData: 'No data' }}
          nodes={data}
          theme={'labTheme'}
          themes={themes}
          onToggleSelectedNodes={id => {
            if (id && id.length > 0) {
              let name = (id[0] as string);
              if (name.includes('#')) {
                name = name.split('#')[0];
              }
              this.props.cpModel.jcadModel?.syncSelectedObject(name);
            } else {
              this.props.cpModel.jcadModel?.syncSelectedObject(null);
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>{options.node.label}</span>
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
                    this.props.cpModel.jcadModel?.syncSelectedObject(null);
                  }}
                  minimal
                >
                  <span className="jp-ToolbarButtonComponent-label">
                    Delete
                  </span>
                </Button>
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
