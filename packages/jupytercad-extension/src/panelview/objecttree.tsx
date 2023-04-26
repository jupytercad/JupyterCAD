import * as React from 'react';
import { JSONObject } from '@lumino/coreutils';

import { ReactWidget } from '@jupyterlab/apputils';
import {
  LabIcon,
  PanelWithToolbar,
  ToolbarButtonComponent,
  closeIcon
} from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import { ReactTree, ThemeSettings, TreeNodeList } from '@naisutech/react-tree';

import visibilitySvg from '../../style/icon/visibility.svg';
import visibilityOffSvg from '../../style/icon/visibilityOff.svg';
import { IJCadModel, IJCadObject } from '../_interface/jcad';
import {
  IControlPanelModel,
  IDict,
  IJcadObjectDocChange,
  IJupyterCadClientState,
  IJupyterCadDoc,
  IJupyterCadModel
} from '../types';
import { v4 as uuid } from 'uuid';

const visibilityIcon = new LabIcon({
  name: 'jupytercad:visibilityIcon',
  svgstr: visibilitySvg
});
const visibilityOffIcon = new LabIcon({
  name: 'jupytercad:visibilityOffIcon',
  svgstr: visibilityOffSvg
});

const TREE_THEMES: ThemeSettings = {
  labTheme: {
    text: {
      fontSize: '14px',
      fontFamily: 'var(--jp-ui-font-family)',
      color: 'var(--jp-ui-font-color1)',
      selectedColor: 'var(--jp-ui-inverse-font-color1)',
      hoverColor: 'var(--jp-ui-font-color2)'
    },
    nodes: {
      folder: {
        bgColor: 'var(--jp-layout-color1)',
        selectedBgColor: 'var(--jp-layout-color2)',
        hoverBgColor: 'var(--jp-layout-color2)'
      },
      leaf: {
        bgColor: 'var(--jp-layout-color1)',
        selectedBgColor: 'var(--jp-layout-color2)',
        hoverBgColor: 'var(--jp-layout-color2)'
      },
      icons: {
        size: '9px',
        folderColor: 'var(--jp-inverse-layout-color3)',
        leafColor: 'var(--jp-inverse-layout-color3)'
      }
    }
  }
};

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
  options?: JSONObject;
  lightTheme: boolean;
  selectedNode: string | null;
  clientId: number | null; // ID of the yjs client
  id: string; // ID of the component, it is used to identify which component
  //is the source of awareness updates.
  openNodes: (number | string)[];
}

interface IProps {
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
      lightTheme,
      selectedNode: null,
      clientId: null,
      id: uuid(),
      openNodes: []
    };
    this.props.cpModel.jcadModel?.sharedObjectsChanged.connect(
      this._sharedJcadModelChanged
    );
    this.props.cpModel.documentChanged.connect((_, document) => {
      if (document) {
        this.props.cpModel.disconnect(this._sharedJcadModelChanged);
        this.props.cpModel.disconnect(this._handleThemeChange);
        this.props.cpModel.disconnect(this._onClientSharedStateChanged);

        document.context.model.sharedObjectsChanged.connect(
          this._sharedJcadModelChanged
        );
        document.context.model.themeChanged.connect(this._handleThemeChange);
        document.context.model.clientStateChanged.connect(
          this._onClientSharedStateChanged
        );
        document.context.model.sharedOptionsChanged.connect(
          this._onClientSharedOptionsChanged
        );

        this.setState(old => ({
          ...old,
          filePath: document.context.localPath,
          jcadObject: this.props.cpModel.jcadModel?.getAllObject(),
          options: this.props.cpModel.sharedModel?.options,
          clientId: document.context.model.getClientId()
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

  private _handleThemeChange = (): void => {
    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';
    this.setState(old => ({ ...old, lightTheme }));
  };

  private _sharedJcadModelChanged = (
    sender: IJupyterCadDoc,
    change: IJcadObjectDocChange
  ): void => {
    if (change.objectChange) {
      this.setState(old => ({
        ...old,
        jcadObject: this.props.cpModel.jcadModel?.getAllObject(),
        options: this.props.cpModel.sharedModel?.options
      }));
    }
  };

  private _onClientSharedStateChanged = (
    sender: IJupyterCadModel,
    clients: Map<number, IJupyterCadClientState>
  ): void => {
    const localState = this.props.cpModel.jcadModel?.localState;

    if (!localState) {
      return;
    }

    let selectedNode: string | null = null;
    if (localState.remoteUser) {
      // We are in following mode.
      // Sync selections from a remote user
      const remoteState = clients.get(localState.remoteUser);

      if (remoteState?.selected?.value) {
        selectedNode = remoteState?.selected?.value;
      }
    } else if (localState.selected.value) {
      selectedNode = localState.selected.value;
    }

    const openNodes = [...this.state.openNodes];

    if (selectedNode && openNodes.indexOf(selectedNode) === -1) {
      openNodes.push(selectedNode);
    }

    this.setState(old => ({ ...old, openNodes, selectedNode }));
  };

  private _onClientSharedOptionsChanged = (
    sender: IJupyterCadDoc,
    clients: any
  ): void => {
    this.setState(old => ({ ...old, options: sender.options }));
  };

  render(): React.ReactNode {
    const { selectedNode, openNodes, options } = this.state;
    const data = this.stateToTree();

    let selectedNodes: (number | string)[] = [];
    if (selectedNode) {
      const parentNode = data.filter(node => node.id === selectedNode);
      if (parentNode.length > 0 && parentNode[0].items.length > 0) {
        selectedNodes = [parentNode[0].items[0].id];
      }
    }

    return (
      <div className="jpcad-treeview-wrapper">
        <ReactTree
          nodes={data}
          openNodes={openNodes}
          selectedNodes={selectedNodes}
          messages={{ noData: 'No data' }}
          theme={'labTheme'}
          themes={TREE_THEMES}
          onToggleSelectedNodes={id => {
            if (id && id.length > 0) {
              let name = id[0] as string;

              if (name.includes('#')) {
                name = name.split('#')[0];
                this.props.cpModel.jcadModel?.syncSelectedObject(
                  name,
                  this.state.id
                );
                return;
              }

              const openNodes = [...this.state.openNodes];
              const index = openNodes.indexOf(name);

              if (index !== -1) {
                openNodes.splice(index, 1);
              } else {
                openNodes.push(name);
              }
              this.setState(old => ({ ...old, openNodes }));
            } else {
              this.props.cpModel.jcadModel?.syncSelectedObject(undefined);
            }
          }}
          RenderNode={opts => {
            // const paddingLeft = 25 * (opts.level + 1);
            const jcadObj = this.getObjectFromName(
              opts.node.parentId as string
            );
            let visible = true;
            if (
              jcadObj &&
              options &&
              options['guidata'] &&
              options['guidata'][jcadObj?.name]
            ) {
              visible = options['guidata'][jcadObj?.name]!['visibility'];
            }
            return (
              <div
                className={`jpcad-control-panel-tree ${
                  opts.selected ? 'selected' : ''
                }`}
              >
                <div
                  style={{
                    paddingLeft: '5px',
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
                    {opts.node.label}
                  </span>
                  {opts.type === 'leaf' ? (
                    <div style={{ display: 'flex' }}>
                      <ToolbarButtonComponent
                        className={'jp-ToolbarButtonComponent'}
                        onClick={() => {
                          const objectId = opts.node.parentId as string;
                          const guidata =
                            this.props.cpModel.sharedModel?.getOption(
                              'guidata'
                            ) || { objectId: {} };
                          if (guidata) {
                            if (guidata[objectId]) {
                              guidata[objectId]['visibility'] = !visible;
                            } else {
                              guidata[objectId] = { visibility: !visible };
                            }
                          }
                          this.props.cpModel.sharedModel?.setOption(
                            'guidata',
                            guidata
                          );
                        }}
                        icon={visible ? visibilityIcon : visibilityOffIcon}
                      />
                      <ToolbarButtonComponent
                        className={'jp-ToolbarButtonComponent'}
                        onClick={() => {
                          const objectId = opts.node.parentId as string;
                          this.props.cpModel.jcadModel?.sharedModel.removeObjectByName(
                            objectId
                          );
                          this.props.cpModel.jcadModel?.syncSelectedObject(
                            undefined
                          );
                        }}
                        icon={closeIcon}
                      />
                    </div>
                  ) : null}
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
