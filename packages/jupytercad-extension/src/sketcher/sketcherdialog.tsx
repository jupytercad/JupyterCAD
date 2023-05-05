import { Dialog } from '@jupyterlab/apputils';
import * as React from 'react';
import { IDict, IJupyterCadDoc } from '../types';
import { SketcherModel } from './sketchermodel';
import { SketcherReactWidget } from './sketcherwidget';

export interface ISketcherDialogOptions {
  sharedModel: IJupyterCadDoc;
  closeCallback: { handler: () => void };
}

export class SketcherDialog extends Dialog<IDict> {
  constructor(options: ISketcherDialogOptions) {
    const model = new SketcherModel({
      gridSize: 64,
      sharedModel: options.sharedModel
    });
    const body = (
      <SketcherReactWidget
        model={model}
        closeCallback={options.closeCallback}
      />
    );
    super({ title: 'Sketcher', body, buttons: [], hasClose: false });
    this.addClass('jpcad-sketcher-SketcherDialog');
  }
}
