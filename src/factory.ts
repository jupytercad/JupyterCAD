import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { IModelDB } from '@jupyterlab/observables';
import { Contents } from '@jupyterlab/services';

import { JupyterCadModel } from './model';
import { JupyterCadPanel, JupyterCadWidget } from './widget';

export class JupyterCadWidgetFactory extends ABCWidgetFactory<
  JupyterCadWidget,
  JupyterCadModel
> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
  }

  /**
   * Create a new widget given a context.
   *
   * @param context Contains the information of the file
   * @returns The widget
   */
  protected createNewWidget(
    context: DocumentRegistry.IContext<JupyterCadModel>
  ): JupyterCadWidget {
    return new JupyterCadWidget({
      context,
      content: new JupyterCadPanel(context)
    });
  }
}

/**
 * A Model factory to create new instances of JupyterCadModel.
 */
export class JupyterCadModelFactory
  implements DocumentRegistry.IModelFactory<JupyterCadModel>
{
  /**
   * The name of the model.
   *
   * @returns The name
   */
  get name(): string {
    return 'jupytercad-model';
  }

  /**
   * The content type of the file.
   *
   * @returns The content type
   */
  get contentType(): Contents.ContentType {
    return 'file';
  }

  /**
   * The format of the file.
   *
   * @returns the file format
   */
  get fileFormat(): Contents.FileFormat {
    return 'text';
  }

  /**
   * Get whether the model factory has been disposed.
   *
   * @returns disposed status
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose the model factory.
   */
  dispose(): void {
    this._disposed = true;
  }

  /**
   * Get the preferred language given the path on the file.
   *
   * @param path path of the file represented by this document model
   * @returns The preferred language
   */
  preferredLanguage(path: string): string {
    return '';
  }

  /**
   * Create a new instance of JupyterCadModel.
   *
   * @param languagePreference Language
   * @param modelDB Model database
   * @returns The model
   */
  createNew(languagePreference?: string, modelDB?: IModelDB): JupyterCadModel {
    const model = new JupyterCadModel(languagePreference, modelDB);
    return model;
  }

  private _disposed = false;
}
