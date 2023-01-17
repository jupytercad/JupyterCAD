import {
  IMimeDocumentTracker,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { createRendermimePlugin } from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { MimeDocument } from '@jupyterlab/docregistry';


const MIME_TYPE = 'application/FCStd';

const CLASS_NAME = 'mimerenderer-jupytercad';

export class OutputWidget extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const data = model.data[this._mimeType] as string;
    this.node.textContent = data.slice(0, 16384) + 'hello';
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
  requires: [IRenderMimeRegistry, IMimeDocumentTracker],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry
    // tracker: IMimeDocumentTracker
  ) => {
    const rendererFactory: IRenderMime.IRendererFactory = {
      safe: true,
      mimeTypes: [MIME_TYPE],
      createRenderer: options => new OutputWidget(options)
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
