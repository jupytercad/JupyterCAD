import { IJupyterCadDoc, JupyterCadModel } from '@jupytercad/schema';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { Contents } from '@jupyterlab/services';
import { JupyterCadStlDoc } from './model';

class JupyterCadStlModel extends JupyterCadModel {
  fromString(data: string): void {
    (this.sharedModel as JupyterCadStlDoc).source = data;
    this.dirty = true;
  }

  protected createSharedModel(): IJupyterCadDoc {
    return JupyterCadStlDoc.create();
  }
}

/**
 * A Model factory to create new instances of JupyterCadSTLModel.
 */
export class JupyterCadStlModelFactory
  implements DocumentRegistry.IModelFactory<JupyterCadStlModel>
{
  /**
   * Whether the model is collaborative or not.
   */
  readonly collaborative = true;

  /**
   * The name of the model.
   *
   * @returns The name
   */
  get name(): string {
    return 'jupytercad-stlmodel';
  }

  /**
   * The content type of the file.
   *
   * @returns The content type
   */
  get contentType(): Contents.ContentType {
    return 'stl';
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
   * Create a new instance of JupyterCadSTLModel.
   *
   * @returns The model
   */
  createNew(
    options: DocumentRegistry.IModelOptions<IJupyterCadDoc>
  ): JupyterCadStlModel {
    const model = new JupyterCadStlModel({
      sharedModel: options.sharedModel,
      languagePreference: options.languagePreference
    });
    return model;
  }

  private _disposed = false;
}
