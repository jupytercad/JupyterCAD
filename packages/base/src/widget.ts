import {
  IJCadWorkerRegistry,
  IJupyterCadModel,
  IJupyterCadWidget
} from '@jupytercad/schema';
import { ConsolePanel, IConsoleTracker } from '@jupyterlab/console';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { IObservableMap, ObservableMap } from '@jupyterlab/observables';
import { JSONValue } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { SplitPanel } from '@lumino/widgets';
import { JupyterCadMainViewPanel } from './3dview';
import { MainViewModel } from './3dview/mainviewmodel';
import { ConsoleView } from './console';
import { AxeHelper, CameraSettings, ClipSettings, ExplodedView } from './types';
import { WidgetTracker } from '@jupyterlab/apputils';

export class JupyterCadWidget
  extends DocumentWidget<JupyterCadPanel, IJupyterCadModel>
  implements IJupyterCadWidget
{
  constructor(
    options: DocumentWidget.IOptions<JupyterCadPanel, IJupyterCadModel>
  ) {
    super(options);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }

  onResize = (msg: any): void => {
    window.dispatchEvent(new Event('resize'));
  };
}

export class JupyterCadPanel extends SplitPanel {
  constructor(options: JupyterCadPanel.IOptions) {
    super({ orientation: 'vertical', spacing: 0 });
    const { model, workerRegistry, consoleTracker, ...consoleOption } = options;
    this._initModel({ model, workerRegistry });
    this._initView();
    this._consoleOption = consoleOption;
    this._consoleTracker = consoleTracker;
    this._syncEditor(options.tracker);
  }

  _initModel(options: {
    model: IJupyterCadModel;
    workerRegistry: IJCadWorkerRegistry;
  }) {
    this._view = new ObservableMap<JSONValue>();
    this._mainViewModel = new MainViewModel({
      jcadModel: options.model,
      workerRegistry: options.workerRegistry,
      viewSetting: this._view
    });
  }

  _initView() {
    this._jupyterCadMainViewPanel = new JupyterCadMainViewPanel({
      mainViewModel: this._mainViewModel
    });
    this.addWidget(this._jupyterCadMainViewPanel);
    SplitPanel.setStretch(this._jupyterCadMainViewPanel, 1);
  }

  private _syncEditor(tracker: WidgetTracker<IJupyterCadWidget>) {
    tracker.currentChanged.connect(() => {
      const currentWidget = tracker.currentWidget;

      if (currentWidget) {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }
    });
  }

  get jupyterCadMainViewPanel(): JupyterCadMainViewPanel {
    return this._jupyterCadMainViewPanel;
  }

  get viewChanged(): ISignal<
    ObservableMap<JSONValue>,
    IObservableMap.IChangedArgs<JSONValue>
  > {
    return this._view.changed;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    if (this._consoleView) {
      this._consoleView.dispose();
    }
    Signal.clearData(this);
    this._mainViewModel.dispose();
    super.dispose();
  }

  get currentViewModel(): MainViewModel {
    return this._mainViewModel;
  }

  get axes(): AxeHelper | undefined {
    return this._view.get('axes') as AxeHelper | undefined;
  }

  set axes(value: AxeHelper | undefined) {
    this._view.set('axes', value || null);
  }

  get explodedView(): ExplodedView | undefined {
    return this._view.get('explodedView') as ExplodedView | undefined;
  }

  set explodedView(value: ExplodedView | undefined) {
    this._view.set('explodedView', value || null);
  }

  get cameraSettings(): CameraSettings | undefined {
    return this._view.get('cameraSettings') as CameraSettings | undefined;
  }

  set cameraSettings(value: CameraSettings | undefined) {
    this._view.set('cameraSettings', value || null);
  }

  get clipView(): ClipSettings | undefined {
    return this._view.get('clipView') as ClipSettings | undefined;
  }

  set clipView(value: ClipSettings | undefined) {
    this._view.set('clipView', value || null);
  }

  get consolePanel(): ConsolePanel | undefined {
    return this._consoleView?.consolePanel;
  }

  deleteAxes(): void {
    this._view.delete('axes');
  }

  get wireframe(): boolean {
    return this._view.get('wireframe') as boolean;
  }

  set wireframe(value: boolean) {
    this._view.set('wireframe', value);
  }

  executeConsole() {
    if (this._consoleView) {
      this._consoleView.execute();
    }
  }

  removeConsole() {
    if (this._consoleView) {
      this._consoleView.dispose();
      this._consoleView = undefined;
      this._consoleOpened = false;
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 250);
    }
  }
  async toggleConsole(jcadPath: string) {
    if (!this._consoleView) {
      const {
        contentFactory,
        manager,
        mimeTypeService,
        rendermime,
        commandRegistry
      } = this._consoleOption;
      if (
        contentFactory &&
        manager &&
        mimeTypeService &&
        rendermime &&
        commandRegistry &&
        this._consoleTracker
      ) {
        this._consoleView = new ConsoleView({
          contentFactory,
          manager,
          mimeTypeService,
          rendermime,
          commandRegistry
        });
        const { consolePanel } = this._consoleView;

        (this._consoleTracker.widgetAdded as any).emit(consolePanel);
        await consolePanel.sessionContext.ready;
        await consolePanel.console.inject(
          `from jupytercad_lab import CadDocument\ndoc = CadDocument("${jcadPath}")`
        );
        this.addWidget(this._consoleView);
        this.setRelativeSizes([2, 1]);
        this._consoleOpened = true;
        consolePanel.console.sessionContext.kernelChanged.connect((_, arg) => {
          if (!arg.newValue) {
            this.removeConsole();
          }
        });
      }
    } else {
      if (this._consoleOpened) {
        this._consoleOpened = false;
        this.setRelativeSizes([1, 0]);
      } else {
        this._consoleOpened = true;
        this.setRelativeSizes([2, 1]);
      }
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 250);
  }

  private _mainViewModel: MainViewModel;
  private _view: ObservableMap<JSONValue>;
  private _jupyterCadMainViewPanel: JupyterCadMainViewPanel;
  private _consoleView?: ConsoleView;
  private _consoleOpened = false;
  private _consoleOption: Partial<ConsoleView.IOptions>;
  private _consoleTracker: IConsoleTracker | undefined;
}

export namespace JupyterCadPanel {
  export interface IOptions extends Partial<ConsoleView.IOptions> {
    model: IJupyterCadModel;
    workerRegistry: IJCadWorkerRegistry;
    consoleTracker?: IConsoleTracker;
    tracker: WidgetTracker<IJupyterCadWidget>;
  }
}
