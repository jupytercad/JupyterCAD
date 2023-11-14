import { IDocumentWidget } from '@jupyterlab/docregistry';
import { ReactWidget } from '@jupyterlab/ui-components';
import { ISignal } from '@lumino/signaling';
import { IJupyterCadModel, IJupyterCadDoc, IDict } from '@jupytercad/schema';
import { IJupyterCadTracker } from './token';

export { IDict };
export type ValueOf<T> = T[keyof T];

/**
 * Axe's dimensions
 */
export type AxeHelper = {
  size: number;
  visible: boolean;
};

/**
 * The state of the exploded view
 */
export type ExplodedView = {
  enabled: boolean;
  factor: number;
};

/**
 * The state of the camera
 */
export type CameraSettings = {
  type: 'Perspective' | 'Orthographic';
};

export type IJupyterCadWidget = IDocumentWidget<ReactWidget, IJupyterCadModel>;

export interface IControlPanelModel {
  disconnect(f: any): void;
  documentChanged: ISignal<IJupyterCadTracker, IJupyterCadWidget | null>;
  filePath: string | undefined;
  jcadModel: IJupyterCadModel | undefined;
  sharedModel: IJupyterCadDoc | undefined;
}
