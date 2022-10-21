import * as React from 'react';

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
import { IControlPanelModel, IDict, IJupyterCadDocChange } from '../types';

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
  lightTheme: boolean;
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
          messages={{ noData: 'No data' }}
          theme={'labTheme'}
          themes={TREE_THEMES}
          onToggleSelectedNodes={id => {
            if (id && id.length > 0) {
              this.props.cpModel.set('activatedObject', id[0]);
            }
          }}
          RenderNode={options => {
            // const paddingLeft = 25 * (options.level + 1);
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
                    {options.node.label}
                  </span>
                  {options.type === 'leaf' ? (
                    <div style={{ display: 'flex' }}>
                      <ToolbarButtonComponent
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
                        icon={visible ? visibilityIcon : visibilityOffIcon}
                      />
                      {/* <span className="jp-ToolbarButtonComponent-label">
                        {visible ? 'Hide' : 'Show'}
                      </span> */}
                      {/* </ToolbarButtonComponent> */}
                      <ToolbarButtonComponent
                        className={'jp-ToolbarButtonComponent'}
                        onClick={() => {
                          const objectId = options.node.parentId as string;
                          this.props.cpModel.jcadModel?.sharedModel.removeObjectByName(
                            objectId
                          );
                          this.props.cpModel.set('activatedObject', '');
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
