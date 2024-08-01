import {
  IJCadWorkerRegistry,
  IJupyterCadModel,
  IJupyterCadWidget
} from '@jupytercad/schema';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { IObservableMap, ObservableMap } from '@jupyterlab/observables';
import { JSONValue } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { SplitPanel } from '@lumino/widgets';

import { JupyterCadMainViewPanel } from './3dview';
import { MainViewModel } from './3dview/mainviewmodel';
import { AxeHelper, CameraSettings, ClipSettings, ExplodedView } from './types';
import { ConsoleView } from './console';

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
    const { model, workerRegistry, ...consoleOption } = options;
    this._initModel({ model, workerRegistry });
    this._initView(consoleOption);
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

  _initView(consoleOption: Partial<ConsoleView.IOptions>) {
    this._jupyterCadMainViewPanel = new JupyterCadMainViewPanel({
      mainViewModel: this._mainViewModel
    });
    this.addWidget(this._jupyterCadMainViewPanel);
    SplitPanel.setStretch(this._jupyterCadMainViewPanel, 1);

    const {
      contentFactory,
      manager,
      mimeTypeService,
      rendermime,
      executor,
      consoleTracker
    } = consoleOption;
    if (
      contentFactory &&
      manager &&
      mimeTypeService &&
      rendermime &&
      executor &&
      consoleTracker
    ) {
      this._consoleView = new ConsoleView({
        contentFactory,
        manager,
        mimeTypeService,
        rendermime,
        executor,
        consoleTracker
      });
      this.addWidget(this._consoleView);
      SplitPanel.setStretch(this._consoleView, 1);
    }
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

  deleteAxes(): void {
    this._view.delete('axes');
  }

  executeConsole() {
    this._consoleView.execute();
  }

  private _mainViewModel: MainViewModel;
  private _view: ObservableMap<JSONValue>;
  private _jupyterCadMainViewPanel: JupyterCadMainViewPanel;
  private _consoleView: ConsoleView;
}

export namespace JupyterCadPanel {
  export interface IOptions extends Partial<ConsoleView.IOptions> {
    model: IJupyterCadModel;
    workerRegistry: IJCadWorkerRegistry;
  }
}
