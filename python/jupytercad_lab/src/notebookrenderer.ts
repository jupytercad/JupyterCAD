import { ICollaborativeDrive } from '@jupyter/collaborative-drive';
import {
  JupyterCadPanel,
  JupyterCadOutputWidget,
  ToolbarWidget,
  JupyterCadTracker
} from '@jupytercad/base';
import {
  IJCadWorkerRegistry,
  IJCadWorkerRegistryToken,
  IJCadExternalCommandRegistry,
  IJCadExternalCommandRegistryToken,
  IJupyterCadDocTracker,
  IJupyterCadDoc,
  JupyterCadModel
} from '@jupytercad/schema';

import { showErrorMessage } from '@jupyterlab/apputils';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Contents } from '@jupyterlab/services';
import { MessageLoop } from '@lumino/messaging';
import { Panel, Widget } from '@lumino/widgets';
import {
  IJupyterYWidget,
  IJupyterYWidgetManager,
  JupyterYModel,
  JupyterYDoc
} from 'yjs-widgets';
import { Toolbar } from '@jupyterlab/ui-components';
import { ConsolePanel } from '@jupyterlab/console';
import { PathExt } from '@jupyterlab/coreutils';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CommandRegistry } from '@lumino/commands';

export interface ICommMetadata {
  create_ydoc: boolean;
  path: string;
  format: string;
  contentType: string;
  ymodel_name: string;
}

export const CLASS_NAME = 'jupytercad-notebook-widget';

export class YJupyterCADModel extends JupyterYModel {
  jupyterCADModel: JupyterCadModel;
}

export class YJupyterCADLuminoWidget extends Panel {
  constructor(options: IOptions) {
    super();

    const { model } = options;

    this.addClass(CLASS_NAME);
    this._buildWidget(options);

    // If the filepath was not set when building the widget, the toolbar is not built.
    // The widget has to be built again to include the toolbar.
    const onchange = (_: any, args: any) => {
      if (args.stateChange) {
        args.stateChange.forEach((change: any) => {
          if (change.name === 'path') {
            this.layout?.removeWidget(this._jcadWidget);
            this._jcadWidget.dispose();
            this._buildWidget(options);
          }
        });
      }
    };

    model.sharedModel.changed.connect(onchange);
  }

  onResize = (): void => {
    if (this._jcadWidget) {
      MessageLoop.sendMessage(
        this._jcadWidget,
        Widget.ResizeMessage.UnknownSize
      );
    }
  };

  get jcadWidget(): JupyterCadOutputWidget {
    return this._jcadWidget;
  }

  /**
   * Build the widget and add it to the panel.
   * @param options
   */
  private _buildWidget = (options: IOptions) => {
    const { commands, workerRegistry, model, externalCommands, tracker } =
      options;
    const content = new JupyterCadPanel({
      model: model,
      workerRegistry: workerRegistry as IJCadWorkerRegistry
    });
    let toolbar: Toolbar | undefined = undefined;

    if (model.filePath) {
      toolbar = new ToolbarWidget({
        commands,
        model,
        externalCommands: externalCommands?.getCommands() || []
      });
    }
    this._jcadWidget = new JupyterCadOutputWidget({
      model,
      content,
      toolbar
    });
    this.addWidget(this._jcadWidget);
    tracker?.add(this._jcadWidget);
  };

  private _jcadWidget: JupyterCadOutputWidget;
}

interface IOptions {
  commands: CommandRegistry;
  workerRegistry?: IJCadWorkerRegistry;
  model: JupyterCadModel;
  externalCommands?: IJCadExternalCommandRegistry;
  tracker?: JupyterCadTracker;
}

export const notebookRenderePlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:yjswidget-plugin',
  autoStart: true,
  requires: [IJCadWorkerRegistryToken],
  optional: [
    IJCadExternalCommandRegistryToken,
    IJupyterCadDocTracker,
    IJupyterYWidgetManager,
    ICollaborativeDrive
  ],
  activate: (
    app: JupyterFrontEnd,
    workerRegistry: IJCadWorkerRegistry,
    externalCommandRegistry?: IJCadExternalCommandRegistry,
    jcadTracker?: JupyterCadTracker,
    yWidgetManager?: IJupyterYWidgetManager,
    drive?: ICollaborativeDrive
  ): void => {
    if (!yWidgetManager) {
      console.error('Missing IJupyterYWidgetManager token!');
      return;
    }

    class YJupyterCADModelFactory extends YJupyterCADModel {
      protected async initialize(commMetadata: {
        [key: string]: any;
      }): Promise<void> {
        const { path, format, contentType } = commMetadata;
        const fileFormat = format as Contents.FileFormat;

        if (!drive) {
          showErrorMessage(
            'Error using the JupyterCAD Python API',
            'You cannot use the JupyterCAD Python API without a collaborative drive. You need to install a package providing collaboration features (e.g. jupyter-collaboration).'
          );
          throw new Error(
            'Failed to create the YDoc without a collaborative drive'
          );
        }

        // The path of the project is relative to the path of the notebook
        let currentWidgetPath = '';
        const currentWidget = app.shell.currentWidget;
        if (
          currentWidget instanceof NotebookPanel ||
          currentWidget instanceof ConsolePanel
        ) {
          currentWidgetPath = currentWidget.sessionContext.path;
        }

        let localPath = '';
        if (path) {
          localPath = PathExt.join(PathExt.dirname(currentWidgetPath), path);

          // If the file does not exist yet, create it
          try {
            await app.serviceManager.contents.get(localPath);
          } catch (e) {
            await app.serviceManager.contents.save(localPath, {
              content: btoa('{}'),
              format: 'base64'
            });
          }
        } else {
          // If the user did not provide a path, do not create
          localPath = PathExt.join(
            PathExt.dirname(currentWidgetPath),
            'unsaved_project'
          );
        }

        const sharedModel = drive!.sharedModelFactory.createNew({
          path: localPath,
          format: fileFormat,
          contentType,
          collaborative: true
        })!;
        const jupyterCadDoc = sharedModel as IJupyterCadDoc;
        this.jupyterCADModel = new JupyterCadModel({
          sharedModel: jupyterCadDoc
        });

        this.jupyterCADModel.contentsManager = app.serviceManager.contents;
        this.jupyterCADModel.filePath = localPath;

        this.ydoc = this.jupyterCADModel.sharedModel.ydoc;
        this.sharedModel = new JupyterYDoc(commMetadata, this.ydoc);
      }
    }

    class YJupyterCadOutputwidget implements IJupyterYWidget {
      constructor(yModel: YJupyterCADModel, node: HTMLElement) {
        this.yModel = yModel;
        this.node = node;

        const widget = new YJupyterCADLuminoWidget({
          commands: app.commands,
          externalCommands: externalCommandRegistry,
          model: yModel.jupyterCADModel,
          workerRegistry: workerRegistry,
          tracker: jcadTracker
        });
        // Widget.attach(widget, node);

        MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
        node.appendChild(widget.node);
        MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
      }

      readonly yModel: YJupyterCADModel;
      readonly node: HTMLElement;
    }

    yWidgetManager.registerWidget(
      '@jupytercad:widget',
      YJupyterCADModelFactory,
      YJupyterCadOutputwidget
    );
  }
};
