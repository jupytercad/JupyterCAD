import { MainAreaWidget } from '@jupyterlab/apputils';
import {
  IJCadWorkerRegistry,
  IJupyterCadModel,
  IJupyterCadDocumentWidget,
  IJupyterCadOutputWidget
} from '@jupytercad/schema';
import { ConsolePanel, IConsoleTracker } from '@jupyterlab/console';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { IObservableMap, ObservableMap } from '@jupyterlab/observables';
import { JSONValue } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { SplitPanel, Widget } from '@lumino/widgets';
import { JupyterCadMainViewPanel } from './3dview';
import { MainViewModel } from './3dview/mainviewmodel';
import { ConsoleView } from './console';
import {
  AxeHelper,
  CameraSettings,
  ClipSettings,
  ExplodedView,
  SplitScreenSettings
} from './types';
import { MessageLoop } from '@lumino/messaging';

const CELL_OUTPUT_WIDGET_CLASS = 'jcad-cell-output-widget';

export type JupyterCadWidget =
  | JupyterCadDocumentWidget
  | JupyterCadOutputWidget;
export class JupyterCadDocumentWidget
  extends DocumentWidget<JupyterCadPanel, IJupyterCadModel>
  implements IJupyterCadDocumentWidget
{
  constructor(
    options: DocumentWidget.IOptions<JupyterCadPanel, IJupyterCadModel>
  ) {
    super(options);
  }

  get model(): IJupyterCadModel {
    return this.context.model;
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

/**
 * A main area widget designed to be used as Notebook cell output widget, to ease the
 * integration of toolbar and tracking.
 */
export class JupyterCadOutputWidget
  extends MainAreaWidget<JupyterCadPanel>
  implements IJupyterCadOutputWidget
{
  constructor(options: JupyterCadOutputWidget.IOptions) {
    super(options);
    this.addClass(CELL_OUTPUT_WIDGET_CLASS);
    this.model = options.model;

    this.resizeObserver = new ResizeObserver(() => {
      // Send a resize message to the widget, to update the child size.
      MessageLoop.sendMessage(this, Widget.ResizeMessage.UnknownSize);
    });
    this.resizeObserver.observe(this.node);

    this.model.disposed.connect(() => this.dispose());
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (!this.isDisposed) {
      this.resizeObserver.disconnect();
      this.content.dispose();
      super.dispose();
    }
  }

  readonly model: IJupyterCadModel;
  readonly resizeObserver: ResizeObserver;
}

export namespace JupyterCadOutputWidget {
  export interface IOptions extends MainAreaWidget.IOptions<JupyterCadPanel> {
    model: IJupyterCadModel;
  }
}

export class JupyterCadPanel extends SplitPanel {
  constructor(options: JupyterCadPanel.IOptions) {
    super({ orientation: 'vertical', spacing: 0 });
    const { model, workerRegistry, consoleTracker, ...consoleOption } = options;
    this._initModel({ model, workerRegistry });
    this._initView();
    this._consoleOption = consoleOption;
    this._consoleTracker = consoleTracker;
  }

  _initModel(options: {
    model: IJupyterCadModel;
    workerRegistry: IJCadWorkerRegistry;
  }) {
    this._view = new ObservableMap<JSONValue>({});
    const cameraSettings: CameraSettings = { type: 'Perspective' };
    const axes: AxeHelper = { visible: false };
    this._view.set('cameraSettings', cameraSettings);
    const explodedView: ExplodedView = { enabled: false, factor: 0 };
    this._view.set('explodedView', explodedView);
    this._view.set('axes', axes);
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

  get axes(): AxeHelper {
    return this._view.get('axes') as AxeHelper;
  }

  set axes(value: AxeHelper) {
    this._view.set('axes', value);
  }

  get explodedView(): ExplodedView {
    return this._view.get('explodedView') as ExplodedView;
  }

  set explodedView(value: ExplodedView) {
    this._view.set('explodedView', value);
  }

  get cameraSettings(): CameraSettings {
    return this._view.get('cameraSettings') as CameraSettings;
  }

  set cameraSettings(value: CameraSettings) {
    this._view.set('cameraSettings', value);
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

  get splitScreen(): SplitScreenSettings | undefined {
    return (this._view.get('splitScreen') ?? {
      enabled: false
    }) as SplitScreenSettings;
  }

  set splitScreen(value: SplitScreenSettings | undefined) {
    this._view.set('splitScreen', value || null);
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

  get transform(): boolean {
    return this._view.get('transform') as boolean;
  }

  set transform(value: boolean) {
    this._view.set('transform', value);
  }

  get consoleOpened(): boolean {
    return this._consoleOpened;
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
        this.addWidget(this._consoleView);
        this.setRelativeSizes([2, 1]);
        this._consoleOpened = true;
        await consolePanel.console.inject(
          `from jupytercad import CadDocument\ndoc = CadDocument("${jcadPath}")`
        );
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
  }
}
