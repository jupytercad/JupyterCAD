import { JupyterCadFCModelFactory } from './../fcplugin/modelfactory';
import { IAnnotationModel } from '../types';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { createRendermimePlugin } from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { Context, MimeDocument } from '@jupyterlab/docregistry';
import { ServiceManager } from '@jupyterlab/services';
import { IAnnotation } from './../token';
import { JupyterCadPanel, JupyterCadWidget } from '../widget';
import { MessageLoop } from '@lumino/messaging';

const MIME_TYPE = 'application/FCStd';

const CLASS_NAME = 'mimerenderer-jupytercad';

export class OutputWidget extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(
    private manager: ServiceManager.IManager,
    private annotationModel: IAnnotationModel,
    options: IRenderMime.IRendererOptions
  ) {
    super();
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const path = model.data[this._mimeType] as string;
    const factory = new JupyterCadFCModelFactory({
      annotationModel: this.annotationModel
    });
    const context = new Context({ manager: this.manager, path, factory });
    const content = new JupyterCadPanel(context);

    const widget = new JupyterCadWidget({ context, content });
    MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    this.node.appendChild(widget.node);
    MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
    return Promise.resolve();
  }

  private _mimeType: string;
}

/**
 * Extension definition.
 */
const notebookRendererPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupytercad:notebookRenderer',
  autoStart: true,
  requires: [IRenderMimeRegistry, IAnnotation],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    annotationModel: IAnnotationModel
  ) => {
    const rendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: options =>
        new OutputWidget(app.serviceManager, annotationModel, options)
    };
    const namespace = 'jupytercad-mimedocuments';
    const tracker = new WidgetTracker<MimeDocument>({ namespace });
    const extension: IRenderMime.IExtension = {
      id: 'jupytercad:notebookRenderer',
      rendererFactory,
      rank: 1000,
      dataType: 'string'
    };
    const mimePlugin = createRendermimePlugin(tracker, extension);

    mimePlugin.activate(app, rendermime);
  }
};

export default notebookRendererPlugin;
