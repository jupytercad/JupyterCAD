import {
  ConsolePanel,
  IConsoleCellExecutor,
  IConsoleTracker
} from '@jupyterlab/console';
import { ServiceManager } from '@jupyterlab/services';
import { BoxPanel } from '@lumino/widgets';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

export class ConsoleView extends BoxPanel {
  constructor(options: ConsoleView.IOptions) {
    super({ direction: 'top-to-bottom' });
    this.addClass('jpcad-console');
    const { manager, contentFactory, mimeTypeService, rendermime } = options;
    const clonedRendermime = rendermime.clone();
    this._consolePanel = new ConsolePanel({
      manager,
      contentFactory,
      mimeTypeService,
      rendermime: clonedRendermime
    });
    this._consolePanel.console.node.dataset.jpInteractionMode = 'notebook';
    this.addWidget(this._consolePanel);
    BoxPanel.setStretch(this._consolePanel, 1);
  }

  execute() {
    this._consolePanel.console.execute(true);
  }
  private _consolePanel: ConsolePanel;
}

export namespace ConsoleView {
  export interface IOptions {
    manager: ServiceManager.IManager;
    contentFactory: ConsolePanel.IContentFactory;
    mimeTypeService: IEditorMimeTypeService;
    rendermime: IRenderMimeRegistry;
    executor: IConsoleCellExecutor;
    consoleTracker: IConsoleTracker;
  }
}
