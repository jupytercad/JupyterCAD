import { DocumentRegistry } from '@jupyterlab/docregistry';
import { Contents } from '@jupyterlab/services';

import { IAnnotationModel } from '../types';
import { JupyterCadModel } from '../model';

/**
 * A Model factory to create new instances of JupyterCadModel.
 */
export class JupyterCadFCModelFactory
  implements DocumentRegistry.IModelFactory<JupyterCadModel>
{
  constructor(options: JupyterCadFCModelFactory.IOptions) {
    this._annotationModel = options.annotationModel;
  }

  /**
   * The name of the model.
   *
   * @returns The name
   */
  get name(): string {
    return 'jupytercad-fcmodel';
  }

  /**
   * The content type of the file.
   *
   * @returns The content type
   */
  get contentType(): Contents.ContentType {
    return 'FCStd';
  }

  /**
   * The format of the file.
   *
   * @returns the file format
   */
  get fileFormat(): Contents.FileFormat {
    return 'base64';
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
  createNew(
    languagePreference?: string | undefined,
    collaborationEnabled?: boolean | undefined
  ): JupyterCadModel {
    const model = new JupyterCadModel(
      this._annotationModel,
      languagePreference
    );
    return model;
  }

  private _annotationModel: IAnnotationModel;
  private _disposed = false;
}

export namespace JupyterCadFCModelFactory {
  export interface IOptions {
    annotationModel: IAnnotationModel;
  }
}
