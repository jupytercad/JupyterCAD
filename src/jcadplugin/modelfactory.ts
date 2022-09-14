import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IModelDB } from '@jupyterlab/observables';
import { Contents } from '@jupyterlab/services';

import { JupyterCadModel } from '../model';

/**
 * A Model factory to create new instances of JupyterCadModel.
 */
export class JupyterCadJcadModelFactory
  implements DocumentRegistry.IModelFactory<JupyterCadModel>
{
  /**
   * The name of the model.
   *
   * @returns The name
   */
  get name(): string {
    return 'jupytercad-jcadmodel';
  }

  /**
   * The content type of the file.
   *
   * @returns The content type
   */
  get contentType(): Contents.ContentType {
    return 'jcad';
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
