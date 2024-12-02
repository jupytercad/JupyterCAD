import { Dialog, showDialog } from '@jupyterlab/apputils';
import { User } from '@jupyterlab/services';
import {
  checkIcon,
  closeIcon,
  ToolbarButtonComponent
} from '@jupyterlab/ui-components';
import {
  ReactTree,
  TreeNodeList,
  useReactTreeApi
} from '@naisutech/react-tree';
import * as React from 'react';

import { TREE_THEMES } from '../panelview/objecttree';
import { chevronRightIcon, visibilityIcon, visibilityOffIcon } from '../tools';
import { SuggestionModel } from './model';

interface ISuggestionProps {
  model: SuggestionModel;
}

export const Suggestion = (props: ISuggestionProps): JSX.Element => {
  const [currentForkId, setCurrentForkId] = React.useState<
    string | undefined
  >();
  const [forkData, setForkData] = React.useState<TreeNodeList>([
    { id: 'root', label: props.model.title, parentId: null, items: [] }
  ]);
  const treeApi = useReactTreeApi();
  const updateFork = React.useCallback(() => {
    const allForks = props.model.allForks;
    const newState = [...forkData];
    newState[0] = {
      ...forkData[0],
      label: props.model.title,
      items: Object.entries(allForks).map(([key, val]) => ({
        id: key,
        label: val.title && val.title.length ? val.title : key,
        parentId: 'root',
        rootRoomId: val.root_roomid,
        metadata: JSON.parse(val.description ?? '{}')
      }))
    };
    setForkData(newState);
  }, [props.model, forkData]);
  React.useEffect(() => {
    props.model.contextChanged.connect(updateFork);
    props.model.forksUpdated.connect(updateFork);
    props.model.forkSwitched.connect((_, newForkId) => {
      setCurrentForkId(newForkId);
      if (!newForkId && treeApi.current) {
        treeApi.current.toggleAllNodesSelectedState('unselected');
      }
    });
  }, [props.model, updateFork, treeApi]);

  const acceptSuggestion = React.useCallback(
    async (forkId: string) => {
      const { button } = await showDialog({
        title: 'Accept suggestion',
        body: 'Do you want to merge content of the suggestion?',
        buttons: [Dialog.cancelButton(), Dialog.okButton()],
        hasClose: true
      });
      if (button.accept) {
        await props.model.mergeFork(forkId);
      }
    },
    [props.model]
  );

  const deleteSuggestion = React.useCallback(
    async (forkId: string) => {
      const { button } = await showDialog({
        title: 'Delete suggestion',
        body: 'Do you want to delete the suggestion?',
        buttons: [Dialog.cancelButton(), Dialog.okButton()],
        hasClose: true
      });
      if (button.accept) {
        await props.model.deleteFork(forkId);
      }
    },
    [props.model]
  );
  return (
    <div className="jcad-Suggestion">
      <div className="jpcad-treeview-wrapper">
        <ReactTree
          ref={treeApi}
          multiSelect={false}
          nodes={forkData}
          messages={{ noData: 'No data' }}
          theme={'labTheme'}
          themes={TREE_THEMES}
          openNodes={['root']}
          RenderIcon={opts => {
            if (opts.type === 'node') {
              return (
                <chevronRightIcon.react className="jcad-suggestion-tree-node-icon" />
              );
            }
          }}
          RenderNode={opts => {
            const metadata = (opts.node as any)?.metadata;
            const userData: User.IIdentity | undefined = metadata?.author;

            return (
              <div
                className={`jpcad-control-panel-suggestion ${
                  currentForkId === opts.node.id ? 'selected' : ''
                }`}
              >
                <div title={metadata?.timestamp ?? ''}>
                  {opts.type === 'leaf' && (
                    <div
                      title={`Created at: ${userData?.display_name ?? ''}`}
                      className={'jcad-suggestion-tree-node-user'}
                      style={{ backgroundColor: userData?.color ?? '#999999' }}
                    >
                      <span>{userData?.initials ?? ''}</span>
                    </div>
                  )}
                  <span className="jcad-suggestion-tree-node-label">
                    {opts.node.label}
                  </span>
                  {opts.type === 'leaf' && (
                    <div style={{ display: 'flex' }}>
                      <ToolbarButtonComponent
                        className={'jp-ToolbarButtonComponent'}
                        onClick={async () => {
                          setCurrentForkId(opts.node.id as string);
                          await props.model.checkoutFork(
                            opts.node.id as string
                          );
                        }}
                        icon={
                          currentForkId === opts.node.id
                            ? visibilityIcon
                            : visibilityOffIcon
                        }
                        tooltip="Preview suggestion"
                      />
                      <ToolbarButtonComponent
                        className={'jp-ToolbarButtonComponent'}
                        onClick={async () =>
                          await acceptSuggestion(opts.node.id as string)
                        }
                        icon={checkIcon}
                        tooltip="Accept suggestion"
                      />
                      <ToolbarButtonComponent
                        className={'jp-ToolbarButtonComponent'}
                        onClick={async () =>
                          await deleteSuggestion(opts.node.id as string)
                        }
                        icon={closeIcon}
                        tooltip="Delete suggestion"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
