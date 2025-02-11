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

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Contents } from '@jupyterlab/services';
import { MessageLoop } from '@lumino/messaging';
import { Panel, Widget } from '@lumino/widgets';
import * as Y from 'yjs';
import {
  IJupyterYWidget,
  IJupyterYWidgetManager,
  JupyterYModel
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
    console.log('hi', options);

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
    console.log(options);

    const { commands, workerRegistry, model, externalCommands, tracker } =
      options;
    // Ensure the model filePath is relevant with the shared model path.
    if (model.sharedModel.getState('path')) {
      model.filePath = model.sharedModel.getState('path') as string;
    }
    const content = new JupyterCadPanel({
      model: model,
      workerRegistry: workerRegistry as IJCadWorkerRegistry
    });
    let toolbar: Toolbar | undefined = undefined;
    console.log(externalCommands);

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
    externalCommandRegistry?: IJCadExternalCommandRegistry,
    jcadTracker?: JupyterCadTracker,
    workerRegistry?: IJCadWorkerRegistry,
    yWidgetManager?: IJupyterYWidgetManager,
    drive?: ICollaborativeDrive
  ): void => {
    if (!yWidgetManager) {
      console.error('Missing IJupyterYWidgetManager token!');
      return;
    }
    if (!drive) {
      console.error('Missing ICollaborativeDrive token!');
      return;
    }
    class YJupyterCADModelFactory extends YJupyterCADModel {
      ydocFactory(commMetadata: ICommMetadata): Y.Doc {
        const { path, format, contentType } = commMetadata;
        const fileFormat = format as Contents.FileFormat;

        const sharedModel = drive!.sharedModelFactory.createNew({
          path,
          format: fileFormat,
          contentType,
          collaborative: true
        })!;
        const jupyterCadDoc = sharedModel as IJupyterCadDoc;
        this.jupyterCADModel = new JupyterCadModel({
          sharedModel: jupyterCadDoc
        });

        this.jupyterCADModel.contentsManager = app.serviceManager.contents;

        if (!sharedModel) {
          // The path of the project is set to the path of the notebook, to be able to
          // add local geoJSON/shape file in a "file-less" project.
          let currentWidgetPath: string | undefined = undefined;
          const currentWidget = app.shell.currentWidget;
          if (
            currentWidget instanceof NotebookPanel ||
            currentWidget instanceof ConsolePanel
          ) {
            currentWidgetPath = currentWidget.sessionContext.path;
          }

          if (currentWidgetPath) {
            this.jupyterCADModel.filePath = PathExt.join(
              PathExt.dirname(currentWidgetPath),
              'unsaved_project'
            );
          }
        }

        return this.jupyterCADModel.sharedModel.ydoc;
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
